import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Answer,
  Cheer,
  MaritalStatus,
  ParentProfile,
  PersistedDoc,
  SensitiveTopicId,
} from '@/domain/types';
import type {
  BookPreviewView,
  ChildHomeView,
  CheerView,
  FamilyView,
  LibraryProgressView,
  QuestionView,
  StoryView,
} from '@/domain/views';
import { newId } from '@/domain/ids';
import { dateKey } from '@/domain/views';
import { repository } from '@/services';
import { logEvent } from '@/services/log';
import { buildSeed } from '@/data/seed/initialState';
import { SENSITIVE_TOPICS } from '@/data/seed/content';
import { bankQuestionById } from '@/data/seed/questionBank';
import { alternateQuestion, resolveQuestion } from '@/services/pipeline/branching';
import { runNightly } from '@/services/pipeline/nightly';
import { assembleBook } from '@/services/pipeline/book';
import {
  childHomeView,
  familyView,
  latestAnswer,
  libraryProgress,
  pastStories,
  questionView,
  todayOrdinal,
} from '@/services/projections';
import type { FinishResult } from '@/features/recording/useRecorder';

/**
 * 앱 스토어 — 한 기기에서 부모·자녀 두 세계가 공유하는 단일 로컬 상태. (BE 소유)
 *
 * 권위 상태는 여기(React) + 영속화는 repository(DiaryRepository). 화면은 이 스토어의
 * 셀렉터 훅만 소비하고 저장 방식을 모른다 — local ↔ 실서버 교체가 화면에 새지 않는다.
 *
 * 쓰기 경로의 멱등·순서 가드(BE 규칙):
 *  - markAnswered: 같은 날 이미 답했으면 no-op(더블탭 방어).
 *  - runNightly: done이면 no-op(중복 실행·수동 트리거 중복 흡수).
 *  - writeAnswerIfNewer / parentCheer newest-wins: 낡은 비동기 결과가 새 상태를 덮지 못하게.
 */

/** 데모용 "밤사이" 지연 — 하루가 아니라 몇 초. 수동 트리거(runNightlyNow)도 함께 제공. */
const DEMO_NIGHTLY_DELAY_MS = 5000;

type StoreApi = {
  doc: PersistedDoc;
  hydrated: boolean;
  skipNotice: string | null;
  // 부모 루프
  skip: () => void;
  markAnswered: (finish: FinishResult) => void;
  dismissCheer: () => void;
  // 자녀 루프
  sendCheer: (answerId: string, message: string) => void;
  saveProfile: (input: ProfileInput) => void;
  activateFamily: () => void;
  reissueInvite: () => void;
  // 데모 도구
  runNightlyNow: () => void;
  reset: () => void;
};

export type ProfileInput = {
  parentTitle?: '어머니' | '아버지';
  parentName?: string;
  childName?: string;
  hometown?: string;
  occupation?: string;
  maritalStatus?: MaritalStatus;
  ask?: Record<SensitiveTopicId, boolean>;
};

const StoreContext = createContext<StoreApi | null>(null);

/** 이벤트 시각 가드 — 더 새로운 상태만 반영(낡은 결과가 덮지 못하게). */
function writeAnswerIfNewer(list: Answer[], updated: Answer): Answer[] {
  return list.map((a) => {
    if (a.id !== updated.id) return a;
    if (a.stateUpdatedAt > updated.stateUpdatedAt) {
      logEvent('answer.write', 'skip', { answerId: a.id, reason: 'stale_event' });
      return a;
    }
    return updated;
  });
}

function consumedBaseIds(doc: PersistedDoc): Set<string> {
  const s = new Set(doc.answers.map((a) => a.questionId));
  s.add(doc.daily.baseQuestionId);
  return s;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [doc, setDoc] = useState<PersistedDoc>(() => buildSeed());
  const [hydrated, setHydrated] = useState(false);
  const [skipNotice, setSkipNotice] = useState<string | null>(null);
  const docRef = useRef(doc);
  docRef.current = doc;
  const nightlyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((next: PersistedDoc) => {
    docRef.current = next;
    setDoc(next);
    void repository.saveSnapshot(next);
  }, []);

  // 하이드레이션 — 저장된 문서가 있으면 복원, 없으면 시드 후 저장.
  useEffect(() => {
    let live = true;
    void (async () => {
      const loaded = await repository.loadSnapshot();
      if (!live) return;
      if (loaded) {
        setDoc(loaded);
        docRef.current = loaded;
        logEvent('store.hydrate', 'ok', { source: 'storage', answers: loaded.answers.length });
      } else {
        const seed = buildSeed();
        await repository.saveSnapshot(seed);
        setDoc(seed);
        docRef.current = seed;
        logEvent('store.hydrate', 'ok', { source: 'seed', answers: seed.answers.length });
      }
      setHydrated(true);
    })();
    return () => {
      live = false;
      if (nightlyTimer.current) clearTimeout(nightlyTimer.current);
    };
  }, []);

  // ── 밤사이 정리 (자동 + 수동, 멱등) ──
  const runNightlyNow = useCallback(() => {
    void (async () => {
      const cur = docRef.current;
      const now = Date.now();
      const updated = await runNightly(cur.answers, now);
      // 이벤트 시각 가드로 병합.
      let merged = cur.answers;
      for (const a of updated) merged = writeAnswerIfNewer(merged, a);
      persist({ ...docRef.current, answers: merged });
    })();
  }, [persist]);

  // ── 부모: 스킵 ──
  const skip = useCallback(() => {
    const cur = docRef.current;
    if (cur.daily.status !== 'new') return;
    if (!cur.daily.skipUsed) {
      const alt = alternateQuestion(cur.daily.baseQuestionId, cur.profile, consumedBaseIds(cur));
      if (!alt) return;
      setSkipNotice('그럴 수 있어요. 다른 이야기를 여쭤볼게요.');
      persist({
        ...cur,
        daily: { ...cur.daily, baseQuestionId: alt.id, questionId: alt.id, skipUsed: true },
      });
      logEvent('day.skip', 'ok', { to: alt.id });
    } else {
      setSkipNotice(null);
      persist({ ...cur, daily: { ...cur.daily, status: 'resting' } });
      logEvent('day.skip', 'ok', { outcome: 'resting' });
    }
  }, [persist]);

  // ── 부모: 답변 저장 → 밤사이 정리 예약 ──
  const markAnswered = useCallback(
    (finish: FinishResult) => {
      const cur = docRef.current;
      if (cur.daily.status === 'answered') {
        logEvent('answer.submit', 'noop', { reason: 'already_answered_today' });
        return; // 더블탭 방어(멱등)
      }
      const q = bankQuestionById(cur.daily.questionId);
      const now = Date.now();
      const answer: Answer = {
        id: newId('a'),
        familyId: cur.family.id,
        questionId: cur.daily.questionId,
        questionText: q?.text ?? '오늘의 질문',
        chapterId: q?.chapterId ?? 'ch-home',
        ordinal: todayOrdinal(cur.answers, cur.progressOffset),
        createdAt: now,
        state: 'organizing', // 녹음+업로드 완료 → 밤사이 정리 대기
        stateUpdatedAt: now,
        audio: { uri: finish.uri, durationSec: finish.durationSec, mock: finish.mock },
        transcriptRaw: null,
        transcriptClean: null,
        organizedAt: null,
        cheer: null,
      };
      setSkipNotice(null);
      persist({
        ...cur,
        answers: [...cur.answers, answer],
        daily: { ...cur.daily, status: 'answered' },
      });
      logEvent('answer.submit', 'ok', {
        answerId: answer.id,
        questionId: answer.questionId,
        audioMock: answer.audio.mock,
        durationSec: answer.audio.durationSec,
      });
      // 데모: 몇 초 뒤 자동 정리(하루 기다리지 않게). 수동 트리거도 병행 가능.
      if (nightlyTimer.current) clearTimeout(nightlyTimer.current);
      nightlyTimer.current = setTimeout(() => runNightlyNow(), DEMO_NIGHTLY_DELAY_MS);
    },
    [persist, runNightlyNow],
  );

  // ── 부모: 응원 배너 확인 ──
  const dismissCheer = useCallback(() => {
    const cur = docRef.current;
    if (!cur.parentCheer) return;
    const seenId = cur.parentCheer.answerId;
    const answers = cur.answers.map((a) =>
      a.cheer && a.id === seenId ? { ...a, cheer: { ...a.cheer, seenByParent: true } } : a,
    );
    persist({ ...cur, parentCheer: null, answers });
    logEvent('cheer.dismiss', 'ok', { answerId: seenId });
  }, [persist]);

  // ── 자녀: 응원 보내기 (부모 P1으로 되돌림 — 루프 완성) ──
  const sendCheer = useCallback(
    (answerId: string, message: string) => {
      const cur = docRef.current;
      const now = Date.now();
      const cheer: Cheer = {
        id: newId('cheer'),
        answerId,
        fromName: cur.family.childName,
        message: message.trim() || '💛',
        createdAt: now,
        seenByParent: false,
      };
      const answers = cur.answers.map((a) => (a.id === answerId ? { ...a, cheer } : a));
      // newest-wins: 더 새로운 응원만 배너로.
      const nextParentCheer =
        cur.parentCheer && cur.parentCheer.createdAt > cheer.createdAt ? cur.parentCheer : cheer;
      persist({ ...cur, answers, parentCheer: nextParentCheer });
      logEvent('cheer.send', 'ok', { answerId, from: cheer.fromName, chars: cheer.message.length });
    },
    [persist],
  );

  // ── 자녀: 프로필 저장 (분기 룰 재적용) ──
  const saveProfile = useCallback(
    (input: ProfileInput) => {
      const cur = docRef.current;
      const profile: ParentProfile = {
        ...cur.profile,
        hometown: input.hometown !== undefined ? input.hometown.trim() || null : cur.profile.hometown,
        occupation:
          input.occupation !== undefined ? input.occupation.trim() || null : cur.profile.occupation,
        maritalStatus: input.maritalStatus ?? cur.profile.maritalStatus,
        ask: input.ask ?? cur.profile.ask,
      };
      const family = {
        ...cur.family,
        parentTitle: input.parentTitle ?? cur.family.parentTitle,
        parentName: input.parentName?.trim() || cur.family.parentName,
        childName: input.childName?.trim() || cur.family.childName,
        childFullName: input.childName?.trim() || cur.family.childFullName,
      };
      // 오늘의 질문이 아직 미답이면 새 프로필로 치환 반영(예: 고향=서울).
      let daily = cur.daily;
      if (cur.daily.status === 'new') {
        const base = bankQuestionById(cur.daily.baseQuestionId);
        if (base) daily = { ...cur.daily, questionId: resolveQuestion(base, profile).id };
      }
      persist({ ...cur, profile, family, daily });
      logEvent('profile.save', 'ok', {
        hometown: profile.hometown ?? '',
        askOff: Object.entries(profile.ask)
          .filter(([, v]) => !v)
          .map(([k]) => k),
      });
    },
    [persist],
  );

  const activateFamily = useCallback(() => {
    const cur = docRef.current;
    if (cur.family.activatedAt) return;
    persist({ ...cur, family: { ...cur.family, activatedAt: Date.now() } });
    logEvent('family.activate', 'ok', { familyId: cur.family.id });
  }, [persist]);

  const reissueInvite = useCallback(() => {
    const cur = docRef.current;
    persist({ ...cur, family: { ...cur.family, inviteCode: newId('inv').slice(-7).toUpperCase() } });
    logEvent('invite.reissue', 'ok', {});
  }, [persist]);

  const reset = useCallback(() => {
    void (async () => {
      await repository.clearAll();
      const seed = buildSeed();
      await repository.saveSnapshot(seed);
      setSkipNotice(null);
      setDoc(seed);
      docRef.current = seed;
      logEvent('store.reset', 'ok', {});
    })();
  }, []);

  const value = useMemo<StoreApi>(
    () => ({
      doc,
      hydrated,
      skipNotice,
      skip,
      markAnswered,
      dismissCheer,
      sendCheer,
      saveProfile,
      activateFamily,
      reissueInvite,
      runNightlyNow,
      reset,
    }),
    [
      doc,
      hydrated,
      skipNotice,
      skip,
      markAnswered,
      dismissCheer,
      sendCheer,
      saveProfile,
      activateFamily,
      reissueInvite,
      runNightlyNow,
      reset,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('스토어 훅은 StoreProvider 안에서만 쓸 수 있어요.');
  return ctx;
}

// ── 화면용 셀렉터 훅 ─────────────────────────────────────────────────────────

/** 부모 P1·P2 — 기존 useDiary 계약과 동일 모양(배선 교체 시 화면 JSX 불변). */
export type AnswerStateView = 'unanswered' | 'organizing' | 'resting';
export function useDiary() {
  const s = useStore();
  const { doc } = s;
  const answerState: AnswerStateView =
    doc.daily.status === 'answered' ? 'organizing' : doc.daily.status === 'resting' ? 'resting' : 'unanswered';
  const question: QuestionView = questionView(
    doc.daily,
    doc.profile,
    todayOrdinal(doc.answers, doc.progressOffset),
  );
  const cheer: CheerView | null = doc.parentCheer
    ? { fromName: doc.parentCheer.fromName, message: doc.parentCheer.message }
    : null;
  return {
    question,
    answerState,
    skipNotice: s.skipNotice,
    skipUsed: doc.daily.skipUsed,
    cheer,
    hasPastStories: doc.answers.length > 0,
    skip: s.skip,
    markAnswered: s.markAnswered,
    dismissCheer: s.dismissCheer,
    reset: s.reset,
  };
}

export function useFamily(): FamilyView {
  return familyView(useStore().doc.family);
}

/** P3·C5 목록. */
export function useStories(): StoryView[] {
  return pastStories(useStore().doc.answers);
}

/** C4 — 가장 최근 답변 이야기(루프 시연 대상). 없으면 null. */
export function useLatestStory(): StoryView | null {
  const { doc } = useStore();
  const a = latestAnswer(doc.answers);
  return a ? pastStories([a])[0] : null;
}

export function useChildHome(): ChildHomeView {
  const { doc } = useStore();
  return childHomeView(doc.family, doc.answers, doc.daily, doc.profile);
}

export function useLibrary(): { progress: LibraryProgressView; stories: StoryView[] } {
  const { doc } = useStore();
  return { progress: libraryProgress(doc.answers, doc.progressOffset), stories: pastStories(doc.answers) };
}

export function useBookPreview(): BookPreviewView {
  const { doc } = useStore();
  return assembleBook(doc.family, doc.profile, doc.answers);
}

export function useSensitiveTopics() {
  return SENSITIVE_TOPICS;
}

/** 자녀 C4 응원 전송. */
export function useSendCheer() {
  return useStore().sendCheer;
}

/** 자녀 C1 프로필 저장. */
export function useSaveProfile() {
  return useStore().saveProfile;
}

/** 자녀 C2 초대·활성화. */
export function useInviteActions() {
  const s = useStore();
  return { activateFamily: s.activateFamily, reissueInvite: s.reissueInvite };
}

/** 데모 도구(점검 인덱스). */
export function useDemoTools() {
  const s = useStore();
  return { runNightlyNow: s.runNightlyNow, reset: s.reset, hydrated: s.hydrated };
}

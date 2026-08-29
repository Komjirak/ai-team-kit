import type { Answer, AnswerState, Cheer, Family, ParentProfile, PersistedDoc } from '@/domain/types';
import { bankQuestionById } from './questionBank';
import { cleanupFor } from './sttCleanups';
import { dateKey } from '@/domain/views';

/**
 * 시드 — 첫 실행 시 채워지는 "이미 살아온 며칠". (BE 소유)
 *
 * 데모가 빈 화면에서 시작하지 않도록 과거 답변 몇 건 + 활성화된 가족을 심는다.
 * 오늘의 질문(q-seoul-arrival)은 미답 상태로 두어, 부모가 실제로 녹음→정리→응원 루프를
 * 처음부터 흐르게 한다. 진행감(count)은 doneCount + progressOffset로 "23번째"처럼 보이게 한다.
 *
 * ⚠️ progressOffset(=19)은 데모 기준선이다 — 실서버에선 0(실제 답변만 집계).
 */
const DAY = 24 * 60 * 60 * 1000;
const FAMILY_ID = 'fam-demo';
const PROGRESS_OFFSET = 19;

function makeAnswer(
  familyId: string,
  questionId: string,
  ordinal: number,
  createdAt: number,
  state: AnswerState,
  durationSec: number,
  opts: { rawOnly?: string; cheer?: Cheer } = {},
): Answer {
  const q = bankQuestionById(questionId);
  const done = state === 'done';
  return {
    id: `a-seed-${questionId}`,
    familyId,
    questionId,
    questionText: q?.text ?? '오늘의 질문',
    chapterId: q?.chapterId ?? 'ch-home',
    ordinal,
    createdAt,
    state,
    stateUpdatedAt: createdAt,
    audio: { uri: null, durationSec, mock: true },
    transcriptRaw: done ? cleanupFor(questionId) : opts.rawOnly ?? null,
    transcriptClean: done ? cleanupFor(questionId) : null,
    organizedAt: done ? createdAt + 8 * 60 * 60 * 1000 : null,
    cheer: opts.cheer ?? null,
  };
}

export function buildSeed(now: number = Date.now()): PersistedDoc {
  const family: Family = {
    id: FAMILY_ID,
    childName: '지혜',
    childFullName: '이지혜',
    parentTitle: '어머니',
    parentName: '김순자',
    inviteCode: '9F3K-2A',
    createdAt: now - 25 * DAY,
    activatedAt: now - 24 * DAY, // 점검 시 양쪽 세계가 바로 동작하도록 활성화 상태로 시드
  };

  const profile: ParentProfile = {
    familyId: FAMILY_ID,
    hometown: null,
    maritalStatus: 'married',
    siblings: null,
    children: null,
    occupation: null,
    ask: { spouse: true, health: true, money: true },
  };

  // P1이 초기에도 응원 배너를 보이도록, 오래된 답변(음식)에 미확인 응원을 심는다.
  // 최신 답변(노래)은 응원 없이 두어 자녀가 갓 응원하는 루프를 처음부터 체험하게 한다.
  const foodCheer: Cheer = {
    id: 'ch-seed-food',
    answerId: 'a-seed-q-child-food',
    fromName: '지혜',
    message: '엄마, 이 얘기 처음 들었어',
    createdAt: now - 3 * DAY,
    seenByParent: false,
  };

  const answers: Answer[] = [
    makeAnswer(FAMILY_ID, 'q-home-mother-song', 23, now - 1 * DAY, 'done', 112),
    makeAnswer(FAMILY_ID, 'q-home-siblings', 22, now - 2 * DAY, 'organizing', 130, {
      rawOnly: '위로 오빠 둘, 아래로 여동생 하나… 넷 중 셋째였지.',
    }),
    makeAnswer(FAMILY_ID, 'q-child-food', 21, now - 4 * DAY, 'done', 98, { cheer: foodCheer }),
    makeAnswer(FAMILY_ID, 'q-child-play', 20, now - 9 * DAY, 'done', 105),
    makeAnswer(FAMILY_ID, 'q-child-house', 19, now - 20 * DAY, 'done', 88),
  ];

  return {
    version: 1,
    family,
    profile,
    daily: {
      familyId: FAMILY_ID,
      date: dateKey(new Date(now)),
      baseQuestionId: 'q-seoul-arrival',
      questionId: 'q-seoul-arrival',
      status: 'new',
      skipUsed: false,
    },
    answers,
    parentCheer: foodCheer,
    progressOffset: PROGRESS_OFFSET,
  };
}

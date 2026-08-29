import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { todayQuestion, alternateQuestion, incomingCheer, type Question, type Cheer } from '@/data/mock';

/**
 * 하루담 부모 루프의 최소 상태(목 데이터, 로컬). P1↔P2가 라우트로 나뉘어도 공유돼야 하므로
 * 루트 레이아웃에서 provider로 감싼다.
 *
 * TODO(BE): question/answerState/cheer는 서버가 원본이다. 지금은 로컬 목.
 *   - 오늘의 질문 배달·스킵 반영은 질문 시퀀스 API
 *   - answerState 'organizing'(밤사이 정리 중)은 STT 배치 상태
 *   - cheer 수신은 자녀 앱 → 푸시/피드
 */

export type AnswerState =
  | 'unanswered' // 오늘 아직 답 안 함 — 질문 + 녹음 버튼
  | 'organizing' // 답함 → "밤사이 글로 정리해 드릴게요"
  | 'resting'; // 대체 질문까지 스킵 → "오늘은 쉬어가요"

type DiaryValue = {
  question: Question;
  answerState: AnswerState;
  /** 스킵 안내 한 줄(치환 직후). 없으면 null. */
  skipNotice: string | null;
  skipUsed: boolean;
  cheer: Cheer | null;
  hasPastStories: boolean; // 첫날이면 false → "지난 이야기 보기" 숨김(§9-4 P1 빈 상태)
  skip: () => void;
  markAnswered: () => void;
  dismissCheer: () => void;
  reset: () => void;
};

const DiaryContext = createContext<DiaryValue | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [question, setQuestion] = useState<Question>(todayQuestion);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [skipNotice, setSkipNotice] = useState<string | null>(null);
  const [skipUsed, setSkipUsed] = useState(false);
  const [cheer, setCheer] = useState<Cheer | null>(incomingCheer);

  const skip = useCallback(() => {
    if (!skipUsed) {
      // 스킵 1회: 같은 챕터 대체 질문으로 즉시 치환(§9-4 P1). 확인 대화상자 없음.
      setSkipUsed(true);
      setQuestion(alternateQuestion);
      setSkipNotice('그럴 수 있어요. 다른 이야기를 여쭤볼게요.');
    } else {
      // 대체 질문도 스킵 → 오늘은 휴식. 주 버튼 사라짐.
      setAnswerState('resting');
      setSkipNotice(null);
    }
  }, [skipUsed]);

  const markAnswered = useCallback(() => {
    setAnswerState('organizing');
    setSkipNotice(null);
  }, []);

  const dismissCheer = useCallback(() => setCheer(null), []);

  const reset = useCallback(() => {
    setQuestion(todayQuestion);
    setAnswerState('unanswered');
    setSkipNotice(null);
    setSkipUsed(false);
    setCheer(incomingCheer);
  }, []);

  const value = useMemo<DiaryValue>(
    () => ({
      question,
      answerState,
      skipNotice,
      skipUsed,
      cheer,
      hasPastStories: true, // 목: 지난 이야기 있음. 첫날 빈 상태 확인 시 false로.
      skip,
      markAnswered,
      dismissCheer,
      reset,
    }),
    [question, answerState, skipNotice, skipUsed, cheer, skip, markAnswered, dismissCheer, reset],
  );

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary(): DiaryValue {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary는 DiaryProvider 안에서만 쓸 수 있어요.');
  return ctx;
}

import type { MaritalStatus, SensitiveTopicId } from '@/domain/types';

/**
 * 분기 룰 (I2) — 데이터로 표현하고 엔진(services/pipeline/branching.ts)이 해석한다.
 * AI 아님 · 룰 기반 조건 치환. "질문이 왜 이거지?"의 근거가 여기 한 곳에 모인다.
 */

/** 고향 치환: 고향이 keywords와 맞으면 from 질문을 to 질문으로 치환한다. */
export interface HometownSubRule {
  kind: 'hometown-sub';
  id: string;
  keywords: string[];
  from: string; // questionId
  to: string; // questionId
  previewText: string; // C1b 신뢰 장치(치환 미리보기)
}

/** 챕터 대체: 조건 충족 시 해당 챕터 질문을 제외하고 목차 제목을 대체한다. */
export interface ChapterSubRule {
  kind: 'chapter-sub';
  id: string;
  chapterId: string;
  maritalIn?: MaritalStatus[]; // 이 혼인 상태면 대체
  topicOff?: SensitiveTopicId; // 이 스위치가 off면 대체
  replacementTitle: string;
}

/** 주제 제외: 스위치 off면 해당 태그 질문을 시퀀스에서 뺀다. */
export interface TopicExcludeRule {
  kind: 'topic-exclude';
  id: string;
  topic: SensitiveTopicId;
}

export type BranchRule = HometownSubRule | ChapterSubRule | TopicExcludeRule;

export const BRANCH_RULES: BranchRule[] = [
  {
    kind: 'hometown-sub',
    id: 'rule-seoul-native',
    keywords: ['서울'],
    from: 'q-seoul-arrival',
    to: 'q-hometown-neighborhood',
    previewText: "‘처음 서울에 올라오던 날’ 질문이 ‘어릴 적 살던 동네’ 질문으로 맞춰져요.",
  },
  {
    kind: 'chapter-sub',
    id: 'rule-spouse-marital',
    chapterId: 'ch-spouse',
    maritalIn: ['bereaved', 'divorced'],
    replacementTitle: '함께 걸어온 사람들',
  },
  {
    kind: 'chapter-sub',
    id: 'rule-spouse-switch',
    chapterId: 'ch-spouse',
    topicOff: 'spouse',
    replacementTitle: '함께 걸어온 사람들',
  },
  { kind: 'topic-exclude', id: 'rule-exclude-spouse', topic: 'spouse' },
  { kind: 'topic-exclude', id: 'rule-exclude-health', topic: 'health' },
  { kind: 'topic-exclude', id: 'rule-exclude-money', topic: 'money' },
];

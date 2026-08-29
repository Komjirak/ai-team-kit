import type { SensitiveTopic } from '@/domain/types';

/** 민감 주제 스위치 (PRD §9-4 C1b) — 질문 뱅크 주제 태그에서 파생. */
export const SENSITIVE_TOPICS: SensitiveTopic[] = [
  { id: 'spouse', label: '배우자 이야기' },
  { id: 'health', label: '투병 · 건강' },
  { id: 'money', label: '돈 · 재산' },
];

/** G1 랜딩 예시 질문(§9-2 L2) — 정적 마케팅 텍스트. */
export const LANDING_SAMPLE_QUESTION = '어머니는 어떤 처녀였나요?';

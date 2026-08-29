import type { Chapter } from '@/domain/types';

/**
 * 책의 장 = 목차 (§3-5 "챕터 구조가 곧 목차"). PRD §9-4 B2 잠정 7장.
 * 질문 뱅크 제작 시 확정될 값 — 여기 시드는 "작아도 되는 실제 데이터"다.
 */
export const CHAPTERS: Chapter[] = [
  { id: 'ch-child', title: '어린 시절', order: 1 },
  { id: 'ch-home', title: '고향과 가족', order: 2 },
  { id: 'ch-spouse', title: '배우자를 만나다', order: 3 },
  { id: 'ch-work', title: '일과 살림', order: 4 },
  { id: 'ch-kids', title: '아이들', order: 5 },
  { id: 'ch-now', title: '지금의 나날', order: 6 },
  { id: 'ch-words', title: '전하고 싶은 말', order: 7 },
];

/** 배우자 챕터가 대체될 때 쓰는 이름(사별·이혼·스위치 off) — "빠진 장"을 보여주지 않는다(§9-4 B2). */
export const SPOUSE_CHAPTER_REPLACEMENT_TITLE = '함께 걸어온 사람들';

export function chapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

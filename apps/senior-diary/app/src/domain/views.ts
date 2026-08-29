/**
 * 표시용 view 타입 + 순수 포매터. (BE 소유)
 *
 * 화면(APP 소유)이 소비하는 모양이다 — 기존 목(mock.ts)이 노출하던 타입을 그대로 유지해
 * 화면 배선 교체 시 JSX가 바뀌지 않게 한다. 도메인 개체(types.ts)의 "투영"일 뿐이다.
 */

/** P1·C3의 질문 카드. */
export type QuestionView = {
  id: string;
  ordinal: number;
  text: string;
  chapter: string;
};

/** P1 응원 배너. */
export type CheerView = { fromName: string; message: string };

/** P3·C5 카드 상태 pill. */
export type StoryStatus = 'written' | 'organizing';

/** P3·C4·C5 이야기 카드. answerId·cheerSent는 응원 대상 배선에 쓰인다(C4). */
export type StoryView = {
  id: string;
  answerId: string;
  dateLabel: string;
  question: string;
  status: StoryStatus;
  excerpt: string; // 목록 첫 문장
  body: string; // 전문(정리본)
  audioDuration: string; // 원음 길이 "M:SS"
  cheerSent: boolean;
};

/** C3 홈. */
export type ChildHomeView = {
  weekAnswered: number;
  weekTotal: number;
  todayQuestion: string;
  parentAnsweredToday: boolean;
  recent: StoryView | null;
};

/** C5 진행감. */
export type LibraryProgressView = { count: number; total: number };

/** C6 책 미리보기. */
export type BookPreviewView = {
  title: string;
  subtitle: string;
  year: string;
  toc: { n: number; title: string; page: number }[];
  spread: { title: string; body: string; caption: string };
};

/** P0·C2 등에서 쓰는 가족 표시 모양. */
export type FamilyView = {
  childName: string;
  childFullName: string;
  parentTitle: '어머니' | '아버지';
  parentName: string;
};

/** 초 → "M:SS" (원음 길이 표기). */
export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** 날짜 → "8월 25일" (카드 라벨). */
export function shortDateLabel(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 오늘 날짜 라벨(부모 화면 상단). 한국어 요일. — 기존 mock.todayLabel 승계. */
export function todayLabel(date: Date = new Date()): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

/** 받침 유무 → 조사 선택 ("가/이", "는/은" 등). */
export function josa(word: string, withFinal: string, withoutFinal: string): string {
  if (!word) return withoutFinal;
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  if (!isHangul) return withoutFinal;
  return (last - 0xac00) % 28 !== 0 ? withFinal : withoutFinal;
}

/** 기록용 하루 키 (로컬 YYYY-MM-DD). 04:00 경계는 후속(렉시오 규칙 참조) — MVP는 자정 경계. */
export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 목 데이터 — 서버·결제 없음(MVP §3-0). 로컬 상태로만 흐른다.
 * BE 연동 지점은 화면/스토어에서 // TODO(BE)로 표시.
 */

export type Question = {
  id: string;
  ordinal: number; // 몇 번째 질문(부모별 시퀀스)
  text: string;
  chapter: string; // 챕터 태그(질문 뱅크)
};

export type Cheer = {
  fromName: string; // 자녀 호칭/이름 (자녀가 입력)
  message: string;
};

// 오늘의 질문(P1의 주인공). 레퍼런스: P1-today.html
export const todayQuestion: Question = {
  id: 'q-023',
  ordinal: 23,
  text: '처음 서울에 올라오던 날,\n기억나세요?',
  chapter: '청년기',
};

// 스킵(I8) 시 같은 챕터 우선 대체 질문. 하루 1회 치환(§9-4 P1).
export const alternateQuestion: Question = {
  id: 'q-023-alt',
  ordinal: 23,
  text: '어릴 적 살던 동네는\n어떤 곳이었나요?',
  chapter: '청년기',
};

// 응원 배너(§9-4 P1 · 자녀가 보낸 그대로 — 시스템이 다듬지 않음)
export const incomingCheer: Cheer = {
  fromName: '지혜',
  message: '지혜님이 응원을 보냈어요',
};

// 가족 문맥
export const family = {
  childName: '지혜',
  parentTitle: '어머니' as '어머니' | '아버지',
};

/** 오늘 날짜 라벨(부모 화면 상단). 한국어 요일. */
export function todayLabel(date: Date = new Date()): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

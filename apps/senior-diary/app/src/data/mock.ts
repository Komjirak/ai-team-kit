/**
 * 목 데이터 — 서버·결제 없음(MVP §3-0). 로컬 상태로만 흐른다.
 * BE 연동 지점은 화면/스토어에서 // TODO(BE)로 표시.
 * 인물: 부모=김순자(어머니), 자녀=이지혜(딸). 레퍼런스: design/stitch/*.
 */

export type Question = {
  id: string;
  ordinal: number;
  text: string;
  chapter: string;
};

export type Cheer = { fromName: string; message: string };

export type StoryStatus = 'written' | 'organizing';

export type PastStory = {
  id: string;
  dateLabel: string;
  question: string;
  status: StoryStatus;
  excerpt: string; // C5 목록 첫 문장
  body: string; // C4 전문(정리된 글)
  audioDuration: string; // 원음 길이
};

export const family = {
  childName: '지혜',
  childFullName: '이지혜',
  parentTitle: '어머니' as '어머니' | '아버지',
  parentName: '김순자',
};

// ── 오늘의 질문(P1) ──────────────────────────────────────────────────────────
export const todayQuestion: Question = {
  id: 'q-023',
  ordinal: 23,
  text: '처음 서울에\n올라오던 날,\n기억나세요?',
  chapter: '청년기',
};

export const alternateQuestion: Question = {
  id: 'q-023-alt',
  ordinal: 23,
  text: '어릴 적 살던 동네는\n어떤 곳이었나요?',
  chapter: '청년기',
};

export const incomingCheer: Cheer = { fromName: '지혜', message: '지혜님이 응원을 보냈어요' };

// ── 지난 이야기(P3·C5) ──────────────────────────────────────────────────────
export const pastStories: PastStory[] = [
  {
    id: 's-0825',
    dateLabel: '8월 25일',
    question: '어머니가 좋아하시던 노래는?',
    status: 'written',
    excerpt: '라디오에서 이미자 노래가 나오면 항상 일손을 멈추고 들으셨어…',
    body: '라디오에서 이미자 노래가 나오면 어머닌 항상 일손을 멈추고 들으셨어. 그 노래를 흥얼거리시던 뒷모습이 아직도 눈에 선하다.',
    audioDuration: '1:52',
  },
  {
    id: 's-0824',
    dateLabel: '8월 24일',
    question: '형제 중 몇째로 자라셨어요?',
    status: 'organizing',
    excerpt: '위로 오빠 둘, 아래로 여동생 하나… 넷 중 셋째였지.',
    body: '',
    audioDuration: '2:10',
  },
  {
    id: 's-0823',
    dateLabel: '8월 23일',
    question: '처음 서울에 올라오던 날...',
    status: 'written',
    excerpt: '열아홉에 완행열차를 타고 올라왔어요. 손에는 보따리 하나뿐이었지…',
    body:
      '열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지, 손에 쥔 주소 쪽지만 보고 걸었지요.\n\n처음 보는 높은 건물들과 번쩍이는 간판들 사이에서 작은 가방 하나 들고 서 있었던 기억이 아직도 생생해. 무섭기도 하고 설레기도 했던 그 밤 공기가 생각나네.',
    audioDuration: '2:30',
  },
  {
    id: 's-0820',
    dateLabel: '8월 20일',
    question: '어릴 적 가장 좋아했던 음식은?',
    status: 'written',
    excerpt: '가마솥에 푹 고아 만든 구수한 누룽지 맛은 요즘 식당에선 찾을 수가 없어…',
    body: '가마솥에 푹 고아 만든 구수한 누룽지 맛은 요즘 식당에선 찾을 수가 없어. 어머니가 부뚜막에서 긁어주시던 그 누룽지가 참 그립다.',
    audioDuration: '1:38',
  },
];

// ── 자녀 홈(C3) ─────────────────────────────────────────────────────────────
export const childHome = {
  weekAnswered: 3,
  weekTotal: 7,
  todayQuestion: todayQuestion.text.replace(/\n/g, ' '),
  parentAnsweredToday: true, // 오늘 어머니가 답함(밤사이 정리 중)
};

// ── 진행감(C5) ──────────────────────────────────────────────────────────────
export const libraryProgress = { count: 23, total: 365 };

// ── 책 미리보기(C6) ─────────────────────────────────────────────────────────
export const bookPreview = {
  title: '김순자 이야기',
  subtitle: '딸 이지혜가 묻고,\n김순자가 답하다',
  year: '2026',
  toc: [
    { n: 1, title: '어린 시절', page: 12 },
    { n: 2, title: '고향과 가족', page: 28 },
    { n: 3, title: '학창 시절의 기억', page: 45 },
    { n: 4, title: '청년기, 그리고 일', page: 62 },
    { n: 5, title: '배우자와의 만남', page: 80 },
    { n: 6, title: '부모가 된다는 것', page: 98 },
    { n: 7, title: '지금, 그리고 내일', page: 115 },
  ],
  spread: {
    title: '어머니가 끓여주시던 된장찌개',
    body:
      '겨울이 오면 늘 생각나는 냄새가 있어. 시골집 부뚜막에서 어머니가 끓여주시던 그 투박한 된장찌개 냄새 말이야. 별다른 재료 없이 무 숭숭 썰어 넣고 두부 몇 조각 넣은 게 다였는데, 그게 왜 그렇게 맛있었는지 몰라. 지금 아무리 좋은 식당에 가서 먹어도 그 맛은 안 나더라.',
    caption: '1970년대, 고향집 부엌의 풍경.',
  },
};

// ── C1 프로필: 민감 주제 스위치 ─────────────────────────────────────────────
export const sensitiveTopics = [
  { id: 'spouse', label: '배우자 이야기' },
  { id: 'health', label: '투병 · 건강' },
  { id: 'money', label: '돈 · 재산' },
] as const;

// ── G1 랜딩(§9-2) ──────────────────────────────────────────────────────────
export const landingSampleQuestion = '어머니는 어떤 처녀였나요?';

/** 오늘 날짜 라벨(부모 화면 상단). 한국어 요일. */
export function todayLabel(date: Date = new Date()): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

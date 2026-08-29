/**
 * 도메인 모델 — IA §4 개체 지도를 타입으로. (BE 소유)
 *
 * 이 파일은 "무엇이 있는가"만 정의한다. 저장·규칙·파이프라인은 services/ 아래에 있고,
 * 화면이 실제로 소비하는 표시용 모양(Question·PastStory 등 view 타입)은 domain/views.ts 에 있다.
 *
 * 원본: IA §4(가족·프로필·질문뱅크·분기룰·오늘의질문·답변·응원·책) · IA §5(상태 축) ·
 *       PRD §3-1(I1~I9)·§3-5(책 파이프라인)·§9-4(상태 명세).
 */

export type ParentTitle = '어머니' | '아버지';

/** 혼인 상태 — 분기 룰(I2)의 입력값. 사별/이혼이면 배우자 챕터가 조용히 대체된다. */
export type MaritalStatus = 'married' | 'bereaved' | 'divorced' | 'single' | 'unknown';

/** 민감 주제 스위치 id (PRD §9-4 C1b). ask=false면 해당 주제 질문·챕터 제외. */
export type SensitiveTopicId = 'spouse' | 'health' | 'money';
export interface SensitiveTopic {
  id: SensitiveTopicId;
  label: string;
}

/**
 * 가족 — 자녀 1 ↔ 부모 1 연결(MVP 1:1, O8 다인 제외). 초대 코드가 맺는다.
 * activatedAt: 부모 활성화(P0 완료) 시각. null = 미개봉(SENT). IA §5-2.
 */
export interface Family {
  id: string;
  childName: string; // 지혜
  childFullName: string; // 이지혜
  parentTitle: ParentTitle; // 어머니
  parentName: string; // 김순자
  inviteCode: string;
  createdAt: number;
  activatedAt: number | null;
}

/**
 * 부모 프로필 — 자녀가 C1b에서 입력. 분기 룰(I2)의 입력값. 전부 선택 입력.
 * ask: 민감 주제별 "여쭐지" 여부. 기본 전부 true.
 */
export interface ParentProfile {
  familyId: string;
  hometown: string | null;
  maritalStatus: MaritalStatus;
  siblings: string | null;
  children: string | null;
  occupation: string | null;
  ask: Record<SensitiveTopicId, boolean>;
}

/** 책의 장 = 목차(§3-5). 질문 뱅크의 챕터 구조가 곧 목차다. */
export interface Chapter {
  id: string;
  title: string;
  order: number;
}

/**
 * 질문 뱅크 항목 — 전량 자체 제작(R6). 시간순이 아니라 챕터 슬롯 구조.
 * topicTags: 민감 주제 태그(스위치로 제외). replaces/replacedByHometown: 분기 룰의 치환 대상.
 */
export interface BankQuestion {
  id: string;
  chapterId: string;
  text: string; // 화면 표기(줄바꿈 포함 가능)
  topicTags: SensitiveTopicId[];
  order: number; // 뱅크 기본 시퀀스 순서
}

/**
 * 답변 1건의 상태 — IA §5-1.
 * recorded(녹음됨/업로드됨) → organizing(밤사이 정리 중) → done(정리 완료).
 * 로컬-first라 별도 업로드 단계는 생략하고 recorded에 합친다.
 */
export type AnswerState = 'recorded' | 'organizing' | 'done';

/** 원음 메타 — R7(원음 보존, QR 재생용). 목 녹음이면 uri=null. */
export interface AudioMeta {
  uri: string | null;
  durationSec: number;
  mock: boolean;
}

/** 응원 — 하트+한마디. 자녀가 쓴 그대로(시스템이 다듬지 않음, §9-7). */
export interface Cheer {
  id: string;
  answerId: string;
  fromName: string;
  message: string;
  createdAt: number;
  seenByParent: boolean;
}

/**
 * 답변 — 원음 + 정리본 + 상태의 묶음(§3-5).
 * stateUpdatedAt: 이벤트 시각 가드용(BE 규칙: 낡은 이벤트가 새 상태를 덮지 않게).
 */
export interface Answer {
  id: string;
  familyId: string;
  questionId: string;
  questionText: string; // 배달 당시 질문(치환 반영)
  chapterId: string;
  ordinal: number; // 몇 번째 이야기
  createdAt: number;
  state: AnswerState;
  stateUpdatedAt: number;
  audio: AudioMeta;
  transcriptRaw: string | null; // STT 원문(간투사 포함) — 데모는 생략 가능
  transcriptClean: string | null; // 밤사이 정리본
  organizedAt: number | null;
  cheer: Cheer | null;
}

/** 오늘의 질문 하루 상태 — IA §5-3. */
export type DayStatus = 'new' | 'answered' | 'resting';
export interface DailyQuestion {
  familyId: string;
  date: string; // 기록용 하루 (YYYY-MM-DD)
  baseQuestionId: string; // 원 질문(치환 전)
  questionId: string; // 현재 배달된(치환 반영) 질문
  status: DayStatus;
  skipUsed: boolean; // 하루 1회 치환 사용 여부
}

/** 영속화 문서 — LocalRepository가 AsyncStorage에 저장하는 단위. */
export interface PersistedDoc {
  version: 1;
  family: Family;
  profile: ParentProfile;
  daily: DailyQuestion;
  answers: Answer[];
  parentCheer: Cheer | null; // P1이 보여줄 미확인 응원(newest wins)
  progressOffset: number; // 데모 시드 기준선(§ README)
}

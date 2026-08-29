import type {
  Answer,
  BankQuestion,
  Chapter,
  Cheer,
  DailyQuestion,
  Family,
  ParentProfile,
  PersistedDoc,
} from '@/domain/types';

/**
 * 저장소 인터페이스 (DRI seam) — IA §4 개체별 접근. (BE 소유)
 *
 * 이 인터페이스가 로컬(AsyncStorage)과 실서버(Firestore)를 가르는 유일한 경계다.
 * 화면·스토어는 이 타입에만 의존하고, 구현체는 주입된다(services/index.ts).
 * 실서버로 옮길 때 바꾸는 것은 구현체 하나뿐 — 계약(메서드 시그니처)은 불변.
 *
 * 질문 뱅크·챕터는 읽기 전용 시드(로컬은 정적, 서버는 questions/chapters 컬렉션).
 * 답변 쓰기(putAnswer)는 멱등 upsert — 같은 id로 두 번 써도 결과가 같다(BE 규칙).
 */
export interface DiaryRepository {
  // ── 가족 (families/{id}) ──
  getFamily(): Promise<Family | null>;
  saveFamily(family: Family): Promise<void>;

  // ── 부모 프로필 (families/{id}/profile) ──
  getProfile(familyId: string): Promise<ParentProfile | null>;
  saveProfile(profile: ParentProfile): Promise<void>;

  // ── 질문 뱅크·챕터 (읽기 전용 시드) ──
  listChapters(): Promise<Chapter[]>;
  listQuestions(): Promise<BankQuestion[]>;

  // ── 오늘의 질문 (families/{id}/daily/{date}) ──
  getDaily(familyId: string, date: string): Promise<DailyQuestion | null>;
  saveDaily(daily: DailyQuestion): Promise<void>;

  // ── 답변 (families/{id}/answers/{answerId}) ──
  listAnswers(familyId: string): Promise<Answer[]>;
  getAnswer(familyId: string, answerId: string): Promise<Answer | null>;
  putAnswer(answer: Answer): Promise<void>; // 멱등 upsert

  // ── 응원 (families/{id}/answers/{answerId}/cheer) ──
  putCheer(familyId: string, cheer: Cheer): Promise<void>;
  getParentCheer(familyId: string): Promise<Cheer | null>; // P1이 보여줄 미확인 응원
  setParentCheer(familyId: string, cheer: Cheer | null): Promise<void>;

  // ── 전체 스냅샷 (local-first 편의 — 서버 구현은 컬렉션 조회로 합성) ──
  loadSnapshot(): Promise<PersistedDoc | null>;
  saveSnapshot(doc: PersistedDoc): Promise<void>;
  clearAll(): Promise<void>;
}

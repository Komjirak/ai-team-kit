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
import type { DiaryRepository } from '@/services/repository';

/**
 * FirestoreRepository — 실서버(Firebase) 어댑터 골격. **미배선 스텁.** (BE 소유)
 *
 * ⚠️ 배선·실행하지 않는다 — 실 Firebase 프로젝트·키·콘솔 작업은 PO 영역(에스컬레이션).
 * 이 파일은 "같은 DiaryRepository 인터페이스를 서버 구현이 어떻게 채우는가"의 마이그레이션
 * 경로만 문서화한다. 모든 메서드는 NOT_WIRED로 실패한다 — 조용히 빈 값을 주지 않는다(팀 규칙 6).
 *
 * 컬렉션 매핑(문서화):
 *   families/{familyId}                                  ← getFamily / saveFamily
 *   families/{familyId}/profile/main                     ← getProfile / saveProfile
 *   questions/{questionId} · chapters/{chapterId}        ← listQuestions / listChapters (시드 이관)
 *   families/{familyId}/daily/{date}                     ← getDaily / saveDaily
 *   families/{familyId}/answers/{answerId}               ← listAnswers / getAnswer / putAnswer
 *   families/{familyId}/answers/{answerId}.cheer         ← putCheer
 *   families/{familyId}.parentCheer                      ← get/setParentCheer
 *
 * 서버로 옮길 때의 BE 계약(이 어댑터 구현 시 지킬 것):
 *   1. putAnswer는 멱등 — set(merge)로, 같은 answerId 재수신에도 결과 동일.
 *   2. 상태 전이는 이벤트 시각 가드(writeAnswerIfNewer 상당) — stateUpdatedAt 역전 방지.
 *      "밤사이 정리"는 Cloud Function(스케줄/트리거)이 담당하고, 웹훅/재시도 중복을 전제로 설계.
 *   3. 맵 키에 점이 들어가면 밑줄 치환(context.long → context_long).
 *   4. Firestore 문서 ID 내림차순 orderBy 금지 — 오름차순 후 코드에서 뒤집는다.
 *   5. 익명 인증(부모) + 30일 자동 삭제 옵션 확인(구독자 uid 소실 방지) — 콘솔 스위치 세트.
 */
const NOT_WIRED = 'repo.not_wired (firestore adapter is a stub — PO must provision Firebase)';

function notWired(): never {
  throw new Error(NOT_WIRED);
}

export class FirestoreRepository implements DiaryRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config?: { projectId?: string }) {
    // 실 구현: initializeApp + getFirestore(app). 여기선 배선하지 않는다.
  }

  getFamily(): Promise<Family | null> {
    return notWired();
  }
  saveFamily(_family: Family): Promise<void> {
    return notWired();
  }
  getProfile(_familyId: string): Promise<ParentProfile | null> {
    return notWired();
  }
  saveProfile(_profile: ParentProfile): Promise<void> {
    return notWired();
  }
  listChapters(): Promise<Chapter[]> {
    return notWired();
  }
  listQuestions(): Promise<BankQuestion[]> {
    return notWired();
  }
  getDaily(_familyId: string, _date: string): Promise<DailyQuestion | null> {
    return notWired();
  }
  saveDaily(_daily: DailyQuestion): Promise<void> {
    return notWired();
  }
  listAnswers(_familyId: string): Promise<Answer[]> {
    return notWired();
  }
  getAnswer(_familyId: string, _answerId: string): Promise<Answer | null> {
    return notWired();
  }
  putAnswer(_answer: Answer): Promise<void> {
    return notWired();
  }
  putCheer(_familyId: string, _cheer: Cheer): Promise<void> {
    return notWired();
  }
  getParentCheer(_familyId: string): Promise<Cheer | null> {
    return notWired();
  }
  setParentCheer(_familyId: string, _cheer: Cheer | null): Promise<void> {
    return notWired();
  }
  loadSnapshot(): Promise<PersistedDoc | null> {
    return notWired();
  }
  saveSnapshot(_doc: PersistedDoc): Promise<void> {
    return notWired();
  }
  clearAll(): Promise<void> {
    return notWired();
  }
}

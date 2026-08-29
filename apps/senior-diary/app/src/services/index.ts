import type { DiaryRepository } from './repository';
import { LocalRepository } from './local/localRepository';
// import { FirestoreRepository } from './firebase/firestoreRepository';

/**
 * 저장소 주입 지점 — local ↔ 실서버 교체는 여기 한 줄이다. (BE 소유)
 *
 * 지금: LocalRepository(AsyncStorage, local-first).
 * 실서버 이관 시(PO가 Firebase 프로비저닝 후):
 *   export const repository: DiaryRepository = new FirestoreRepository({ projectId: '...' });
 * 화면·스토어는 DiaryRepository 인터페이스에만 의존하므로 이 파일 외에는 손대지 않는다.
 */
export const repository: DiaryRepository = new LocalRepository();

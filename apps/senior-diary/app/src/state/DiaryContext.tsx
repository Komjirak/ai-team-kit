/**
 * 호환 shim — 부모 루프(P1·P2)가 쓰던 useDiary를 StoreProvider에서 재노출한다.
 * 상태·목 데이터는 이제 local-first 스토어(StoreProvider)가 원본이다. (BE)
 */
export { useDiary } from './StoreProvider';
export type { AnswerStateView, AnswerStateView as AnswerState } from './StoreProvider';

/**
 * 구조화 로그 (BE 하네스 DoD: 실거래 검증이 로그 한 줄로 끝나야 한다).
 *
 * 형식: {"ts":..., "type":"<domain.event>", "outcome":"<ok|noop|skip|fail>", ...}
 * 로컬-first라 콘솔에 찍는다. 실서버로 옮기면 이 한 지점만 Cloud Logging 등으로 바꾼다.
 */

export type Outcome = 'ok' | 'noop' | 'skip' | 'fail';

export type LogEvent = {
  type: string;
  outcome: Outcome;
  [k: string]: unknown;
};

export function logEvent(type: string, outcome: Outcome, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), type, outcome, ...fields });
  // eslint-disable-next-line no-console
  console.log(line);
}

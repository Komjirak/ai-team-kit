import type { Answer } from '@/domain/types';
import { transcribe } from './stt';
import { logEvent } from '@/services/log';

/**
 * "밤사이 정리" 작업 — 답변 상태 전이(녹음됨/정리중 → 정리완료)를 구동한다. IA §5-1.
 *
 * BE 규칙(멱등 + 순서 가드): 이 작업은 두 번 실행돼도 결과가 같다.
 *  - 이미 done이면 no-op(멱등) — 중복 실행·재시도·데모 수동 트리거 중복을 흡수.
 *  - now(이벤트 시각)로 organizedAt/stateUpdatedAt을 찍는다. 스토어 쓰기 계층의
 *    writeAnswerIfNewer 가드와 한 세트로, 늦게 도착한 낡은 결과가 새 상태를 덮지 못한다.
 */

/** 답변 1건 정리(멱등). done이면 그대로 반환. */
export async function organizeAnswer(a: Answer, now: number): Promise<Answer> {
  if (a.state === 'done') {
    logEvent('nightly.organize', 'noop', { answerId: a.id, reason: 'already_done' });
    return a;
  }
  const stt = await transcribe(a.questionId, a.audio);
  const updated: Answer = {
    ...a,
    state: 'done',
    transcriptRaw: stt.transcriptRaw,
    transcriptClean: stt.transcriptClean,
    organizedAt: now,
    stateUpdatedAt: now,
  };
  logEvent('nightly.organize', 'ok', { answerId: a.id, questionId: a.questionId });
  return updated;
}

/** 대기 중(recorded/organizing) 답변을 모두 정리한다. 멱등 — 없으면 no-op. */
export async function runNightly(answers: Answer[], now: number = Date.now()): Promise<Answer[]> {
  let organized = 0;
  const out: Answer[] = [];
  for (const a of answers) {
    if (a.state === 'organizing' || a.state === 'recorded') {
      out.push(await organizeAnswer(a, now));
      organized += 1;
    } else {
      out.push(a);
    }
  }
  logEvent('nightly.run', organized > 0 ? 'ok' : 'noop', { scanned: answers.length, organized });
  return out;
}

import type { AudioMeta } from '@/domain/types';
import { cleanupFor } from '@/data/seed/sttCleanups';
import { logEvent } from '@/services/log';

/**
 * 모의 STT — 실제 음성인식은 안 한다(§3-3: STT는 서버 배치). 질문별 그럴듯한 정리본을 반환한다.
 * 원음 메타(uri·길이·목여부)는 그대로 보존(R7). 실서버에서는 이 함수가 RTZR/OpenAI STT +
 * LLM 후처리 호출로 대체된다 — 인터페이스(입력 questionId+audio → 정리본)는 동일하게 유지한다.
 */
export type SttResult = {
  transcriptRaw: string; // 간투사 포함 원문(데모는 정리본과 동일 취급)
  transcriptClean: string; // 밤사이 정리본
};

export async function transcribe(questionId: string, audio: AudioMeta): Promise<SttResult> {
  const clean = cleanupFor(questionId);
  logEvent('stt.transcribe', 'ok', {
    questionId,
    audioMock: audio.mock,
    durationSec: audio.durationSec,
    chars: clean.length,
  });
  return { transcriptRaw: clean, transcriptClean: clean };
}

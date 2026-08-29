import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';

/**
 * P2 녹음 훅.
 *
 * 실제 마이크 녹음은 expo-audio로 붙인다. 권한 거부·미지원 환경에서는 "목 녹음"(상태·타이머만)으로
 * 폴백한다 — 이 컨테이너에서 실기기 녹음은 검증 불가하므로 코드는 넣되 폴백을 명확히 한다.
 *
 * ⚠️ 미검증: 실제 마이크 캡처·파일 저장·장시간(1~3분) 녹음은 실기기에서만 확인된다.
 *   여기 로직은 typecheck/export까지만 검증됨. expo-audio 네이티브 모듈은 dev-build/기기에서 동작.
 *
 * 화면(P2)에 노출되는 경과 시간은 항상 setInterval로 구동(실/목 동일) — P2 설계상 "경과 시간만,
 * 카운트다운 없음". 실 모드 종료 시 파일 uri를 반환한다(목 모드는 uri=null).
 */

export type RecorderStatus = 'idle' | 'recording' | 'stopped';
export type MicPermission = 'unknown' | 'granted' | 'denied';

export type FinishResult = { uri: string | null; durationSec: number; mock: boolean };

export type UseRecorder = {
  status: RecorderStatus;
  isMock: boolean; // 목 녹음으로 폴백됐는가(권한 거부·미지원)
  permission: MicPermission;
  elapsedSec: number;
  errorCode: string | null; // 원인 코드 노출(팀 규칙 6): 'record.mic_denied' 등
  start: () => Promise<void>;
  finish: () => Promise<FinishResult>;
  reset: () => void;
};

export function useRecorder(): UseRecorder {
  // 훅 규칙: 최상위에서 무조건 호출. 네이티브 미지원 환경에선 start()에서 목으로 폴백.
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [isMock, setIsMock] = useState(false);
  const [permission, setPermission] = useState<MicPermission>('unknown');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setElapsedSec(0);
    tick.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const start = useCallback(async () => {
    setErrorCode(null);
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        // 권한 거부 → 목 녹음 폴백 + 화면이 안내를 띄울 수 있게 상태 노출.
        setPermission('denied');
        setErrorCode('record.mic_denied');
        setIsMock(true);
        setStatus('recording');
        startTimer();
        return;
      }
      setPermission('granted');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsMock(false);
      setStatus('recording');
      startTimer();
    } catch (e) {
      // 네이티브 미지원·준비 실패 등 → 목 녹음으로 계속(흐름을 끊지 않는다).
      setErrorCode('record.unavailable');
      setIsMock(true);
      setStatus('recording');
      startTimer();
    }
  }, [recorder, startTimer]);

  const finish = useCallback(async (): Promise<FinishResult> => {
    stopTimer();
    const durationSec = elapsedSec;
    setStatus('stopped');
    if (isMock) {
      return { uri: null, durationSec, mock: true };
    }
    try {
      await recorder.stop();
      return { uri: recorder.uri ?? null, durationSec, mock: false };
    } catch {
      setErrorCode('record.stop_failed');
      return { uri: null, durationSec, mock: false };
    }
  }, [elapsedSec, isMock, recorder, stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    setStatus('idle');
    setElapsedSec(0);
    setErrorCode(null);
    setIsMock(false);
  }, [stopTimer]);

  return { status, isMock, permission, elapsedSec, errorCode, start, finish, reset };
}

/** 경과 초 → "M:SS" (P2 타이머 표기) */
export function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedDoc } from '@/domain/types';
import { logEvent } from '@/services/log';

/**
 * 온디바이스 영속화 — AsyncStorage 래퍼. (BE 소유)
 *
 * 저장소 선택 근거(왜 AsyncStorage인가):
 *  - Expo Go에 기본 번들됨 → 네이티브 dev-build 없이 iOS·Android에서 즉시 동작(하네스 요건).
 *  - 웹(expo export web)에서 localStorage로 폴백 → 세 플랫폼 export 게이트 통과.
 *  - 데이터가 작다(가족 1 · 답변 수십). 관계형(expo-sqlite)의 네이티브 표면·웹 WASM 설정이
 *    이 규모엔 과하다. 문서(JSON blob) 저장이 local-first 데모에 충분하고 교체가 쉽다.
 *  - 모든 read/write를 try/catch로 감싼다(비공개 창·저장소 차단 등에서 조용히 빈 값 처리).
 */
const DOC_KEY = 'harudam:v1:doc';

export async function readDoc(): Promise<PersistedDoc | null> {
  try {
    const raw = await AsyncStorage.getItem(DOC_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedDoc;
  } catch (e) {
    logEvent('storage.read', 'fail', { key: DOC_KEY, error: String(e) });
    return null;
  }
}

export async function writeDoc(doc: PersistedDoc): Promise<void> {
  try {
    await AsyncStorage.setItem(DOC_KEY, JSON.stringify(doc));
  } catch (e) {
    logEvent('storage.write', 'fail', { key: DOC_KEY, error: String(e) });
  }
}

export async function clearDoc(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DOC_KEY);
  } catch (e) {
    logEvent('storage.clear', 'fail', { key: DOC_KEY, error: String(e) });
  }
}

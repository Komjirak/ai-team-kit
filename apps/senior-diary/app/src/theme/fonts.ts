import { useFonts } from 'expo-font';
import { Platform } from 'react-native';
import { GowunBatang_400Regular } from '@expo-google-fonts/gowun-batang/400Regular';
import { GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang/700Bold';
import { NotoSansKR_400Regular } from '@expo-google-fonts/noto-sans-kr/400Regular';
import { NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr/700Bold';
import type { FontRole } from './tokens';

/**
 * 폰트 로딩·해석 — BRAND §4-2가 지정한 정본 서체.
 *
 * - 이야기의 목소리(serif) = **고운바탕(Gowun Batang)** — 질문·이야기·로고·책.
 * - 손잡이(sans)         = **Noto Sans KR** — 버튼·내비·상태·자녀 UI.
 * 이제 한글이 시스템 폴백이 아니라 두 정본 서체로 렌더된다(코드상).
 *
 * ⚖️ 번들 용량 (하네스 규칙: 대용량 폰트 번들 경계):
 *   고운바탕 400/700(≈16MB) + Noto Sans KR 400/700(≈12MB) = 4종만 번들한다.
 *   지시된 5종(serif 400/700 + sans 400/500/700, ≈34MB)에서 **sans 500(Medium)을 뺐다** —
 *   500은 400으로 매핑(라벨 두께 차이는 미미, 34MB→28MB). 더 줄이려면 sans를 시스템 폰트로
 *   되돌리면 ≈12MB 절감(off-switch, README 참고). 정본 감성의 핵심인 serif는 유지.
 *
 * ⚠️ 미검증: 고운바탕 한글 글리프의 실제 표시·자간·행간은 실기기(dev build)에서만 육안 확인 가능.
 */

export const APP_FONT_FACES = {
  GowunBatang_400Regular,
  GowunBatang_700Bold,
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
};

export function useAppFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useFonts(APP_FONT_FACES);
  return { loaded, error: error ?? null };
}

// 폰트 미로딩 시 폴백(시스템). serif는 한글 명조가 시스템에 없을 수 있어 시스템 세리프.
const systemSerif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

/**
 * 타이포 role + weight → 실제 fontFamily 이름.
 * loaded면 명명된 웨이트 페이스를 반환(폰트가 두께를 담고 있으므로 fontWeight는 typography에서 생략).
 * 미로딩이면 undefined/systemSerif(시스템 폴백) — 이때만 fontWeight를 적용한다.
 */
export function resolveFontFamily(
  role: FontRole,
  weight: '400' | '500' | '600' | '700',
  loaded: boolean,
): string | undefined {
  if (!loaded) return role === 'serif' ? systemSerif : undefined;
  const bold = weight === '600' || weight === '700';
  if (role === 'serif') return bold ? 'GowunBatang_700Bold' : 'GowunBatang_400Regular';
  return bold ? 'NotoSansKR_700Bold' : 'NotoSansKR_400Regular';
}

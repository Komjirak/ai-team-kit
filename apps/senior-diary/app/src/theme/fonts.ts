import { useFonts } from 'expo-font';
import { Platform } from 'react-native';
import { SourceSerif4_400Regular } from '@expo-google-fonts/source-serif-4/400Regular';
import { SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4/600SemiBold';
import type { FontRole } from './tokens';

/**
 * 폰트 로딩·해석.
 *
 * 하네스 규칙("폰트·대용량 에셋은 번들 금지, 온디맨드 다운로드") 준수 방식:
 * - Source Serif 4(라틴 세리프)만 번들한다 — 가볍고, "이야기의 목소리"(명조)의 의도를 세운다.
 * - Noto Sans KR / 한국어 명조(고운바탕·Noto Serif KR)는 수 MB라 번들하지 않는다.
 *   · UI(sans)의 한글은 시스템 폰트가 완벽히 렌더한다(iOS Apple SD Gothic Neo / Android Noto Sans CJK).
 *   · 질문·본문(serif)의 한글 명조 렌더는 이번 슬라이스에서 시스템 세리프 폴백으로 둔다.
 *     TODO(BRAND/PD): 정본 한국어 명조는 온디맨드 다운로드로 붙인다(하네스 규칙). 미검증 항목.
 *
 * ⚠️ 미검증: Source Serif 4에는 한글 글리프가 없어, 한글 질문은 실기기에서 시스템 세리프로
 *   글리프 단위 폴백된다. iOS는 글리프 폴백이 매끄럽지만 Android 기기별 편차는 실기기 확인 대상.
 */

export function useAppFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useFonts({
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
  });
  return { loaded, error: error ?? null };
}

// 시스템 세리프 폴백(폰트 미로딩/한글 글리프 폴백용)
const systemSerif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

/**
 * 타이포 role + weight → 실제 fontFamily 이름.
 * loaded=false면 세리프도 시스템 폴백으로 내린다(레이아웃 파손 없이 계속 동작).
 * sans는 항상 undefined = 시스템 UI 폰트(한글 완전 지원).
 */
export function resolveFontFamily(
  role: FontRole,
  weight: '400' | '500' | '600' | '700',
  loaded: boolean,
): string | undefined {
  if (role === 'sans') {
    // 시스템 폰트에 맡긴다. weight는 style의 fontWeight로 처리(별도 파일 불필요).
    return undefined;
  }
  // serif
  if (!loaded) return systemSerif;
  // Source Serif 4는 400/600만 로드. 600/700 요청은 SemiBold로 매핑.
  return weight === '400' || weight === '500'
    ? 'SourceSerif4_400Regular'
    : 'SourceSerif4_600SemiBold';
}

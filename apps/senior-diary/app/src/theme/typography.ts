import type { TextStyle } from 'react-native';
import { type, type TypeName, type TypeToken } from './tokens';
import { resolveFontFamily } from './fonts';

/**
 * 타이포 토큰 이름 → RN TextStyle (색 제외).
 * RN lineHeight는 절대 px이므로 fontSize * lineHeightRatio로 환산한다.
 * 색은 호출부에서 color 토큰으로 따로 준다(색·타이포 관심사 분리).
 */
export function typography(name: TypeName, fontsLoaded: boolean): TextStyle {
  const t: TypeToken = type[name];
  const fontFamily = resolveFontFamily(t.family, t.fontWeight, fontsLoaded);
  const style: TextStyle = {
    fontSize: t.fontSize,
    lineHeight: Math.round(t.fontSize * t.lineHeightRatio),
    fontFamily,
  };
  // 명명된 웨이트 페이스가 로드된 경우 폰트가 두께를 담으므로 fontWeight를 생략한다
  // (RN에서 굵기 이중 적용/합성 볼드를 피함). 폴백일 때만 fontWeight로 두께를 준다.
  if (!fontsLoaded) style.fontWeight = t.fontWeight;
  if (t.letterSpacing !== undefined) style.letterSpacing = t.letterSpacing;
  return style;
}

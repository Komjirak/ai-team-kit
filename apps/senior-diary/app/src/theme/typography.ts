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
  const style: TextStyle = {
    fontSize: t.fontSize,
    lineHeight: Math.round(t.fontSize * t.lineHeightRatio),
    fontWeight: t.fontWeight,
    fontFamily: resolveFontFamily(t.family, t.fontWeight, fontsLoaded),
  };
  if (t.letterSpacing !== undefined) style.letterSpacing = t.letterSpacing;
  return style;
}

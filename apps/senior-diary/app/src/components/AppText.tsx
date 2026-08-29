import React from 'react';
import { Text, type TextProps, type TextStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme/typography';
import type { TypeName } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/colors';

type AppTextProps = TextProps & {
  token: TypeName;
  /** 색 토큰 키. 기본 onBackground(먹). */
  color?: keyof ColorTokens;
  style?: StyleProp<TextStyle>;
};

/**
 * 모든 텍스트의 단일 통로. 타이포 토큰 + 색 토큰만 받는다(하드코딩 색·폰트 금지).
 * 폰트 로딩 여부는 테마에서 읽어 세리프/폴백을 자동 해석.
 */
export function AppText({ token, color = 'onBackground', style, ...rest }: AppTextProps) {
  const { colors, fontsLoaded } = useTheme();
  return (
    <Text
      // 시스템 글자 확대를 존중하되(§9-5) 과확대 레이아웃 파손을 막기 위해 상한만 둔다.
      maxFontSizeMultiplier={2}
      style={[typography(token, fontsLoaded), { color: colors[color] }, style]}
      {...rest}
    />
  );
}

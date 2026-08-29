import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  /** 톤 레벨. 'flat' = 바탕과 같은 종이(테두리만), 'raised' = 살짝 다른 틴트(종이 위 종이). */
  tone?: 'flat' | 'raised';
  style?: StyleProp<ViewStyle>;
};

/**
 * 이야기 카드 — 종이 위에 놓인 한 장의 종이. 그림자 대신 1px 테두리 + 톤 레이어(DESIGN_SYSTEM 깊이 규칙).
 * 질문·답변·정리본 등 "읽는 것"을 감싼다.
 */
export function StoryCard({ children, tone = 'flat', style }: Props) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: radius.lg,
          padding: spacing.gutterBlock,
          borderColor: colors.outlineVariant,
          backgroundColor: tone === 'raised' ? colors.surfaceContainerLow : colors.surface,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth * 2, width: '100%' },
});

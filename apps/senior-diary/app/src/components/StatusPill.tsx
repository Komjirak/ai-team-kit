import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Tone = 'written' | 'organizing';

/**
 * 답변 상태 배지. 색만으로 구분하지 않도록 글리프 + 문구 동반(§9-5 색 의존 금지).
 * written = 정리된 글(✓, 놀), organizing = 밤사이 정리 중(🌙, 보조).
 */
export function StatusPill({ tone }: { tone: Tone }) {
  const { colors, radius } = useTheme();
  const written = tone === 'written';
  return (
    <View
      style={[
        styles.pill,
        {
          borderRadius: radius.full,
          backgroundColor: written ? colors.surfaceContainerHigh : colors.secondaryContainer,
        },
      ]}
    >
      <AppText token="helper" color={written ? 'primary' : 'secondary'}>
        {written ? '✓ 정리된 글' : '🌙 밤사이 정리 중'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingVertical: 5, paddingHorizontal: 12, alignSelf: 'flex-start' },
});

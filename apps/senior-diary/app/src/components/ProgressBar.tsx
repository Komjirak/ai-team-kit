import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/** 진행 바 — "쌓인 이야기"의 시각화(BRAND: 배지·스트릭 대신 켜가 차오름). ratio 0..1. */
export function ProgressBar({ ratio }: { ratio: number }) {
  const { colors, radius } = useTheme();
  const pct = Math.max(0, Math.min(1, ratio));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={[styles.track, { backgroundColor: colors.surfaceVariant, borderRadius: radius.full }]}
    >
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: colors.primaryContainer, borderRadius: radius.full }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', height: 8, overflow: 'hidden' },
  fill: { height: '100%' },
});

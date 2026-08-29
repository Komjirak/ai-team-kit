import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * 마이크 픽토그램을 순수 View로 그린다(아이콘 폰트 번들 회피 — 하네스: 대용량 에셋 금지).
 * 캡슐(마이크 몸통) + 받침 아치 + 스탠드. 장식이 아니라 행동 표식이라 색은 호출부에서.
 */
export function MicGlyph({ color, size = 44 }: { color: string; size?: number }) {
  const bodyW = size * 0.42;
  const bodyH = size * 0.6;
  const archW = size * 0.66;
  const archH = size * 0.34;
  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessible={false} importantForAccessibility="no">
      <View style={{ width: bodyW, height: bodyH, borderRadius: bodyW / 2, backgroundColor: color }} />
      <View
        style={{
          width: archW,
          height: archH,
          borderColor: color,
          borderWidth: Math.max(2, size * 0.05),
          borderTopWidth: 0,
          borderBottomLeftRadius: archW / 2,
          borderBottomRightRadius: archW / 2,
          marginTop: -archH * 0.55,
        }}
      />
      <View style={{ width: Math.max(2, size * 0.05), height: size * 0.12, backgroundColor: color }} />
      <View style={{ width: size * 0.3, height: Math.max(2, size * 0.05), borderRadius: 2, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

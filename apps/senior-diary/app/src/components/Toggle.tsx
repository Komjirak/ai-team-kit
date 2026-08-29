import React from 'react';
import { Pressable, View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/** 스위치 — "여쭈다/빼두다"(C1 민감 주제). on=여쭘. 색 + 위치 둘 다로 상태 표시. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { colors, radius } = useTheme();
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value, anim]);
  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 26] });
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.surfaceVariant, colors.primaryContainer] });
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={`${label} — ${value ? '여쭘' : '빼둠'}`}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, { backgroundColor: bg, borderRadius: radius.full }]}>
        <Animated.View style={[styles.dot, { left, borderRadius: radius.full }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 52, height: 30, justifyContent: 'center' },
  dot: { position: 'absolute', width: 26, height: 26, backgroundColor: '#ffffff' },
});

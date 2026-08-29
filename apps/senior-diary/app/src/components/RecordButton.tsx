import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View, StyleSheet } from 'react-native';
import { MicGlyph } from './MicGlyph';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  onPress: () => void;
  /** true면 "숨쉬는 원"(녹음 중 표시). reduced-motion이면 정적으로. */
  active?: boolean;
  label?: string;
};

/**
 * 큰 원형 녹음 버튼 — 지름 96pt 이상(§9-5). 놀 채움 + 흰 마이크.
 * P1에선 정적(진입 버튼), P2에선 active=true로 숨쉬는 링(의미 모션만, §9-5 · reduced-motion 존중).
 */
export function RecordButton({ onPress, active = false, label }: Props) {
  const { colors, spacing, reduceMotion } = useTheme();
  const size = Math.max(spacing.recordDiameter, 112);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active && !reduceMotion) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(0);
    return undefined;
  }, [active, reduceMotion, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View style={styles.wrap}>
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.primaryContainer,
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
      )}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label ?? '이야기 녹음하기'}
        accessibilityHint="누르면 이야기를 녹음하는 화면으로 이동해요"
        style={({ pressed }) => [
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primaryContainer,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <MicGlyph color={colors.onPrimary} size={size * 0.4} />
      </Pressable>
      {label && (
        <View style={styles.labelWrap}>
          <AppText token="labelLg" color="onSurface" style={styles.label}>
            {label}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  button: { alignItems: 'center', justifyContent: 'center', elevation: 2 },
  labelWrap: { marginTop: 16 },
  label: { textAlign: 'center' },
});

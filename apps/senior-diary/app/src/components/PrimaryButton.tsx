import React from 'react';
import { Pressable, View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * 주 행동 버튼 — 전폭, 최소 64px(§9-5), 놀(주황) 채움 + 흰 라벨(대비 ≈5:1).
 * 눌림 시 "inset" 느낌(약간 어둡게 + 축소)으로 물성 피드백(DESIGN_SYSTEM Active State).
 * 화면당 하나만 쓴다(주 행동 1개 원칙).
 */
export function PrimaryButton({ label, onPress, accessibilityHint, disabled, style }: Props) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: spacing.tapTargetMin,
          borderRadius: radius.lg,
          backgroundColor: disabled ? colors.surfaceContainerHighest : colors.primaryContainer,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.92 : 1,
        },
        style,
      ]}
    >
      <View pointerEvents="none">
        <AppText token="parentButton" color={disabled ? 'onSurfaceVariant' : 'onPrimary'} style={styles.label}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  label: { textAlign: 'center' },
});

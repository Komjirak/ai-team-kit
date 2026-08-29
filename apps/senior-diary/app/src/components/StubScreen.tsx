import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from './ScreenContainer';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * 아직 만들지 않은 화면의 자리표시자. 내비가 끊기지 않게 "제목 + 준비 중" + 뒤로 가기(명시 버튼).
 * 부모 내비 규칙: OS 뒤로 제스처에 기대지 않고 화면에 노출된 버튼으로만 이동(§9-3).
 */
export function StubScreen({ title, backLabel = '← 오늘 질문으로' }: { title: string; backLabel?: string }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <ScreenContainer justify="center">
      <View style={styles.center}>
        <AppText token="headlineLgMobile" color="onBackground" style={styles.title}>
          {title}
        </AppText>
        <AppText token="parentBody" color="onSurfaceVariant" style={styles.sub}>
          준비 중이에요
        </AppText>
      </View>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        style={{
          minHeight: spacing.tapTargetMin,
          borderRadius: radius.lg,
          borderColor: colors.outlineVariant,
          borderWidth: StyleSheet.hairlineWidth * 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText token="parentButton" color="primary">
          {backLabel}
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { textAlign: 'center' },
  sub: { textAlign: 'center' },
});

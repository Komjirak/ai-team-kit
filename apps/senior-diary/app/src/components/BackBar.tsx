import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AppText } from './AppText';
import { Logo } from './Logo';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  /** 가운데: 로고 워드마크 또는 제목 텍스트. */
  center?: 'logo' | string;
  backLabel?: string;
  onBack?: () => void;
  /** 부모 화면이면 탭 타깃 64px, 자녀는 표준. */
  senior?: boolean;
};

/** 상단 앱바 — 명시적 뒤로 버튼(아이콘+라벨) + 가운데 로고/제목. */
export function BackBar({ center = 'logo', backLabel = '뒤로', onBack, senior = false }: Props) {
  const { colors, spacing } = useTheme();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  const minH = senior ? spacing.tapTargetMin : 48;
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={back}
        accessibilityRole="button"
        accessibilityLabel={`${backLabel} 가기`}
        style={[styles.back, { minHeight: minH, minWidth: 64 }]}
        hitSlop={8}
      >
        <AppText token={senior ? 'labelLg' : 'labelMd'} color="onSurfaceVariant">
          ← {backLabel}
        </AppText>
      </Pressable>
      <View style={styles.center} pointerEvents="none">
        {center === 'logo' ? (
          <Logo size="sm" />
        ) : (
          <AppText token="headlineLgMobile" color="onSurface" style={styles.title} numberOfLines={1}>
            {center}
          </AppText>
        )}
      </View>
      <View style={{ minWidth: 64 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: 4 },
  back: { justifyContent: 'center' },
  center: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1 },
  title: { textAlign: 'center' },
});

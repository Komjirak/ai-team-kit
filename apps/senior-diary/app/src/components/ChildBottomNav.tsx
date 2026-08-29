import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useTheme } from '@/theme/ThemeProvider';

/** 자녀 하단 내비 — 홈·내 서재 2개(IA §3-2). C3·C5에서 사용. */
export function ChildBottomNav({ active }: { active: 'home' | 'library' }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const items = [
    { key: 'home' as const, label: '이야기', href: '/child/home' },
    { key: 'library' as const, label: '내 서재', href: '/child/library' },
  ];
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.surfaceContainer, borderTopColor: colors.outlineVariant, paddingBottom: insets.bottom || 8 },
      ]}
    >
      {items.map((it) => {
        const on = it.key === active;
        return (
          <Pressable
            key={it.key}
            onPress={() => router.replace(it.href)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={it.label}
            style={styles.item}
          >
            <AppText token="labelMd" color={on ? 'primary' : 'onSurfaceVariant'} style={on ? styles.on : undefined}>
              {it.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth * 2, paddingTop: 10 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  on: { fontWeight: '700' },
});

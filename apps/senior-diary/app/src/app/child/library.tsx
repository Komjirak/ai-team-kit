import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { ProgressBar } from '@/components/ProgressBar';
import { ChildBottomNav } from '@/components/ChildBottomNav';
import { useTheme } from '@/theme/ThemeProvider';
import { pastStories, libraryProgress } from '@/data/mock';

/**
 * C5 — 모아보기 (자녀, I5 진행감). 레퍼런스: stitch/C5-library + PRD §9-4 C5.
 * 진행 카드("23번째 이야기 / 365" + [책으로 미리보기]) + 월 구분 리스트. 진행감은 "쌓인 이야기"로만.
 */
export default function LibraryScreen() {
  const { colors, radius } = useTheme();
  const { count, total } = libraryProgress;

  return (
    <ScreenContainer scroll justify="flex-start" footer={<ChildBottomNav active="library" />}>
      <View style={styles.top}>
        <Logo size="sm" />
        <AppText token="labelMd" color="primary">
          내 서재
        </AppText>
      </View>

      {/* 진행 카드 */}
      <View style={[styles.progress, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant, borderRadius: radius.lg }]}>
        <AppText token="headlineLgMobile" color="onSurface">
          {count}번째 이야기 / {total}
        </AppText>
        <AppText token="labelMd" color="onSurfaceVariant">
          책이 되어가는 중
        </AppText>
        <View style={{ marginVertical: 8 }}>
          <ProgressBar ratio={count / total} />
        </View>
        <Pressable
          onPress={() => router.push('/child/book')}
          accessibilityRole="button"
          accessibilityLabel="책으로 미리보기"
          style={[styles.previewBtn, { borderColor: colors.primary, borderRadius: radius.lg }]}
        >
          <AppText token="labelLg" color="primary">
            책으로 미리보기
          </AppText>
        </Pressable>
      </View>

      {/* 월 구분 + 리스트 */}
      <View style={styles.monthRow}>
        <AppText token="labelLg" color="outline">
          8월
        </AppText>
        <View style={[styles.monthLine, { backgroundColor: colors.outlineVariant }]} />
      </View>

      <View>
        {pastStories.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push('/child/story')}
            accessibilityRole="button"
            accessibilityLabel={`${s.dateLabel} ${s.question}`}
            style={({ pressed }) => [styles.item, { borderBottomColor: colors.surfaceVariant, backgroundColor: pressed ? colors.surfaceContainer : 'transparent', borderRadius: radius.base }]}
          >
            <AppText token="helper" color="onSurfaceVariant">
              {s.dateLabel}
            </AppText>
            <AppText token="storyBody" color="onSurface" style={styles.itemTitle}>
              {s.question}
            </AppText>
            <AppText token="labelMd" color="onSurfaceVariant" numberOfLines={2}>
              {s.excerpt}
            </AppText>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  progress: { borderWidth: StyleSheet.hairlineWidth * 2, padding: 24, gap: 8, marginTop: 8 },
  previewBtn: { borderWidth: 2, minHeight: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 28, marginBottom: 8 },
  monthLine: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
  item: { paddingVertical: 16, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth * 2, gap: 4 },
  itemTitle: { marginVertical: 2 },
});

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { BackBar } from '@/components/BackBar';
import { StatusPill } from '@/components/StatusPill';
import { useTheme } from '@/theme/ThemeProvider';
import { useStories } from '@/state/StoreProvider';

/**
 * P3 — 지난 이야기 (부모). 레퍼런스: stitch/P3-archive + PRD §9-4 P3.
 * 날짜 내림차순 카드. 항목 = 날짜 · 질문 · 상태(정리된 글 / 밤사이 정리 중).
 * 빈 상태: "첫 이야기를 남기면 여기에 차곡차곡 쌓여요".
 */
export default function ArchiveScreen() {
  const { colors, radius, spacing } = useTheme();
  const stories = useStories();

  return (
    <ScreenContainer scroll justify="flex-start">
      <BackBar center="지난 이야기" backLabel="오늘 질문으로" senior onBack={() => router.replace('/parent/today')} />

      {stories.length === 0 ? (
        <View style={styles.empty}>
          <AppText token="storyBody" color="onSurfaceVariant" style={styles.emptyText}>
            첫 이야기를 남기면 여기에{'\n'}차곡차곡 쌓여요
          </AppText>
        </View>
      ) : (
        <View style={{ gap: spacing.stack, marginTop: spacing.stack }}>
          {stories.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={`${s.dateLabel} ${s.question} ${s.status === 'written' ? '정리된 글' : '밤사이 정리 중'}`}
              onPress={() => router.push('/child/story')}
              style={({ pressed }) => [
                styles.card,
                {
                  borderRadius: radius.lg,
                  borderColor: colors.outlineVariant,
                  backgroundColor: pressed ? colors.surfaceContainer : colors.surfaceContainerLowest,
                },
              ]}
            >
              <View style={styles.cardHead}>
                <AppText token="helper" color="onSurfaceVariant">
                  {s.dateLabel}
                </AppText>
                <StatusPill tone={s.status} />
              </View>
              <AppText token="storyBody" color="onSurface">
                {s.question}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { textAlign: 'center' },
  card: { borderWidth: StyleSheet.hairlineWidth * 2, padding: 24, gap: 16, minHeight: 120 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});

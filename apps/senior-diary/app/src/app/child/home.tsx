import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { StoryCard } from '@/components/StoryCard';
import { StatusPill } from '@/components/StatusPill';
import { ChildBottomNav } from '@/components/ChildBottomNav';
import { useTheme } from '@/theme/ThemeProvider';
import { useChildHome, useFamily } from '@/state/StoreProvider';

/**
 * C3 — 홈 (자녀). 레퍼런스: PRD §9-4 C3.
 * 오늘 카드(질문+부모 답변 상태) · 이번 주 3/7(숫자만, 채근 아님) · 최근 이야기 → C4.
 */
export default function ChildHomeScreen() {
  const { colors, radius } = useTheme();
  const home = useChildHome();
  const family = useFamily();
  const recent = home.recent;

  return (
    <ScreenContainer scroll justify="flex-start" footer={<ChildBottomNav active="home" />}>
      <View style={styles.top}>
        <Logo size="sm" />
        <AppText token="helper" color="onSurfaceVariant">
          이번 주 {home.weekAnswered}/{home.weekTotal}
        </AppText>
      </View>

      <View style={styles.body}>
        {/* 오늘 카드 */}
        <StoryCard tone="raised">
          <AppText token="labelMd" color="onSurfaceVariant" style={{ marginBottom: 8 }}>
            오늘의 질문
          </AppText>
          <AppText token="storyBody" color="onSurface">
            {home.todayQuestion}
          </AppText>
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
          {home.parentAnsweredToday ? (
            <View style={styles.statusRow}>
              <StatusPill tone="organizing" />
              <AppText token="helper" color="onSurfaceVariant" style={{ flex: 1 }}>
                {family.parentTitle}가 오늘 이야기를 남기셨어요. 아침에 글로 정리돼요.
              </AppText>
            </View>
          ) : (
            <AppText token="helper" color="onSurfaceVariant">
              {family.parentTitle}의 답변을 기다리고 있어요.
            </AppText>
          )}
        </StoryCard>

        {/* 최근 이야기 미리보기 */}
        <View style={{ gap: 12 }}>
          <AppText token="labelLg" color="onSurface">
            최근 이야기
          </AppText>
          {recent && (
            <Pressable
              onPress={() => router.push('/child/story')}
              accessibilityRole="button"
              accessibilityLabel={`${recent.dateLabel} ${recent.question} 읽기`}
              style={({ pressed }) => [
                styles.recent,
                { borderColor: colors.outlineVariant, borderRadius: radius.lg, backgroundColor: pressed ? colors.surfaceContainer : colors.surfaceContainerLowest },
              ]}
            >
              <AppText token="helper" color="onSurfaceVariant">
                {recent.dateLabel}
              </AppText>
              <AppText token="storyBody" color="onSurface" style={{ marginVertical: 6 }}>
                {recent.question}
              </AppText>
              <AppText token="labelMd" color="onSurfaceVariant" numberOfLines={2}>
                {recent.excerpt}
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  body: { gap: 24, marginTop: 8 },
  divider: { height: StyleSheet.hairlineWidth * 2, marginVertical: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recent: { borderWidth: StyleSheet.hairlineWidth * 2, padding: 20 },
});

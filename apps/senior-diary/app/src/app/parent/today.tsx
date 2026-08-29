import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { RecordButton } from '@/components/RecordButton';
import { CheerBanner } from '@/components/CheerBanner';
import { StoryCard } from '@/components/StoryCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useDiary } from '@/state/DiaryContext';
import { todayLabel } from '@/data/mock';

/**
 * P1 — 오늘 (부모 홈). ⭐ 반복 장면. 레퍼런스: stitch/P1-today + PRD §9-4 P1.
 * 화면당 주 행동 1개(녹음) + 보조 최대 2개(스킵·지난 이야기). 탭만, 숨은 제스처 없음(§9-5).
 */
export default function TodayScreen() {
  const { spacing } = useTheme();
  const { question, answerState, skipNotice, cheer, hasPastStories, skip, dismissCheer } = useDiary();
  const label = `${todayLabel()} · ${numberToOrdinalKo(question.ordinal)} 질문`;

  return (
    <ScreenContainer scroll justify="space-between">
      <View style={styles.header}>
        <AppText token="labelMd" color="onSurfaceVariant" style={styles.dateLabel}>
          {label}
        </AppText>
        {cheer && (
          <Pressable onPress={dismissCheer} accessibilityRole="button" accessibilityLabel={`응원 배너 닫기: ${cheer.message}`}>
            <CheerBanner message={cheer.message} />
          </Pressable>
        )}
      </View>

      <View style={styles.canvas}>
        {skipNotice && (
          <AppText token="labelMd" color="onSurfaceVariant" style={styles.notice}>
            {skipNotice}
          </AppText>
        )}

        {answerState === 'unanswered' && (
          <AppText token="headlineLgMobile" color="onBackground" style={styles.question} accessibilityRole="header">
            {question.text}
          </AppText>
        )}

        {answerState === 'organizing' && (
          <StoryCard tone="raised">
            <AppText token="headlineLgMobile" color="onBackground" style={styles.cardTitle}>
              오늘 이야기를 남기셨어요 ✓
            </AppText>
            <AppText token="parentBody" color="onSurfaceVariant" style={styles.cardBody}>
              밤사이 글로 정리해 드릴게요.
            </AppText>
          </StoryCard>
        )}

        {answerState === 'resting' && (
          <StoryCard tone="raised">
            <AppText token="headlineLgMobile" color="onBackground" style={styles.cardTitle}>
              오늘은 쉬어가도 돼요
            </AppText>
            <AppText token="parentBody" color="onSurfaceVariant" style={styles.cardBody}>
              내일 새 질문으로 찾아올게요.
            </AppText>
          </StoryCard>
        )}
      </View>

      <View style={styles.actions}>
        {answerState === 'unanswered' && (
          <>
            <RecordButton label="눌러서 이야기해 주세요" onPress={() => router.push('/parent/record')} />
            <View style={{ height: spacing.gutterBlock }} />
            <Pressable
              onPress={skip}
              accessibilityRole="button"
              accessibilityLabel="이 이야기는 넘어갈게요"
              accessibilityHint="다른 이야기로 바꿔서 여쭤봐요"
              style={styles.skip}
            >
              <AppText token="labelMd" color="onSurfaceVariant" style={styles.skipText}>
                이 이야기는 넘어갈게요
              </AppText>
            </Pressable>
          </>
        )}

        {hasPastStories && (
          <Pressable
            onPress={() => router.push('/parent/archive')}
            accessibilityRole="button"
            accessibilityLabel="지난 이야기 보기"
            style={[styles.archiveLink, { minHeight: spacing.tapTargetMin }]}
          >
            <AppText token="labelLg" color="primary">
              지난 이야기 보기 →
            </AppText>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}

/** 순번을 한국어 서수로("스물세 번째"). 목 범위(1~99). TODO(BE): 서버 시퀀스 값 사용. */
function numberToOrdinalKo(n: number): string {
  const tens = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
  const unitOrdinal = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
  if (n <= 0 || n >= 100) return `${n} 번째`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  return `${tens[t]}${u === 0 ? '' : unitOrdinal[u]} 번째`;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 16 },
  dateLabel: { textAlign: 'center', letterSpacing: 0.3 },
  canvas: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 20, width: '100%' },
  notice: { textAlign: 'center' },
  question: { textAlign: 'center' },
  cardTitle: { textAlign: 'center', marginBottom: 8 },
  cardBody: { textAlign: 'center' },
  actions: { alignItems: 'center', width: '100%', gap: 8 },
  skip: { alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingHorizontal: 16 },
  skipText: { textDecorationLine: 'underline', textAlign: 'center' },
  archiveLink: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 8 },
});

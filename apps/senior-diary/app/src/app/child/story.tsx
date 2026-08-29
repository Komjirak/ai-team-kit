import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { BackBar } from '@/components/BackBar';
import { ProgressBar } from '@/components/ProgressBar';
import { useTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme/typography';
import { useLatestStory, useFamily, useSendCheer } from '@/state/StoreProvider';

/**
 * C4 — 이야기 읽기·응원 (자녀). 레퍼런스: stitch/C4-read-cheer + PRD §9-4 C4. ⭐ 반복 장면.
 * 날짜·질문 → 정리된 글(명조) → 원음 재생 → 응원(하트 + 한마디, 빠른 문구 칩).
 * 빈 상태(밤사이 대기): 원음만 + "정리 중". 여기선 정리된 이야기(서울)를 기본 표시.
 */
const CHIPS = ['엄마, 이 얘기 처음 들었어', '오늘도 고마워요', '❤️'];

export default function StoryScreen() {
  const { colors, radius, fontsLoaded } = useTheme();
  const story = useLatestStory();
  const family = useFamily();
  const sendCheer = useSendCheer();
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState(false);
  if (!story) return null;
  const organizing = story.status === 'organizing';

  const footer = (
    <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
      {!organizing && (
        <>
          <View style={styles.chips}>
            {CHIPS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setDraft(c)}
                accessibilityRole="button"
                accessibilityLabel={`빠른 문구: ${c}`}
                style={[styles.chip, { borderColor: colors.outlineVariant, borderRadius: radius.full }]}
              >
                <AppText token="helper" color="onSurfaceVariant">
                  {c}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.inputRow}>
            <View style={[styles.heart, { borderColor: colors.outlineVariant, borderRadius: radius.full }]}>
              <AppText token="labelLg" color="primary">
                ♥
              </AppText>
            </View>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={sent ? '응원을 보냈어요' : '한마디 남기기...'}
              placeholderTextColor={colors.onSurfaceVariant}
              editable={!sent}
              style={[
                typography('labelMd', fontsLoaded),
                styles.input,
                { borderColor: colors.outlineVariant, borderRadius: radius.lg, color: colors.onSurface, backgroundColor: colors.surface },
              ]}
            />
            <Pressable
              onPress={() => { sendCheer(story.answerId, draft); setSent(true); setDraft(''); }}
              accessibilityRole="button"
              accessibilityLabel="응원 보내기"
              style={[styles.send, { backgroundColor: colors.primaryContainer, borderRadius: radius.md }]}
            >
              <AppText token="labelLg" color="onPrimary">
                ↑
              </AppText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );

  return (
    <ScreenContainer scroll justify="flex-start" footer={footer}>
      <BackBar center="logo" backLabel="뒤로" />

      <View style={styles.titleWrap}>
        <AppText token="labelMd" color="onSurfaceVariant">
          {story.dateLabel}
        </AppText>
        <AppText token="headlineLgMobile" color="onBackground" style={styles.q} accessibilityRole="header">
          “{story.question.replace(/\.\.\.$/, '')}”
        </AppText>
        <View style={[styles.rule, { backgroundColor: colors.outlineVariant }]} />
      </View>

      {/* 원음 플레이어 */}
      <View style={[styles.player, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant, borderRadius: radius.xl }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="엄마 목소리 재생"
          style={[styles.play, { backgroundColor: colors.primaryContainer }]}
        >
          <AppText token="headlineLgMobile" color="onPrimary">
            ▶
          </AppText>
        </Pressable>
        <View style={{ flex: 1, gap: 8 }}>
          <AppText token="labelMd" color="onSurface">
            엄마의 목소리
          </AppText>
          <ProgressBar ratio={organizing ? 0 : 0.3} />
          <View style={styles.times}>
            <AppText token="helper" color="onSurfaceVariant">
              {organizing ? '0:00' : '0:45'}
            </AppText>
            <AppText token="helper" color="onSurfaceVariant">
              {story.audioDuration}
            </AppText>
          </View>
        </View>
      </View>

      {/* 본문 또는 밤사이 대기 */}
      {organizing ? (
        <View style={styles.organizing}>
          <AppText token="storyBody" color="onSurfaceVariant" style={styles.organizingText}>
            🌙 {family.parentTitle}가 오늘 이야기를 남기셨어요.{'\n'}밤사이 글로 정리해 아침에 보여드릴게요.
          </AppText>
          <AppText token="helper" color="onSurfaceVariant">
            원음은 지금 바로 들으실 수 있어요.
          </AppText>
        </View>
      ) : (
        <AppText token="storyBody" color="onSurface" style={styles.storyBody}>
          {story.body}
        </AppText>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleWrap: { alignItems: 'center', gap: 16, marginTop: 16, marginBottom: 8 },
  q: { textAlign: 'center' },
  rule: { width: 64, height: StyleSheet.hairlineWidth * 2 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderWidth: StyleSheet.hairlineWidth * 2, marginTop: 8 },
  play: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  storyBody: { marginTop: 24, lineHeight: 40 },
  organizing: { marginTop: 24, gap: 10, alignItems: 'center' },
  organizingText: { textAlign: 'center' },
  footer: { borderTopWidth: StyleSheet.hairlineWidth * 2, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: StyleSheet.hairlineWidth * 2, paddingVertical: 8, paddingHorizontal: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heart: { width: 48, height: 48, borderWidth: StyleSheet.hairlineWidth * 2, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 48, borderWidth: StyleSheet.hairlineWidth * 2, paddingHorizontal: 14, paddingVertical: 10 },
  send: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});

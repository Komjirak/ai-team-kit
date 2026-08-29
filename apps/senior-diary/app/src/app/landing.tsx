import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StoryCard } from '@/components/StoryCard';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme/typography';
import { landingSampleQuestion } from '@/data/mock';

/**
 * G1 — 랜딩·사전예약 (공용). 레퍼런스: PRD §9-2(레이아웃·슬롯). 카피 문안은 GROWTH 소유.
 * 가격·출시일 없음(🔒 §5-1). 실물 책 목업 과장 금지 — "1년 뒤 한 권"은 문장으로만.
 */
const STEPS = [
  { n: 1, text: '매일 아침, 부모님께 질문 하나가 도착해요' },
  { n: 2, text: '부모님은 말로 편하게 답하시면 돼요' },
  { n: 3, text: '이야기가 쌓여 1년 뒤 한 권이 돼요' },
];

export default function LandingScreen() {
  const { colors, radius, fontsLoaded } = useTheme();
  const [contact, setContact] = useState('');
  const [done, setDone] = useState(false);

  return (
    <ScreenContainer scroll justify="flex-start">
      {/* L1 헤드 */}
      <View style={styles.head}>
        <Logo size="sm" />
        <View style={[styles.eyebrow, { backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.full }]}>
          <AppText token="labelMd" color="primary">
            사전예약
          </AppText>
        </View>
        <AppText token="headlineLg" color="onBackground" style={styles.headline} accessibilityRole="header">
          더 늦기 전에{'\n'}물어보세요
        </AppText>
        <AppText token="storyBody" color="onSurfaceVariant" style={styles.sub}>
          부모님의 하루가, 매일 한 질문으로 쌓입니다.
        </AppText>
      </View>

      {/* L2 질문 카드 예시 */}
      <StoryCard tone="raised" style={{ marginTop: 8 }}>
        <AppText token="labelMd" color="onSurfaceVariant" style={{ marginBottom: 12 }}>
          이런 걸 여쭤봐요
        </AppText>
        <AppText token="headlineLgMobile" color="onBackground">
          “{landingSampleQuestion}”
        </AppText>
      </StoryCard>

      {/* L3 작동 방식 */}
      <View style={styles.steps}>
        {STEPS.map((s) => (
          <View key={s.n} style={styles.step}>
            <View style={[styles.stepNum, { backgroundColor: colors.primaryContainer, borderRadius: radius.full }]}>
              <AppText token="labelLg" color="onPrimary">
                {s.n}
              </AppText>
            </View>
            <AppText token="parentBody" color="onSurface" style={{ flex: 1 }}>
              {s.text}
            </AppText>
          </View>
        ))}
      </View>

      {/* L4 정서 블록 */}
      <View style={[styles.emotion, { borderColor: colors.outlineVariant, borderRadius: radius.lg }]}>
        <AppText token="storyBody" color="onSurface" style={styles.emotionText}>
          선물한 사람이, 사실 선물을 받습니다.{'\n'}
          부모님의 목소리로 남은 인생 한 권 — 곁에 있을 때 가장 늦지 않은 일.
        </AppText>
      </View>

      {/* L5 사전예약 폼 */}
      {done ? (
        <View style={[styles.success, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.primary, borderRadius: radius.lg }]}>
          <AppText token="headlineLgMobile" color="onBackground" style={styles.successTitle}>
            신청되었어요 ✓
          </AppText>
          <AppText token="parentBody" color="onSurfaceVariant" style={styles.successBody}>
            오픈 소식을 가장 먼저 보내드릴게요.
          </AppText>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder="연락처 (휴대폰 또는 이메일)"
            placeholderTextColor={colors.onSurfaceVariant}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[typography('parentBody', fontsLoaded), styles.input, { borderColor: colors.outlineVariant, borderRadius: radius.lg, color: colors.onSurface, backgroundColor: colors.surface }]}
          />
          <PrimaryButton label="오픈 소식 받기" onPress={() => setDone(true)} />
        </View>
      )}

      {/* L6 신뢰 꼬리 */}
      <AppText token="helper" color="onSurfaceVariant" style={styles.trust}>
        가격은 정식 오픈 때 알려드려요 · 연락처는 안내 외에 쓰지 않아요
      </AppText>

      {/* 점검용 진입 */}
      <Pressable onPress={() => router.push('/child/profile')} style={styles.dev} accessibilityRole="button">
        <AppText token="helper" color="primary">
          (점검용) 자녀로 신청 시작 → C1
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: 14, marginTop: 8 },
  eyebrow: { paddingVertical: 6, paddingHorizontal: 14 },
  headline: { textAlign: 'center', lineHeight: 46 },
  sub: { textAlign: 'center' },
  steps: { gap: 16, marginTop: 28 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepNum: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  emotion: { borderWidth: StyleSheet.hairlineWidth * 2, padding: 24, marginTop: 28 },
  emotionText: { textAlign: 'center', lineHeight: 36 },
  form: { gap: 12, marginTop: 28 },
  input: { minHeight: 64, borderWidth: StyleSheet.hairlineWidth * 2, paddingHorizontal: 16 },
  success: { borderWidth: 2, padding: 24, gap: 8, marginTop: 28, alignItems: 'center' },
  successTitle: { textAlign: 'center' },
  successBody: { textAlign: 'center' },
  trust: { textAlign: 'center', marginTop: 20 },
  dev: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 16 },
});

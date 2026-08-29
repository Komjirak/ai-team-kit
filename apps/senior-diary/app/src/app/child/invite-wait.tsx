import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { BackBar } from '@/components/BackBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StoryCard } from '@/components/StoryCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useFamily, useInviteActions } from '@/state/StoreProvider';

/**
 * C2 — 초대 보내기·대기 (자녀). 레퍼런스: PRD §9-4 C2. 🔥 마찰 장면.
 * 발송 후 "대기"가 이 화면의 본체. 재발급 버튼 상시 노출(P0 만료 오류의 해결 경로).
 */
export default function InviteWaitScreen() {
  const { colors, radius } = useTheme();
  const family = useFamily();
  const { activateFamily, reissueInvite } = useInviteActions();

  return (
    <ScreenContainer scroll justify="flex-start">
      <BackBar center="" backLabel="이전으로" onBack={() => router.replace('/child/profile')} />

      <View style={styles.body}>
        <AppText token="headlineLgMobile" color="onBackground" accessibilityRole="header">
          {family.parentTitle}께{'\n'}초대장을 보내요
        </AppText>

        {/* 초대 링크 카드 */}
        <StoryCard tone="raised">
          <AppText token="labelMd" color="onSurfaceVariant">
            초대 링크
          </AppText>
          <View style={[styles.linkBox, { borderColor: colors.outlineVariant, borderRadius: radius.base }]}>
            <AppText token="labelMd" color="onSurface" numberOfLines={1}>
              harudam.app/i/9F3K-2A
            </AppText>
          </View>
          <View style={{ height: 12 }} />
          <PrimaryButton label="카카오톡으로 보내기" onPress={() => {}} />
          <Pressable style={styles.copy} accessibilityRole="button" accessibilityLabel="링크 복사">
            <AppText token="labelLg" color="primary">
              링크 복사
            </AppText>
          </Pressable>
        </StoryCard>

        {/* 대기 상태(본체) */}
        <View style={[styles.wait, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant, borderRadius: radius.lg }]}>
          <AppText token="storyBody" color="onSurface" style={styles.waitTitle}>
            {family.parentTitle}가 링크를 여시면{'\n'}바로 알려드릴게요
          </AppText>
          <AppText token="helper" color="onSurfaceVariant" style={styles.waitSub}>
            전화로 도와드리고 싶다면, 부모님 화면엔 “시작하기” 버튼 하나만 보여요.
          </AppText>
        </View>

        <Pressable onPress={reissueInvite} style={styles.reissue} accessibilityRole="button" accessibilityLabel="초대장 다시 만들기">
          <AppText token="labelMd" color="onSurfaceVariant" style={{ textDecorationLine: 'underline' }}>
            초대장 다시 만들기
          </AppText>
        </Pressable>

        {/* 점검용: 부모 활성화 시뮬레이트 → C3 */}
        <Pressable
          onPress={() => {
            activateFamily();
            router.replace('/child/home');
          }}
          style={[styles.devJump, { borderColor: colors.outlineVariant, borderRadius: radius.full }]}
          accessibilityRole="button"
        >
          <AppText token="helper" color="onSurfaceVariant">
            (점검용) 부모 활성화됨 → 홈으로
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { gap: 24, marginTop: 8 },
  linkBox: { borderWidth: StyleSheet.hairlineWidth * 2, paddingVertical: 12, paddingHorizontal: 14, marginTop: 8 },
  copy: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 8 },
  wait: { borderWidth: StyleSheet.hairlineWidth * 2, padding: 24, gap: 12, alignItems: 'center' },
  waitTitle: { textAlign: 'center' },
  waitSub: { textAlign: 'center' },
  reissue: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  devJump: { alignSelf: 'center', borderWidth: StyleSheet.hairlineWidth * 2, paddingVertical: 8, paddingHorizontal: 16, marginTop: 8 },
});

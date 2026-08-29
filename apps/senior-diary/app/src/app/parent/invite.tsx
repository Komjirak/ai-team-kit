import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Logo } from '@/components/Logo';
import { family } from '@/data/mock';

/**
 * P0 — 초대 진입 (부모, 1회). PRD §9-4 P0.
 * 화면의 유일한 버튼은 "시작하기". 스피너 금지. 초대한 자녀의 호칭·이름을 보여준다.
 */
export default function InviteEntryScreen() {
  return (
    <ScreenContainer justify="space-between">
      <View style={styles.top}>
        <Logo size="md" />
      </View>

      <View style={styles.center}>
        <AppText token="headlineLgMobile" color="onBackground" style={styles.line} accessibilityRole="header">
          따님 {family.childName}님이{'\n'}
          {family.parentTitle}의 이야기를{'\n'}
          기다리고 있어요
        </AppText>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="시작하기"
          onPress={() => router.replace('/parent/today')}
          accessibilityHint="오늘의 질문 화면으로 갑니다"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  line: { textAlign: 'center', lineHeight: 44 },
  actions: { width: '100%' },
});

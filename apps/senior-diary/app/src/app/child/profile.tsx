import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { BackBar } from '@/components/BackBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StoryCard } from '@/components/StoryCard';
import { Toggle } from '@/components/Toggle';
import { useTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme/typography';
import type { SensitiveTopicId } from '@/domain/types';
import { useSensitiveTopics, useSaveProfile } from '@/state/StoreProvider';

/**
 * C1 — 신청·프로필 (자녀, 2단계). 레퍼런스: stitch/C1-profile + PRD §9-4 C1.
 * C1a 관계(필수 3) → C1b 프로필(선택 5 + 민감 주제 스위치). MVP 무결제(베타 참여 문맥).
 */
type Step = 'a' | 'b';

export default function ProfileScreen() {
  const { colors, fontsLoaded } = useTheme();
  const sensitiveTopics = useSensitiveTopics();
  const saveProfile = useSaveProfile();
  const [step, setStep] = useState<Step>('a');

  const [parentTitle, setParentTitle] = useState<'어머니' | '아버지'>('어머니');
  const [parentName, setParentName] = useState('');
  const [myName, setMyName] = useState('');
  const [hometown, setHometown] = useState('');
  const [occupation, setOccupation] = useState('');
  // 민감 주제: 기본 전부 "여쭘"(true).
  const [ask, setAsk] = useState<Record<string, boolean>>(
    Object.fromEntries(sensitiveTopics.map((t) => [t.id, true])),
  );

  function submit() {
    // 자녀가 입력한 프로필 저장 → 분기 룰이 오늘의 질문에 반영된다(예: 고향=서울 치환).
    saveProfile({
      parentTitle,
      parentName,
      childName: myName,
      hometown,
      occupation,
      ask: ask as Record<SensitiveTopicId, boolean>,
    });
    router.replace('/child/invite-wait');
  }

  const ruled = [
    typography('storyBody', fontsLoaded),
    styles.ruled,
    { borderBottomColor: colors.outlineVariant, color: colors.onSurface },
  ];

  const footer = (
    <FixedFooter>
      {step === 'a' ? (
        <PrimaryButton label="다음 — 질문 맞추기" onPress={() => setStep('b')} />
      ) : (
        <PrimaryButton label="초대장 만들기" onPress={submit} />
      )}
    </FixedFooter>
  );

  return (
    <ScreenContainer scroll justify="flex-start" footer={footer}>
      <BackBar center="" backLabel={step === 'a' ? '이전으로' : '1단계로'} onBack={() => (step === 'b' ? setStep('a') : router.replace('/'))} />

      <View style={styles.head}>
        <AppText token="labelMd" color="primary" style={styles.stepLabel}>
          {step === 'a' ? '1 / 2' : '2 / 2'}
        </AppText>
        <AppText token="headlineLgMobile" color="onBackground" accessibilityRole="header">
          {step === 'a' ? '누구의 이야기를\n담을까요?' : '어머니를 더\n알려주세요'}
        </AppText>
        <AppText token="storyBody" color="onSurfaceVariant" style={styles.sub}>
          {step === 'a'
            ? '베타에 참여해 주셔서 고마워요. 먼저 관계를 알려주세요.'
            : '알려주실수록 질문이 어머니의 인생에 더 잘 맞아져요.'}
        </AppText>
      </View>

      {step === 'a' ? (
        <View style={styles.fields}>
          <Field label="부모님을 어떻게 부르세요?">
            <View style={styles.segment}>
              {(['어머니', '아버지'] as const).map((t) => {
                const on = parentTitle === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setParentTitle(t)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[
                      styles.chip,
                      {
                        borderColor: on ? colors.primary : colors.outlineVariant,
                        backgroundColor: on ? colors.primaryContainer : colors.surface,
                      },
                    ]}
                  >
                    <AppText token="labelLg" color={on ? 'onPrimary' : 'onSurfaceVariant'}>
                      {t}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Field>
          <Field label={`${parentTitle} 성함`}>
            <TextInput
              value={parentName}
              onChangeText={setParentName}
              placeholder="예: 김순자"
              placeholderTextColor={colors.onSurfaceVariant}
              style={ruled}
            />
          </Field>
          <Field label="내 이름">
            <TextInput
              value={myName}
              onChangeText={setMyName}
              placeholder="예: 지혜"
              placeholderTextColor={colors.onSurfaceVariant}
              style={ruled}
            />
          </Field>
        </View>
      ) : (
        <View style={styles.fields}>
          <Field label="고향">
            <TextInput
              value={hometown}
              onChangeText={setHometown}
              placeholder="예: 서울, 부산, 작은 마을 이름..."
              placeholderTextColor={colors.onSurfaceVariant}
              style={ruled}
            />
          </Field>

          {hometown.trim().length > 0 && (
            <StoryCard tone="raised">
              <AppText token="helper" color="onSurfaceVariant">
                <AppText token="helper" color="primary">
                  {hometown.trim()}
                </AppText>
                을 알려주셨어요. ‘처음 서울에 올라오던 날’ 질문이 ‘어릴 적 살던 동네’로 맞춰져요.
              </AppText>
            </StoryCard>
          )}

          <Field label="주로 하신 일">
            <TextInput
              value={occupation}
              onChangeText={setOccupation}
              placeholder="평생 해오신 일이나 역할..."
              placeholderTextColor={colors.onSurfaceVariant}
              style={ruled}
            />
          </Field>

          <View style={styles.sensitive}>
            <AppText token="labelLg" color="onBackground">
              여쭙지 않을 이야기
            </AppText>
            <AppText token="helper" color="onSurfaceVariant" style={{ marginBottom: 4 }}>
              가족마다 꺼내기 어려운 이야기가 있어요. 여기서 빼두면 여쭙지 않아요.
            </AppText>
            {sensitiveTopics.map((t) => (
              <View key={t.id} style={[styles.toggleRow, { borderTopColor: colors.outlineVariant }]}>
                <AppText token="storyBody" color="onBackground">
                  {t.label}
                </AppText>
                <Toggle value={ask[t.id]} onChange={(v) => setAsk((s) => ({ ...s, [t.id]: v }))} label={t.label} />
              </View>
            ))}
          </View>
          <Pressable onPress={submit} style={styles.laterLink} accessibilityRole="button">
            <AppText token="labelMd" color="onSurfaceVariant" style={{ textDecorationLine: 'underline' }}>
              나중에 채울게요
            </AppText>
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <AppText token="labelMd" color="onSurfaceVariant">
        {label}
      </AppText>
      {children}
    </View>
  );
}

function FixedFooter({ children }: { children: React.ReactNode }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ paddingHorizontal: spacing.pageMargin, paddingTop: 12, paddingBottom: 28, backgroundColor: colors.background, borderTopColor: colors.outlineVariant, borderTopWidth: StyleSheet.hairlineWidth * 2 }}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { gap: 12, marginBottom: 24, marginTop: 8 },
  stepLabel: { letterSpacing: 2 },
  sub: {},
  fields: { gap: 28, paddingBottom: 24 },
  ruled: { borderBottomWidth: StyleSheet.hairlineWidth * 2, paddingVertical: 8, paddingHorizontal: 0 },
  segment: { flexDirection: 'row', gap: 12 },
  chip: { flex: 1, minHeight: 56, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth * 2, alignItems: 'center', justifyContent: 'center' },
  sensitive: { gap: 8, marginTop: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderTopWidth: StyleSheet.hairlineWidth * 2 },
  laterLink: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 4 },
});

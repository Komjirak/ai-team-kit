import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Link, type Href } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * 둘러보기(점검용) — ⚠️ 개발/점검 전용 인덱스.
 * IA상 프로덕션 진입은 역할=진입경로(P0 초대링크 / C1 신청)라 이런 역할선택 화면은 없다.
 * 이 화면은 "폰에서 모든 화면을 둘러볼 수 있게" 하는 점검용 표면이며, 프로덕션 진입 흐름과 별개다.
 */

type Row = { href: string; code: string; label: string };

const PARENT: Row[] = [
  { href: '/parent/invite', code: 'P0', label: '초대 진입' },
  { href: '/parent/today', code: 'P1', label: '오늘 (홈) ★' },
  { href: '/parent/archive', code: 'P3', label: '지난 이야기' },
];
const CHILD: Row[] = [
  { href: '/child/profile', code: 'C1', label: '신청·프로필 (2단계)' },
  { href: '/child/invite-wait', code: 'C2', label: '초대 보내기·대기' },
  { href: '/child/home', code: 'C3', label: '홈 ★' },
  { href: '/child/story', code: 'C4', label: '이야기 읽기·응원 ★' },
  { href: '/child/library', code: 'C5', label: '모아보기 (서재)' },
  { href: '/child/book', code: 'C6', label: '책 미리보기' },
];
const COMMON: Row[] = [{ href: '/landing', code: 'G1', label: '랜딩·사전예약' }];

export default function InspectIndex() {
  return (
    <ScreenContainer scroll justify="flex-start">
      <View style={styles.head}>
        <Logo size="lg" />
        <AppText token="storyBody" color="onSurfaceVariant" style={styles.tagline}>
          매일 한 질문, 1년 뒤 한 권
        </AppText>
        <DevBadge />
      </View>

      <Section title="부모 세계" subtitle="P1↔P2↔P3 · 상시 3화면" rows={PARENT} />
      <Section title="자녀 세계" subtitle="C1→C2→C3→C4↔C5→C6" rows={CHILD} />
      <Section title="공용" subtitle="역할 배정 전" rows={COMMON} />

      <AppText token="helper" color="onSurfaceVariant" style={styles.footer}>
        실제 플로우 전이(예: P1의 녹음 버튼 → P2)는 각 화면 안에서도 이어집니다.
      </AppText>
    </ScreenContainer>
  );
}

function DevBadge() {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.badge, { borderColor: colors.outlineVariant, borderRadius: radius.full }]}>
      <AppText token="helper" color="onSurfaceVariant">
        점검용 화면 · 프로덕션 진입 흐름과 별개
      </AppText>
    </View>
  );
}

function Section({ title, subtitle, rows }: { title: string; subtitle: string; rows: Row[] }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing.gutterBlock }}>
      <AppText token="labelLg" color="onSurface">
        {title}
      </AppText>
      <AppText token="helper" color="onSurfaceVariant" style={{ marginBottom: 8 }}>
        {subtitle}
      </AppText>
      <View style={{ gap: 8 }}>
        {rows.map((r) => (
          <Link key={r.href} href={r.href as Href} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${r.code} ${r.label}`}
              style={({ pressed }) => [
                styles.row,
                {
                  borderRadius: radius.lg,
                  borderColor: colors.outlineVariant,
                  backgroundColor: pressed ? colors.surfaceContainer : colors.surface,
                },
              ]}
            >
              <View style={[styles.codeChip, { backgroundColor: colors.primaryContainer, borderRadius: radius.base }]}>
                <AppText token="labelMd" color="onPrimary">
                  {r.code}
                </AppText>
              </View>
              <AppText token="parentBody" color="onSurface" style={{ flex: 1 }}>
                {r.label}
              </AppText>
              <AppText token="labelLg" color="primary">
                →
              </AppText>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: 10, marginBottom: 8 },
  tagline: { textAlign: 'center' },
  badge: { borderWidth: StyleSheet.hairlineWidth * 2, paddingVertical: 6, paddingHorizontal: 14, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 16, borderWidth: StyleSheet.hairlineWidth * 2 },
  codeChip: { minWidth: 40, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center' },
  footer: { textAlign: 'center', marginTop: 24 },
});

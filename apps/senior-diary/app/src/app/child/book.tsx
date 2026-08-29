import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { BackBar } from '@/components/BackBar';
import { useTheme } from '@/theme/ThemeProvider';
import { bookPreview } from '@/data/mock';

/**
 * C6 — 책 미리보기 (자녀). 레퍼런스: stitch/C6-book-preview + PRD §9-4 C6.
 * B0 미리보기 라벨 · B1 표지 · B2 목차(=챕터 구조) · B3 본문 펼침면(+원음 QR) · B4 진행 꼬리.
 * MVP는 디지털 미리보기까지 — 실물 주문 없음(§3-4 O3).
 */
export default function BookScreen() {
  const { colors, radius } = useTheme();
  const b = bookPreview;

  return (
    <ScreenContainer scroll justify="flex-start">
      <BackBar center="logo" backLabel="모아보기로" onBack={() => router.replace('/child/library')} />

      {/* B0 미리보기 라벨 */}
      <View style={[styles.label, { backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.full }]}>
        <AppText token="labelMd" color="onSurfaceVariant" style={styles.labelText}>
          미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요
        </AppText>
      </View>

      {/* B1 표지 */}
      <View style={[styles.coverOuter, { backgroundColor: colors.surfaceContainerHighest, borderColor: colors.outlineVariant, borderRadius: radius.lg }]}>
        <View style={[styles.cover, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <View style={[styles.coverInner, { borderColor: colors.outlineVariant }]}>
            <View style={{ alignItems: 'center', gap: 12 }}>
              <AppText token="headlineLg" color="onBackground" style={styles.coverTitle}>
                {b.title}
              </AppText>
              <AppText token="storyBody" color="onSurfaceVariant" style={styles.coverSub}>
                {b.subtitle}
              </AppText>
            </View>
            <AppText token="labelLg" color="onSurfaceVariant">
              {b.year}
            </AppText>
          </View>
        </View>
      </View>

      {/* B2 목차 */}
      <View style={[styles.section, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant, borderRadius: radius.lg }]}>
        <AppText token="headlineLgMobile" color="primary" style={styles.tocTitle}>
          목차
        </AppText>
        <View style={{ gap: 16 }}>
          {b.toc.map((t) => (
            <View key={t.n} style={[styles.tocRow, { borderBottomColor: colors.outlineVariant }]}>
              <AppText token="storyBody" color="onSurface" style={{ flex: 1 }}>
                {t.n}. {t.title}
              </AppText>
              <AppText token="labelMd" color="onSurfaceVariant">
                p. {t.page}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* B3 펼침면 */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: radius.lg }]}>
        <AppText token="headlineLgMobile" color="onBackground" style={{ marginBottom: 16 }}>
          {b.spread.title}
        </AppText>
        <AppText token="storyBody" color="onSurfaceVariant" style={styles.spreadBody}>
          {b.spread.body}
        </AppText>
        <View style={[styles.qr, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant, borderRadius: radius.md }]}>
          <View style={[styles.qrGlyph, { borderColor: colors.primary }]}>
            <AppText token="labelLg" color="primary">
              QR
            </AppText>
          </View>
          <AppText token="labelMd" color="onSurface">
            🔗 목소리로 듣기
          </AppText>
        </View>
        <AppText token="helper" color="onSurfaceVariant" style={styles.caption}>
          {b.spread.caption}
        </AppText>
      </View>

      {/* B4 진행 꼬리 */}
      <AppText token="storyBody" color="primary" style={styles.footerNote}>
        “이야기가 쌓일수록 책이 두꺼워져요.”
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, marginTop: 8 },
  labelText: { textAlign: 'center' },
  coverOuter: { borderWidth: StyleSheet.hairlineWidth * 2, padding: 24, alignItems: 'center', marginTop: 20 },
  cover: { width: '78%', aspectRatio: 0.72, borderWidth: StyleSheet.hairlineWidth * 2, padding: 16 },
  coverInner: { flex: 1, borderWidth: 2, paddingVertical: 32, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'space-between' },
  coverTitle: { textAlign: 'center' },
  coverSub: { textAlign: 'center' },
  section: { borderWidth: StyleSheet.hairlineWidth * 2, padding: 24, marginTop: 20 },
  tocTitle: { textAlign: 'center', marginBottom: 20 },
  tocRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth * 2, paddingBottom: 8 },
  spreadBody: { lineHeight: 36 },
  qr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: StyleSheet.hairlineWidth * 2, padding: 16, marginTop: 20 },
  qrGlyph: { width: 44, height: 44, borderWidth: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  caption: { textAlign: 'center', fontStyle: 'italic', marginTop: 16 },
  footerNote: { textAlign: 'center', fontStyle: 'italic', marginTop: 28 },
});

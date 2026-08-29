import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AppText } from '@/components/AppText';
import { RecordButton } from '@/components/RecordButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StoryCard } from '@/components/StoryCard';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/theme/ThemeProvider';
import { useDiary } from '@/state/DiaryContext';
import { useRecorder, formatElapsed, type FinishResult } from '@/features/recording/useRecorder';

type Phase = 'recording' | 'confirm-short' | 'done';

/**
 * P2 — 녹음 (부모, 전체 화면 오버레이). ⭐ 반복 장면. 레퍼런스: stitch/P2-record + PRD §9-4 P2.
 * 질문이 계속 보이고, 경과 시간만(카운트다운 없음), 숨쉬는 원(reduced-motion 존중).
 * 실제 마이크는 expo-audio, 권한 거부·미지원 시 목 녹음(타이머만)으로 폴백.
 */
export default function RecordScreen() {
  const { colors, spacing } = useTheme();
  const { question, markAnswered } = useDiary();
  const rec = useRecorder();
  const [phase, setPhase] = useState<Phase>('recording');
  const [finished, setFinished] = useState<FinishResult | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      void rec.start();
    }
  }, [rec]);

  async function onDone() {
    const res = await rec.finish();
    setFinished(res);
    if (res.durationSec < 3) {
      setPhase('confirm-short');
      return;
    }
    setPhase('done');
  }

  function restart() {
    rec.reset();
    setFinished(null);
    setPhase('recording');
    void rec.start();
  }

  function leaveToToday() {
    markAnswered();
    router.replace('/parent/today');
  }

  function cancel() {
    router.replace('/parent/today');
  }

  return (
    <ScreenContainer scroll justify="space-between">
      <View style={styles.topBar}>
        <Pressable
          onPress={cancel}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          style={[styles.backBtn, { minHeight: spacing.tapTargetMin }]}
        >
          <AppText token="labelLg" color="onSurfaceVariant">
            ← 뒤로
          </AppText>
        </Pressable>
        <Logo size="sm" />
        <View style={{ width: 64 }} />
      </View>

      {phase === 'done' ? (
        <DonePanel mock={finished?.mock ?? false} onLeave={leaveToToday} />
      ) : (
        <>
          <View style={styles.prompt}>
            <AppText token="headlineLgMobile" color="onSurface" style={styles.promptText} accessibilityRole="header">
              “{firstLine(question.text)}…”
            </AppText>
            <View style={[styles.rule, { backgroundColor: colors.outlineVariant }]} />
          </View>

          <View style={styles.recorder}>
            <RecordButton active={phase === 'recording'} onPress={() => {}} />
            <AppText token="headlineLg" color="onSurface" style={styles.timer}>
              {formatElapsed(rec.elapsedSec)}
            </AppText>
            {rec.permission === 'denied' && <MicDeniedNote />}
            {rec.isMock && rec.permission !== 'denied' && (
              <AppText token="helper" color="onSurfaceVariant" style={styles.mockNote}>
                (이 기기에서는 녹음을 시험만 해요 — 시간만 흘러가요)
              </AppText>
            )}
          </View>

          <View style={styles.helper}>
            <AppText token="storyBody" color="onSurfaceVariant" style={styles.helperText}>
              천천히, 편하게 말씀하세요.
            </AppText>
            <AppText token="helper" color="onSurfaceVariant" style={styles.helperText}>
              쉬어가도 녹음은 이어져요.
            </AppText>
          </View>

          <View style={styles.footer}>
            {phase === 'confirm-short' ? (
              <View style={styles.confirm}>
                <AppText token="parentBody" color="onBackground" style={styles.confirmText}>
                  짧게 담겼어요. 이대로 보낼까요?
                </AppText>
                <PrimaryButton label="보내기" onPress={() => setPhase('done')} />
                <Pressable onPress={restart} accessibilityRole="button" accessibilityLabel="다시 이야기하기" style={styles.secondary}>
                  <AppText token="labelLg" color="primary">
                    다시 이야기하기
                  </AppText>
                </Pressable>
              </View>
            ) : (
              <PrimaryButton label="다 했어요" onPress={onDone} accessibilityHint="녹음을 마치고 오늘 이야기를 저장해요" />
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

function DonePanel({ mock, onLeave }: { mock: boolean; onLeave: () => void }) {
  return (
    <View style={styles.doneWrap}>
      <StoryCard tone="raised">
        <AppText token="headlineLgMobile" color="onBackground" style={styles.doneTitle}>
          잘 들었어요.
        </AppText>
        <AppText token="parentBody" color="onSurfaceVariant" style={styles.doneBody}>
          밤사이 글로 정리해 드릴게요.
        </AppText>
      </StoryCard>

      {/* 원음 즉시 재생. TODO(BE/APP): 실제 재생은 expo-audio useAudioPlayer(uri). 목/미검증 시 비활성 표시. */}
      <View style={[styles.playRow, { opacity: mock ? 0.5 : 1 }]}>
        <AppText token="labelLg" color="primary">
          ▶ 방금 하신 말씀 들어보기
        </AppText>
        {mock && (
          <AppText token="helper" color="onSurfaceVariant">
            (기기에서 녹음될 때 들을 수 있어요)
          </AppText>
        )}
      </View>

      <PrimaryButton label="오늘은 여기까지" onPress={onLeave} />
    </View>
  );
}

function MicDeniedNote() {
  return (
    <View style={styles.deniedWrap}>
      <AppText token="parentBody" color="onBackground" style={styles.deniedText}>
        말씀을 담으려면 마이크 허락이 필요해요.
      </AppText>
      <Pressable onPress={() => void Linking.openSettings()} accessibilityRole="button" accessibilityLabel="마이크 허락하러 가기" style={styles.deniedBtn}>
        <AppText token="labelLg" color="primary">
          허락하러 가기 →
        </AppText>
      </Pressable>
      <AppText token="helper" color="onSurfaceVariant">
        record.mic_denied
      </AppText>
    </View>
  );
}

function firstLine(text: string): string {
  return text.split('\n').join(' ').replace(/[?？]$/, '');
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  backBtn: { justifyContent: 'center', paddingRight: 8 },
  prompt: { alignItems: 'center', gap: 16, marginTop: 8 },
  promptText: { textAlign: 'center' },
  rule: { height: StyleSheet.hairlineWidth * 2, width: 96, opacity: 0.6 },
  recorder: { alignItems: 'center', gap: 20, marginVertical: 8 },
  timer: { fontVariant: ['tabular-nums'], letterSpacing: 1 },
  mockNote: { textAlign: 'center' },
  helper: { alignItems: 'center', gap: 6 },
  helperText: { textAlign: 'center' },
  footer: { width: '100%', gap: 12 },
  confirm: { width: '100%', gap: 12, alignItems: 'center' },
  confirmText: { textAlign: 'center' },
  secondary: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  doneWrap: { flexGrow: 1, justifyContent: 'center', gap: 28, width: '100%' },
  doneTitle: { textAlign: 'center', marginBottom: 8 },
  doneBody: { textAlign: 'center' },
  playRow: { alignItems: 'center', gap: 6 },
  deniedWrap: { alignItems: 'center', gap: 8, marginTop: 4 },
  deniedText: { textAlign: 'center' },
  deniedBtn: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});

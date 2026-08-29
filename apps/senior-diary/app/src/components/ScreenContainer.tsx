import React from 'react';
import { View, ScrollView, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  /** true면 내용이 넘칠 때 스크롤로 흡수(§9-5: OS 글자 200% 확대 시 말줄임 금지, 스크롤로 흡수). */
  scroll?: boolean;
  /** 세로 정렬(스크롤 아닐 때). 기본 'space-between' — 헤더/본문/행동 3단 배치. */
  justify?: ViewStyle['justifyContent'];
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * 종이 배경 + 안전영역 여백(최소 32px)의 화면 컨테이너.
 * 시니어 그립 안전을 위해 좌우 pageMargin, 상하 안전영역 + 여유.
 */
export function ScreenContainer({ children, scroll = false, justify = 'space-between', contentStyle }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const pad: ViewStyle = {
    paddingHorizontal: spacing.pageMargin,
    paddingTop: insets.top + spacing.stack,
    paddingBottom: insets.bottom + spacing.gutterBlock,
  };

  if (scroll) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar style="auto" />
        <ScrollView
          contentContainerStyle={[
            { flexGrow: 1, justifyContent: justify, width: '100%', maxWidth: 520, alignSelf: 'center' },
            pad,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      <View style={[styles.body, { justifyContent: justify }, pad, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // 시안은 phone 세로 기준이나 iPad·큰 화면에서 본문이 과하게 벌어지지 않도록 최대폭을 두고 중앙 정렬.
  body: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
});

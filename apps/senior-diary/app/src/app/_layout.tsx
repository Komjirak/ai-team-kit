import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppFonts } from '@/theme/fonts';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { DiaryProvider } from '@/state/DiaryContext';

// 폰트가 준비될 때까지 스플래시 유지. 폰트를 못 불러도(폴백) 계속 진행한다.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loaded, error } = useAppFonts();
  const ready = loaded || !!error; // 폰트 실패해도 시스템 폴백으로 렌더(레이아웃 파손 없음)

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider fontsLoaded={loaded}>
        <DiaryProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="index" />
            {/* P2 녹음 — 전체 화면 오버레이(§9-4) */}
            <Stack.Screen name="record" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="archive" />
            <Stack.Screen name="child" />
          </Stack>
        </DiaryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

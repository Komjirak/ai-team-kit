import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppFonts } from '@/theme/fonts';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { StoreProvider } from '@/state/StoreProvider';

// 폰트(고운바탕·Noto Sans KR)가 준비될 때까지 네이티브 스플래시(크림+심볼) 유지.
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
        <StoreProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="landing" />
            <Stack.Screen name="parent" />
            <Stack.Screen name="child" />
          </Stack>
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

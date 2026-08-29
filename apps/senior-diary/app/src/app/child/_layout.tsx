import { Stack } from 'expo-router';

/**
 * 자녀 세계(C1~C6)의 스택. 이번 슬라이스에서는 진입 허브 stub만.
 * 자녀 내비는 일반 모바일 관례(얕은 스택 + 하단 내비) — IA §3-2. 후속 구현.
 */
export default function ChildLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />;
}

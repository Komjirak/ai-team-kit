import { Stack } from 'expo-router';

/** 자녀 세계 스택 — 일반 모바일 관례(얕은 스택 + C3↔C5 하단 내비). IA §3-2. */
export default function ChildLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="invite-wait" />
      <Stack.Screen name="home" />
      <Stack.Screen name="story" />
      <Stack.Screen name="library" />
      <Stack.Screen name="book" />
    </Stack>
  );
}

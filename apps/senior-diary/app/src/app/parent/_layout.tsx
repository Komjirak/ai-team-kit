import { Stack } from 'expo-router';

/** 부모 세계 스택. 탭바·햄버거 없음 — 보이는 버튼으로만 이동(§9-3). P2는 전체화면 오버레이. */
export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="invite" />
      <Stack.Screen name="today" />
      <Stack.Screen name="record" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="archive" />
    </Stack>
  );
}

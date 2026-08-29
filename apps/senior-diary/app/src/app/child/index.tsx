import React from 'react';
import { StubScreen } from '@/components/StubScreen';

/**
 * 자녀 세계 진입 허브 — stub. 후속 구현: C1 신청·프로필 → C2 초대 → C3 홈 → C4 읽기·응원 →
 * C5 모아보기 → C6 책 미리보기 (design/stitch/C1·C4·C5·C6, PRD §9-4).
 * 역할은 진입 경로가 정한다(자녀 신청 흐름) — IA §1-1.
 */
export default function ChildHubScreen() {
  return <StubScreen title="자녀 화면" backLabel="← 처음으로" />;
}

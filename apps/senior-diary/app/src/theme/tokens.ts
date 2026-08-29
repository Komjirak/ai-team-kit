/**
 * 비-색 토큰(간격·모서리·타이포 스케일) — 원본은 DESIGN_SYSTEM.md front-matter.
 * rem 값은 RN용으로 px 환산(1rem = 16px). 색은 colors.ts.
 */

// ── 간격 (DESIGN_SYSTEM.spacing) ────────────────────────────────────────────
export const spacing = {
  pageMargin: 32, // margin-page 2rem — 시니어 그립 안전영역(최소 32px)
  gutterBlock: 24, // gutter-block 1.5rem
  stack: 16, // stack-spacing 1rem — 수직 스택 기본 간격
  tapTargetMin: 64, // tap-target-min — 부모 화면 모든 탭 타깃 최소(§9-5)
  // 접근성 파생(§9-5)
  tapGapMin: 16, // 타깃 간 최소 간격
  recordDiameter: 96, // 녹음 버튼 지름 최소 96pt(§9-5)
} as const;

// ── 모서리 (DESIGN_SYSTEM.rounded) ──────────────────────────────────────────
export const radius = {
  sm: 4, // 0.25rem
  base: 8, // 0.5rem
  md: 12, // 0.75rem
  lg: 16, // 1rem — 컨테이너·버튼 기본(소프트)
  xl: 24, // 1.5rem
  full: 9999,
} as const;

// ── 타이포 스케일 (DESIGN_SYSTEM.typography) ────────────────────────────────
// family: 'serif' = 이야기의 목소리(질문·본문), 'sans' = 손잡이(UI). 실제 폰트명은 fonts.ts에서 해석.
// lineHeightRatio는 배수. RN은 절대 px가 필요하므로 typographyStyle()에서 fontSize*ratio로 환산.
export type FontRole = 'serif' | 'sans';

export type TypeToken = {
  fontSize: number;
  lineHeightRatio: number;
  fontWeight: '400' | '500' | '600' | '700';
  family: FontRole;
  letterSpacing?: number;
};

export const type = {
  // 헤드라인(질문 — 데스크톱/큰 화면). 부모 질문은 화면의 주인.
  headlineLg: { fontSize: 32, lineHeightRatio: 1.4, fontWeight: '600', family: 'serif', letterSpacing: -0.64 },
  // 헤드라인(모바일 질문) — §9-5 부모 질문 최소 28pt.
  headlineLgMobile: { fontSize: 28, lineHeightRatio: 1.3, fontWeight: '600', family: 'serif' },
  // 이야기 본문 — 행간 1.7(§9-5 부모 본문 ≥1.6).
  storyBody: { fontSize: 22, lineHeightRatio: 1.7, fontWeight: '400', family: 'serif' },
  // 버튼 라벨(대) — §9-5 부모 버튼 라벨 22pt 권장. 토큰 원본은 18pt이므로 부모 버튼은 별도 상향.
  labelLg: { fontSize: 18, lineHeightRatio: 1.2, fontWeight: '700', family: 'sans' },
  labelMd: { fontSize: 16, lineHeightRatio: 1.2, fontWeight: '500', family: 'sans' },
  helper: { fontSize: 14, lineHeightRatio: 1.4, fontWeight: '400', family: 'sans' },
  // 부모 화면 전용 상향 토큰(§9-5): 본문 20pt·버튼 라벨 22pt.
  parentBody: { fontSize: 20, lineHeightRatio: 1.6, fontWeight: '400', family: 'sans' },
  parentButton: { fontSize: 22, lineHeightRatio: 1.2, fontWeight: '700', family: 'sans' },
} satisfies Record<string, TypeToken>;

export type TypeName = keyof typeof type;

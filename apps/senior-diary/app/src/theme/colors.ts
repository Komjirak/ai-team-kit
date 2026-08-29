/**
 * 색 토큰 — 원본은 DESIGN_SYSTEM.md(라이트) + BRAND.md §4-1(다크 아키타입).
 *
 * 화면에서 하드코딩 hex를 쓰지 않는다. 이 파일이 색의 단일 출처다.
 * 라이트 값은 DESIGN_SYSTEM.md front-matter의 hex를 그대로 옮겼다(어긋나면 그 문서가 이김).
 * 다크 값은 BRAND §4-1의 4개 아키타입(종이/먹/놀/흙)을 앵커로, 컨테이너 틴트는 파생.
 */

export type ColorTokens = {
  // 표면(종이) 계열
  background: string; // 화면 바탕 = 책의 종이
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  surfaceDim: string;

  // 글(먹) 계열
  onBackground: string; // 본문 먹색(부모 화면 본문은 이것만 — 13:1)
  onSurface: string;
  onSurfaceVariant: string; // 보조 문장(흙)

  // 강조(놀) — 화면당 한 곳
  primary: string;
  onPrimary: string;
  primaryContainer: string; // 녹음 버튼 채움색
  onPrimaryContainer: string;

  // 보조/외곽선
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  outline: string;
  outlineVariant: string;

  // 상태
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // 반전(스낵/토스트 자리 — 시니어 화면엔 최소)
  inverseSurface: string;
  inverseOnSurface: string;
};

// ── 라이트: DESIGN_SYSTEM.md front-matter 그대로 ──────────────────────────────
export const lightColors: ColorTokens = {
  background: '#fff8f3',
  surface: '#fff8f3',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#fef2e2',
  surfaceContainer: '#f8ecdd',
  surfaceContainerHigh: '#f2e6d7',
  surfaceContainerHighest: '#ece1d2',
  surfaceVariant: '#ece1d2',
  surfaceDim: '#e4d8c9',

  onBackground: '#201b12',
  onSurface: '#201b12',
  onSurfaceVariant: '#56423b',

  primary: '#943d16',
  onPrimary: '#ffffff',
  primaryContainer: '#b4542c',
  onPrimaryContainer: '#fff3ef',

  secondary: '#605e58',
  onSecondary: '#ffffff',
  secondaryContainer: '#e6e2da',
  onSecondaryContainer: '#66645e',
  outline: '#89726a',
  outlineVariant: '#dcc1b7',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  inverseSurface: '#363025',
  inverseOnSurface: '#fbefe0',
};

// ── 다크: BRAND §4-1 아키타입 앵커(종이 #211C16 · 먹 #EFE8DC · 놀 #E08A5C · 흙 #A79B89)
//    컨테이너 틴트는 종이에서 단계적으로 밝힌 파생값. PD가 실제 다크 대비 재검증 대상.
export const darkColors: ColorTokens = {
  background: '#211c16', // 종이(다크)
  surface: '#211c16',
  surfaceContainerLowest: '#171310',
  surfaceContainerLow: '#2a241c',
  surfaceContainer: '#312a21',
  surfaceContainerHigh: '#3c342a',
  surfaceContainerHighest: '#473e33',
  surfaceVariant: '#4d463c',
  surfaceDim: '#191410',

  onBackground: '#efe8dc', // 먹(다크) — 약 12:1
  onSurface: '#efe8dc',
  onSurfaceVariant: '#a79b89', // 흙(다크) — 약 7:1

  primary: '#e08a5c', // 놀(다크) — 약 6.4:1
  onPrimary: '#3a1600',
  primaryContainer: '#b4542c', // 채움 버튼은 라이트와 같은 놀 톤 유지(흰 글자 대비 확보)
  onPrimaryContainer: '#fff3ef',

  secondary: '#c9c6bf',
  onSecondary: '#2f2d28',
  secondaryContainer: '#484741',
  onSecondaryContainer: '#e6e2da',
  outline: '#a08d84',
  outlineVariant: '#544944',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  inverseSurface: '#efe8dc',
  inverseOnSurface: '#363025',
};

export type ColorScheme = 'light' | 'dark';

export function colorsFor(scheme: ColorScheme): ColorTokens {
  return scheme === 'dark' ? darkColors : lightColors;
}

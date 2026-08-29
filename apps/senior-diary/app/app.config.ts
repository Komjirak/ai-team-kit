import type { ExpoConfig } from 'expo/config';

/**
 * 하루담(Harudam) — Expo app config.
 *
 * 하네스 규칙 반영:
 * - runtimeVersion은 최상위 하나만(플랫폼별 오버라이드 금지). appVersion 정책 사용 →
 *   네이티브 모듈을 추가/변경하면 반드시 app version(아래 `version`)을 올린다.
 * - scheme은 네이티브에 박힌다(OTA로 못 바꾼다). 초대 딥링크(P0)의 기반이므로 한 번 정하고 고정.
 * - 권한은 "실제로 쓰는 것만" 선언한다. 지금 슬라이스가 쓰는 권한은 마이크(P2 녹음) 하나뿐 →
 *   그 외 권한 키는 만들지 않는다(애플 자동 심사가 미사용 권한 placeholder를 거절한 전례).
 * - 권한 문구 원본은 여기(plugin 옵션). 다국어(ja/en 등)로 확장할 때 로케일 파일과 세트로 옮긴다.
 */

// TODO(RM/PO): 실제 스토어 식별자 확정 후 교체. 아래는 자리표시자.
//   - iOS bundleIdentifier / Android package는 한 번 발급하면 사실상 고정(스토어 앱 ID).
//   - 상표 확정("하루담" 가칭→정식, GROWTH 게이트) 전까지 임시값. 대외 발행/빌드는 RM·PO 영역.
const IOS_BUNDLE_ID = 'com.harudam.app.placeholder';
const ANDROID_PACKAGE = 'com.harudam.app.placeholder';

// 마이크 권한 문구(원본). 시니어 대상 — 기능 설명이 아니라 안심의 언어로.
const MIC_PERMISSION_KO = '어머니·아버지의 이야기를 녹음하려면 마이크 사용을 허락해 주세요.';

const config: ExpoConfig = {
  name: '하루담',
  slug: 'harudam',
  // appVersion 런타임 정책의 대상. 네이티브 모듈/권한을 바꾸면 이 값을 올린다.
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png', // TODO(BRAND §4-3): "담기고 쌓이는 하루" 심볼로 교체 예정(현재 템플릿 자리표시자).
  // 라이트/다크 동시 지원. 시스템 설정을 따른다(부모 화면은 실외·노안 전제라 다크도 대비 확보).
  userInterfaceStyle: 'automatic',
  // 네이티브에 박히는 값 — OTA로 변경 불가. 초대 딥링크(P0)의 기반.
  scheme: 'harudam',
  // 최상위 하나. 플랫폼별로 나누지 않는다. appVersion 정책 = 같은 앱 버전끼리만 OTA가 닿는다.
  runtimeVersion: { policy: 'appVersion' },
  // 스플래시는 SDK 57에서 최상위 키가 아니라 expo-splash-screen 플러그인으로만 설정한다(아래 plugins).
  ios: {
    supportsTablet: true, // iPad 전폭 레이아웃 확인 대상(DoD). 시안은 phone 기준이나 파손 없이 흡수.
    bundleIdentifier: IOS_BUNDLE_ID,
    infoPlist: {
      NSMicrophoneUsageDescription: MIC_PERMISSION_KO,
    },
  },
  android: {
    package: ANDROID_PACKAGE,
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundColor: '#FBF7EF',
    },
    // edge-to-edge는 SDK 53+ Android 기본값(SDK 57은 설정 플래그 없이 상시 적용).
    // 키보드 회피는 화면별로 검증한다(하네스 규칙): edge-to-edge에서 adjustResize가 무효라,
    // 폴백 텍스트 입력(마이크 거부)을 붙일 때 KeyboardAvoiding을 플랫폼별로 검증한다.
    // 이번 슬라이스(P1/P2)는 텍스트 입력이 없어 키보드 회피 이슈 없음.
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        backgroundColor: '#FBF7EF',
        imageWidth: 200,
      },
    ],
    [
      // 실제로 쓰는 권한(마이크)만. 문구 원본은 여기. iOS는 위 infoPlist에도 반영(세트로 움직임).
      'expo-audio',
      {
        microphonePermission: MIC_PERMISSION_KO,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // TODO(RM/PO): EAS project id는 `eas init` 시 채워진다. 지금은 비워 둔다(빌드는 RM/PO 영역).
    router: {},
  },
};

export default config;

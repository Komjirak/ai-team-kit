// Centralized env access. When Firebase vars are absent we fall back to the
// local demo backend so the app runs end-to-end with no secrets.

const firebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const firebaseConfig = firebase

export const hasFirebase = Boolean(
  firebase.apiKey && firebase.authDomain && firebase.projectId && firebase.appId,
)

export const kakaoMapKey = (import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined) || ''
export const hasKakao = Boolean(kakaoMapKey)

/** true when we run without real backends — mock auth + localStorage data. */
export const isDemo = !hasFirebase

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

export const googleMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined) || ''
export const hasGoogleMaps = Boolean(googleMapsKey)

// M4 — 웹푸시(FCM) VAPID 공개키. 없으면 옵트인 UI는 "설정 필요"로 비활성.
export const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined) || ''
export const hasVapid = Boolean(vapidKey)

/** true when we run without real backends — mock auth + localStorage data. */
export const isDemo = !hasFirebase

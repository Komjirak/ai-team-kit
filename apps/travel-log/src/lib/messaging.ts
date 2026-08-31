import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { fbApp } from './firebase'
import { firebaseConfig, hasFirebase, hasVapid, vapidKey } from './env'
import { backend } from '../data'

// ─────────────────────────────────────────────────────────────
// FCM 웹푸시 배관. 데모/미설정에서는 절대 Firebase messaging을 건드리지 않는다.
// 권한 거부·미설정이어도 인앱 알림(NotificationBell)은 그대로 동작(폴백).
// SW는 VitePWA의 sw.js와 충돌하지 않도록 전용 scope로 직접 등록한다.
// ─────────────────────────────────────────────────────────────

export type PushStatus = 'unsupported' | 'unconfigured' | 'default' | 'granted' | 'denied'

/** 실제로 FCM을 켤 수 있는 환경인가(Firebase + VAPID 둘 다 있어야). */
export function pushConfigured(): boolean {
  return hasFirebase && hasVapid
}

export async function pushStatus(): Promise<PushStatus> {
  if (!hasFirebase) return 'unsupported' // 데모/미구성
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (!(await isSupported().catch(() => false))) return 'unsupported'
  if (!hasVapid) return 'unconfigured'
  return Notification.permission as 'default' | 'granted' | 'denied'
}

const SW_SCOPE = '/firebase-push/'

async function registerMessagingSW(): Promise<ServiceWorkerRegistration> {
  // 공개 config를 쿼리로 넘겨 SW가 같은 프로젝트로 초기화하도록 한다(비밀 아님).
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey ?? '',
    projectId: firebaseConfig.projectId ?? '',
    messagingSenderId: firebaseConfig.messagingSenderId ?? '',
    appId: firebaseConfig.appId ?? '',
  })
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`, {
    scope: SW_SCOPE,
  })
}

/** 옵트인: 권한 요청 → 토큰 발급 → 본인 유저 문서에 저장. */
export async function enablePush(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const st = await pushStatus()
  if (st === 'unsupported') return { ok: false, reason: 'push.unsupported' }
  if (st === 'unconfigured') return { ok: false, reason: 'push.unconfigured' }

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return { ok: false, reason: 'push.denied' }

  try {
    const reg = await registerMessagingSW()
    const messaging = getMessaging(fbApp())
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg })
    if (!token) return { ok: false, reason: 'fcm.token_failed' }
    await backend.saveFcmToken(userId, token)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'fcm.token_failed' }
  }
}

/** 옵트아웃: 토큰 삭제 + 서버에서 제거. */
export async function disablePush(userId: string): Promise<void> {
  if (!pushConfigured()) return
  try {
    const reg = await registerMessagingSW().catch(() => undefined)
    const messaging = getMessaging(fbApp())
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: reg,
    }).catch(() => null)
    if (token) {
      await backend.removeFcmToken(userId, token).catch(() => {})
      await deleteToken(messaging).catch(() => {})
    }
  } catch {
    /* best-effort */
  }
}

let fgBound = false
/** 포그라운드 수신 → 토스트 등으로 노출(중복 바인딩 방지). */
export function bindForeground(onNotify: (title: string, body: string) => void): void {
  if (fgBound || !pushConfigured()) return
  try {
    const messaging = getMessaging(fbApp())
    onMessage(messaging, (payload) => {
      onNotify(payload.notification?.title ?? '간직.log 알림', payload.notification?.body ?? '')
    })
    fgBound = true
  } catch {
    /* ignore */
  }
}

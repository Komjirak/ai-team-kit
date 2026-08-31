/* 간직.log — FCM 백그라운드 수신 Service Worker.
 *
 * 공개 Firebase config는 등록 시 쿼리스트링으로 전달받는다(비밀 아님).
 *   navigator.serviceWorker.register('/firebase-messaging-sw.js?apiKey=...&projectId=...&messagingSenderId=...&appId=...', { scope: '/firebase-push/' })
 * 이렇게 하면 소스에 프로젝트 값을 박지 않고, VitePWA의 sw.js와도 scope가 갈려 충돌하지 않는다.
 *
 * 배포 전제: Firebase Blaze 요금제 + Cloud Functions(functions/) + VAPID 키.
 * 자세한 배포법은 functions/README.md 참고.
 */
/* eslint-disable no-undef */

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

const params = new URLSearchParams(self.location.search)
const config = {
  apiKey: params.get('apiKey') || undefined,
  projectId: params.get('projectId') || undefined,
  messagingSenderId: params.get('messagingSenderId') || undefined,
  appId: params.get('appId') || undefined,
}

// config가 없으면(미구성) 조용히 아무것도 하지 않는다 — 인앱 알림이 폴백.
if (config.apiKey && config.messagingSenderId) {
  firebase.initializeApp(config)
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || '간직.log'
    const body = (payload.notification && payload.notification.body) || ''
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/favicon-32.png',
      data: payload.data || {},
    })
  })
}

// 알림 클릭 → 앱 열기(이미 열려 있으면 포커스)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    }),
  )
})

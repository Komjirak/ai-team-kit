import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { Icon } from '../../components/ui/Icon'
import { Spinner } from '../../components/ui/basics'
import { useToast } from '../../components/ui/Toast'
import {
  bindForeground,
  disablePush,
  enablePush,
  pushConfigured,
  pushStatus,
  type PushStatus,
} from '../../lib/messaging'

const reasonText: Record<string, string> = {
  'push.unsupported': '이 브라우저에서는 알림을 지원하지 않아요.',
  'push.unconfigured': '아직 서버 알림 설정(VAPID) 전이에요. 지금은 인앱 알림으로 받아요.',
  'push.denied': '브라우저에서 알림을 차단했어요. 브라우저 설정에서 허용해 주세요. (push.denied)',
  'fcm.token_failed': '알림 토큰 발급에 실패했어요. (fcm.token_failed)',
}

/** 여행 알림 옵트인 토글. 미설정·거부 시 인앱 벨로 폴백한다(항상 동작). */
export function PushSettings() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [status, setStatus] = useState<PushStatus | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    pushStatus().then(setStatus)
  }, [])

  const configured = pushConfigured()
  const hasToken = (user?.fcmTokens?.length ?? 0) > 0
  const on = status === 'granted' && hasToken

  async function toggle() {
    if (!user || busy) return
    setBusy(true)
    try {
      if (on) {
        await disablePush(user.id)
        await refreshUser()
        toast.show('여행 알림을 껐어요. 인앱 알림은 계속 받아요.')
      } else {
        const r = await enablePush(user.id)
        if (r.ok) {
          await refreshUser()
          bindForeground((title, body) => toast.show(body ? `${title} · ${body}` : title))
          toast.show('여행 알림을 켰어요.')
        } else {
          toast.show(reasonText[r.reason ?? ''] ?? '알림을 켜지 못했어요.')
        }
      }
      setStatus(await pushStatus())
    } finally {
      setBusy(false)
    }
  }

  const disabled = !configured || status === 'unsupported' || status === 'denied' || busy

  return (
    <section className="dl-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="dl-mono text-xs font-bold tracking-wider text-muted">여행 알림</p>
          <p className="mt-1 text-sm text-ink">합류·일정 변경·정산 요청을 푸시로 받아요.</p>
          <p className="mt-1 text-xs text-muted">
            {!configured
              ? '실제 배포 환경(Firebase + VAPID)에서 켤 수 있어요. 지금은 인앱 알림(🔔)으로 받아요.'
              : status === 'denied'
                ? reasonText['push.denied']
                : status === 'unsupported'
                  ? reasonText['push.unsupported']
                  : on
                    ? '켜짐 — 이 기기로 알림이 와요.'
                    : '꺼짐 — 켜면 이 기기에 푸시가 와요. 꺼도 인앱 알림은 계속 동작해요.'}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={on}
          aria-label="여행 알림 토글"
          onClick={toggle}
          disabled={disabled}
          className={`dl-focus relative mt-1 grid h-7 w-12 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-40 ${
            on ? 'bg-primary' : 'bg-surface-variant'
          }`}
        >
          {busy ? (
            <Spinner size={14} className={on ? 'text-on-primary' : 'text-muted'} />
          ) : (
            <span
              className={`absolute h-5 w-5 rounded-full bg-surface shadow transition-transform ${
                on ? 'translate-x-2.5' : '-translate-x-2.5'
              }`}
            />
          )}
        </button>
      </div>
      {!configured && (
        <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-surface-container px-3 py-2 text-xs text-muted">
          <Icon name="notifications" size={14} /> 인앱 알림은 항상 켜져 있어요 — 상단 🔔에서 확인해요.
        </p>
      )}
    </section>
  )
}

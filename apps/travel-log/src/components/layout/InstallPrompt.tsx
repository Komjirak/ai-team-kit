import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'

const DISMISS_KEY = 'ganjik:install-dismissed'

// 설치(홈 화면 추가) 안내 배너 — 이미 PWA(매니페스트+SW)라서, 여기선 "앱 설치"를
// 눈에 보이게 띄운다. 안드로이드/데스크톱은 beforeinstallprompt, iOS는 안내 문구.
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      /* private mode */
    }
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (standalone) return // 이미 설치되어 실행 중

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBip)

    // iOS Safari는 beforeinstallprompt가 없어 안내로 대체
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)
    if (isIos && isSafari) {
      setIos(true)
      setShow(true)
    }
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  function dismiss() {
    setShow(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* noop */
    }
  }

  async function install() {
    if (!deferred) return
    deferred.prompt()
    try {
      await deferred.userChoice
    } catch {
      /* noop */
    }
    setDeferred(null)
    dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 md:bottom-6">
      <div className="dl-card flex w-full max-w-md items-center gap-3 border border-primary/20 p-3 shadow-glow-primary">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary">
          <Icon name="luggage" size={22} fill />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">간직.log를 앱으로 설치</p>
          <p className="text-xs text-muted">
            {ios ? '공유 버튼 → “홈 화면에 추가”를 누르면 앱처럼 열려요.' : '홈 화면에 추가하면 앱처럼 빠르게 열려요.'}
          </p>
        </div>
        {!ios && (
          <button
            onClick={install}
            className="dl-focus shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary active:scale-95"
          >
            설치
          </button>
        )}
        <button
          onClick={dismiss}
          className="dl-focus grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-container"
          aria-label="닫기"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  )
}

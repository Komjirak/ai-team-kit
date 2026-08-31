import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Icon } from './Icon'

interface ToastItem {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface ToastApi {
  show: (message: string, opts?: { actionLabel?: string; onAction?: () => void; duration?: number }) => void
}

const Ctx = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: number) => {
    setItems((xs) => xs.filter((x) => x.id !== id))
  }, [])

  const show = useCallback<ToastApi['show']>(
    (message, opts) => {
      const id = ++idRef.current
      setItems((xs) => [...xs, { id, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction }])
      window.setTimeout(() => remove(id), opts?.duration ?? 5000)
    },
    [remove],
  )

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="dl-card pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 px-4 py-3 shadow-glow-primary"
          >
            <Icon name="favorite" fill className="text-primary-container" size={20} />
            <span className="flex-1 text-sm font-medium text-ink">{t.message}</span>
            {t.actionLabel && (
              <button
                className="dl-mono shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary"
                onClick={() => {
                  t.onAction?.()
                  remove(t.id)
                }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useToast must be used within ToastProvider')
  return v
}

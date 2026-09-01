import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'
import type { PlaceCategory } from '../../data/types'

// ── Button ────────────────────────────────────────────────────
type Variant = 'primary' | 'soft' | 'ghost'
export function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  loading,
  ...rest
}: {
  variant?: Variant
  icon?: string
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls =
    variant === 'primary' ? 'dl-btn-primary' : variant === 'soft' ? 'dl-btn-soft' : 'dl-btn-ghost'
  return (
    <button className={`${cls} dl-focus ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Spinner size={18} /> : icon ? <Icon name={icon} size={20} /> : null}
      {children}
    </button>
  )
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="불러오는 중"
    />
  )
}

// ── Category badge (gray pill) & wishlist badge ───────────────
const catStyle: Partial<Record<PlaceCategory, string>> = {
  관광: 'bg-pastel-blue text-secondary',
  맛집: 'bg-tape-yellow/60 text-ink',
  카페: 'bg-primary-soft text-primary',
  쇼핑: 'bg-pastel-lavender text-secondary',
  자연: 'bg-pastel-mint text-tertiary',
  문화: 'bg-pastel-blue text-secondary',
  숙소: 'bg-pastel-lavender text-secondary',
  기타: 'bg-surface-container text-muted',
}
export function CategoryBadge({ category }: { category: PlaceCategory }) {
  return (
    <span
      className={`dl-mono inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${catStyle[category] ?? catStyle['기타']}`}
    >
      #{category}
    </span>
  )
}

export function Badge({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary ${className}`}
    >
      {children}
    </span>
  )
}

// ── Empty state (P3: 빈 화면을 다음 행동으로 연결) ────────────
export function EmptyState({
  icon = 'auto_awesome',
  title,
  hint,
  action,
}: {
  icon?: string
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="dl-card mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} size={28} />
      </div>
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────
export function ErrorState({
  message,
  code,
  onRetry,
}: {
  message: string
  code?: string
  onRetry?: () => void
}) {
  return (
    <div className="dl-card mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-error-container text-error">
        <Icon name="sentiment_dissatisfied" size={28} />
      </div>
      <p className="font-display text-lg font-bold text-ink">{message}</p>
      {code && <p className="dl-mono text-xs text-muted">({code})</p>}
      {onRetry && (
        <Button variant="soft" icon="refresh" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`dl-skeleton rounded-card ${className}`} />
}

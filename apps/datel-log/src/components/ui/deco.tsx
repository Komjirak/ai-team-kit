import type { CSSProperties, ReactNode } from 'react'

type WashiColor = 'yellow' | 'lavender' | 'mint' | 'blue'
const washiClass: Record<WashiColor, string> = {
  yellow: '',
  lavender: 'washi-lavender',
  mint: 'washi-mint',
  blue: 'washi-blue',
}

/** A strip of washi tape pinning a card to the page. Absolutely positioned. */
export function Washi({
  color = 'yellow',
  className = '',
  rotate = -3,
  style,
}: {
  color?: WashiColor
  className?: string
  rotate?: number
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={`washi ${washiClass[color]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    />
  )
}

/** A pushpin sticker overlapping a card corner. */
export function Pin({ className = '', color = '#984631' }: { className?: string; color?: string }) {
  return (
    <span aria-hidden="true" className={`absolute z-10 ${className}`}>
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
        <circle cx="13" cy="11" r="9" fill={color} />
        <circle cx="10" cy="8" r="3" fill="rgba(255,255,255,0.5)" />
        <path d="M13 20v9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/** A small floating sticker (star / sparkle / heart) that overlaps a corner. */
export function Sticker({
  icon,
  className = '',
  bg = 'bg-surface',
  color = 'text-primary',
}: {
  icon: ReactNode
  className?: string
  bg?: string
  color?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 grid h-10 w-10 place-items-center rounded-full border border-black/5 shadow-soft ${bg} ${color} ${className}`}
    >
      {icon}
    </span>
  )
}

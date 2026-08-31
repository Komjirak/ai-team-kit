import type { CSSProperties } from 'react'

/** Material Symbols Outlined icon. */
export function Icon({
  name,
  className = '',
  size,
  fill,
}: {
  name: string
  className?: string
  size?: number
  fill?: boolean
}) {
  const style: CSSProperties = {}
  if (size) style.fontSize = size
  if (fill) style.fontVariationSettings = "'FILL' 1"
  return (
    <span className={`material-symbols-outlined ${className}`} style={style} aria-hidden="true">
      {name}
    </span>
  )
}

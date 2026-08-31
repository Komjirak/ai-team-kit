import { Icon } from './Icon'

type Tone = 'primary' | 'mint' | 'lavender' | 'blue' | 'yellow'
const tone: Record<Tone, { chip: string; glow: string }> = {
  primary: { chip: 'bg-primary-soft text-primary', glow: 'shadow-glow-primary' },
  mint: { chip: 'bg-pastel-mint text-tertiary', glow: 'shadow-glow-mint' },
  lavender: { chip: 'bg-pastel-lavender text-secondary', glow: 'shadow-glow-lavender' },
  blue: { chip: 'bg-pastel-blue text-secondary', glow: 'shadow-soft' },
  yellow: { chip: 'bg-tape-yellow/70 text-ink', glow: 'shadow-soft' },
}

/** Stat tile: big mono number over a label, with a colored icon chip. */
export function StatTile({
  icon,
  value,
  label,
  color = 'primary',
  onClick,
}: {
  icon: string
  value: string | number
  label: string
  color?: Tone
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`dl-card dl-focus flex flex-col items-start gap-2 p-4 text-left ${onClick ? 'transition-transform active:scale-[0.97]' : ''}`}
    >
      <span className={`grid h-9 w-9 place-items-center rounded-full ${tone[color].chip}`}>
        <Icon name={icon} size={20} />
      </span>
      <span className="dl-mono text-3xl font-bold leading-none text-ink">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </Tag>
  )
}

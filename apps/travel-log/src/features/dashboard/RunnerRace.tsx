import { Icon } from '../../components/ui/Icon'

interface Runner {
  userId: string
  nickname: string
  count: number
}

/** Playful "runner race" progress bars — competition framed as recollection (§9). */
export function RunnerRace({ runners, meId }: { runners: Runner[]; meId?: string }) {
  const max = Math.max(1, ...runners.map((r) => r.count))
  const colors = ['#984631', '#655689']

  return (
    <div className="dl-card space-y-4 p-5">
      {runners.map((r, i) => {
        const pct = Math.round((r.count / max) * 100)
        return (
          <div key={r.userId}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">
                {r.nickname}
                {r.userId === meId && <span className="ml-1 text-xs text-muted">(나)</span>}
              </span>
              <span className="dl-mono font-bold text-ink">{r.count}곳</span>
            </div>
            <div className="relative h-6 rounded-full bg-surface-container">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{ width: `${Math.max(8, pct)}%`, backgroundColor: colors[i % colors.length] + '33' }}
              />
              <span
                className="absolute top-1/2 -translate-y-1/2 animate-run text-lg"
                style={{ left: `calc(${Math.max(8, pct)}% - 18px)` }}
                aria-hidden
              >
                🏃
              </span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm" aria-hidden>
                🏁
              </span>
            </div>
          </div>
        )
      })}
      {runners.length === 0 && (
        <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted">
          <Icon name="directions_run" size={18} /> 아직 등록한 장소가 없어요.
        </p>
      )}
    </div>
  )
}

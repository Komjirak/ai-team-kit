import { Icon } from '../../components/ui/Icon'
import { flightTime } from '../../lib/flight'
import type { FlightInfo } from '../../data/types'

// 항공편 경로 카드 — 출발 ────✈──── 도착. 손그림 톤의 점선 경로선.
// 일정 카드 안(SchedulePage) · 조회 결과 미리보기(AddScheduleItemSheet) 공용.

export function FlightRoute({ flight, compact }: { flight: FlightInfo; compact?: boolean }) {
  const dep = flight.dep
  const arr = flight.arr
  const depDay = dep.at?.slice(0, 10)
  const arrDay = arr.at?.slice(0, 10)
  const overnight = depDay && arrDay && depDay !== arrDay

  return (
    <div className={compact ? '' : 'rounded-2xl bg-primary-soft/50 p-3'}>
      <div className="flex items-center gap-2">
        <Side
          iata={dep.iata}
          time={flightTime(dep.at)}
          city={dep.city}
          terminal={dep.terminal}
          align="left"
        />
        <div className="flex flex-1 flex-col items-center px-1">
          <Icon name="flight" size={16} className="mb-0.5 rotate-90 text-primary" />
          <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-1.5 w-full">
            <path
              d="M0,3 Q25,1 50,3 T100,3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="text-primary/60"
            />
          </svg>
          <span className="dl-mono mt-0.5 text-[10px] text-muted">{flight.number}</span>
        </div>
        <Side
          iata={arr.iata}
          time={flightTime(arr.at)}
          city={arr.city}
          terminal={arr.terminal}
          align="right"
          nextDay={overnight ? '+1' : undefined}
        />
      </div>
      {flight.source === 'demo' && (
        <p className="dl-mono mt-2 text-center text-[10px] text-muted-soft">
          데모 데이터 · 실제 시각 아님
        </p>
      )}
    </div>
  )
}

function Side({
  iata,
  time,
  city,
  terminal,
  align,
  nextDay,
}: {
  iata: string
  time: string
  city?: string
  terminal?: string
  align: 'left' | 'right'
  nextDay?: string
}) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <p className="font-display text-lg font-extrabold leading-none text-ink">{iata}</p>
      {time && (
        <p className="dl-mono mt-1 text-sm font-bold text-primary">
          {time}
          {nextDay && <span className="ml-0.5 align-super text-[10px] text-muted">{nextDay}</span>}
        </p>
      )}
      {city && <p className="truncate text-xs text-muted">{city}</p>}
      {terminal && <p className="dl-mono text-[10px] text-muted-soft">T{terminal}</p>}
    </div>
  )
}

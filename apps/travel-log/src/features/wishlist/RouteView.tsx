import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../trip/TripContext'
import { Button, EmptyState } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { RouteMap } from '../../maps/RouteMap'
import { tripDates, sortDayItems, fmtDayLabel } from '../../data/schedule'
import type { Place, ScheduleItem } from '../../data/types'

interface Stop {
  item: ScheduleItem
  place: Place
}

// 하버사인 직선거리(km) 합. 실제 도보/차량 경로가 아니라 지점 간 직선 근사.
function straightLineKm(stops: Stop[]): number {
  const R = 6371
  let sum = 0
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1].place
    const b = stops[i].place
    if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) continue
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const la = (a.lat * Math.PI) / 180
    const lb = (b.lat * Math.PI) / 180
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2
    sum += 2 * R * Math.asin(Math.sqrt(h))
  }
  return sum
}

/** 일정표 기반 "동선" — 날짜별로 지도에 순서 핀 + 경로선, 아래에 순서 리스트. */
export function RouteView() {
  const { activeTrip, schedule, places } = useTrip()
  const nav = useNavigate()

  const days = useMemo(() => tripDates(activeTrip?.startDate, activeTrip?.endDate), [activeTrip])
  const placeById = useMemo(() => {
    const m = new Map<string, Place>()
    for (const p of places) m.set(p.id, p)
    return m
  }, [places])

  // 날짜별 장소-연결 정차지(순서 유지)
  const stopsByDay = useMemo(() => {
    const map = new Map<string, Stop[]>()
    for (const d of days) {
      const items = sortDayItems(schedule.filter((s) => s.date === d))
      const stops: Stop[] = []
      for (const it of items) {
        const p = it.placeId ? placeById.get(it.placeId) : undefined
        if (p) stops.push({ item: it, place: p })
      }
      map.set(d, stops)
    }
    return map
  }, [days, schedule, placeById])

  const firstWithStops = days.find((d) => (stopsByDay.get(d)?.length ?? 0) > 0) ?? days[0]
  const [day, setDay] = useState<string>(firstWithStops ?? '')
  const activeDay = day && days.includes(day) ? day : firstWithStops ?? ''
  const stops = stopsByDay.get(activeDay) ?? []
  const km = straightLineKm(stops)
  const mapped = stops.filter((s) => s.place.lat != null && s.place.lng != null).length

  if (days.length === 0) {
    return (
      <EmptyState
        icon="map"
        title="여행 기간을 먼저 정해요."
        hint="시작일·종료일을 설정하면 일정에 따라 동선이 그려져요."
        action={<Button icon="settings" onClick={() => nav('/settings')}>여행 기간 설정</Button>}
      />
    )
  }

  const totalStops = days.reduce((n, d) => n + (stopsByDay.get(d)?.length ?? 0), 0)
  if (totalStops === 0) {
    return (
      <EmptyState
        icon="directions"
        title="아직 동선이 없어요."
        hint="일정에 장소를 연결하면, 그 순서대로 지도에 동선이 그려져요."
        action={<Button icon="event" onClick={() => nav('/schedule')}>일정 짜러 가기</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 날짜 선택 */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d, i) => {
          const count = stopsByDay.get(d)?.length ?? 0
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`dl-chip shrink-0 ${d === activeDay ? 'dl-chip-on' : 'dl-chip-off border border-surface-variant'}`}
            >
              Day {i + 1}
              <span className="dl-mono ml-1 text-[11px] opacity-80">· {count}</span>
            </button>
          )
        })}
      </div>

      {/* 지도 (순서 핀 + 경로선) */}
      <RouteMap stops={stops.map((s) => ({ name: s.place.name, lat: s.place.lat, lng: s.place.lng }))} className="h-64 md:h-80" />

      {/* 요약 */}
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-primary-fixed-dim bg-surface-bright px-4 py-3 text-sm">
        <span className="flex items-center gap-1 text-primary">
          <Icon name="place" size={16} /> <span className="dl-mono font-bold">{stops.length}곳</span>
        </span>
        {mapped >= 2 && (
          <span className="flex items-center gap-1 text-secondary">
            <Icon name="straighten" size={16} /> <span className="dl-mono">직선 {km.toFixed(1)}km</span>
          </span>
        )}
        <span className="ml-auto dl-mono text-xs text-muted">{fmtDayLabel(activeDay)}</span>
      </div>

      {/* 순서 리스트 (동선 상세) */}
      {stops.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-surface-variant py-6 text-center text-sm text-muted">
          이 날은 장소가 연결된 일정이 없어요.
          <button className="ml-1 font-bold text-primary underline" onClick={() => nav('/schedule')}>
            일정에서 장소 연결
          </button>
        </div>
      ) : (
        <ol className="relative ml-2 flex flex-col gap-4 before:absolute before:inset-y-3 before:left-[18px] before:w-0.5 before:rounded-full before:bg-surface-variant">
          {stops.map((s, i) => (
            <li key={s.item.id} className="relative flex gap-3">
              <div className="z-10 flex w-9 shrink-0 flex-col items-center">
                <span className="dl-mono grid h-9 w-9 place-items-center rounded-full border-4 border-bg bg-primary text-sm font-bold text-on-primary shadow-glow-primary">
                  {i + 1}
                </span>
              </div>
              <div className="dl-card flex flex-1 gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold leading-snug text-ink">{s.place.name}</h3>
                    {s.item.time && (
                      <span className="dl-mono shrink-0 rounded bg-surface-container px-2 py-0.5 text-xs text-muted">
                        {s.item.time}
                      </span>
                    )}
                  </div>
                  <p className="dl-mono text-xs text-primary">{s.place.category}</p>
                  {(s.place.memo || s.item.memo) && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{s.place.memo || s.item.memo}</p>
                  )}
                  {s.place.lat == null && (
                    <p className="mt-1 text-[11px] text-muted-soft">· 좌표 없음(지도 핀 제외)</p>
                  )}
                </div>
                {s.place.thumbnail && (
                  <img
                    src={s.place.thumbnail}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../trip/TripContext'
import { PageTitle } from '../../components/layout/AppShell'
import { Button, EmptyState, Skeleton } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi } from '../../components/ui/deco'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import { tripDates, sortDayItems, fmtDayLabel } from '../../data/schedule'
import { AddScheduleItemSheet } from './AddScheduleItemSheet'
import type { Place, ScheduleItem } from '../../data/types'

export function SchedulePage() {
  const { activeTrip, schedule, places, loading } = useTrip()
  const toast = useToast()
  const nav = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduleItem | null>(null)
  const [addDate, setAddDate] = useState<string | undefined>()

  const days = useMemo(() => tripDates(activeTrip?.startDate, activeTrip?.endDate), [activeTrip])
  const placeById = useMemo(() => {
    const m = new Map<string, Place>()
    for (const p of places) m.set(p.id, p)
    return m
  }, [places])

  // 기간(days)에 속하지 않는 항목 — 안전망(기간 수정으로 밖에 남은 것)
  const orphans = useMemo(
    () => sortDayItems(schedule.filter((s) => !days.includes(s.date))),
    [schedule, days],
  )

  function openAdd(date?: string) {
    setEditing(null)
    setAddDate(date)
    setSheetOpen(true)
  }
  function openEdit(item: ScheduleItem) {
    setEditing(item)
    setAddDate(undefined)
    setSheetOpen(true)
  }

  async function move(item: ScheduleItem, dayItems: ScheduleItem[], dir: -1 | 1) {
    const i = dayItems.findIndex((s) => s.id === item.id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= dayItems.length) return
    const other = dayItems[j]
    // order 값을 맞바꿔 순서 이동
    await Promise.all([
      backend.updateScheduleItem(item.id, { order: other.order }),
      backend.updateScheduleItem(other.id, { order: item.order }),
    ])
  }

  async function del(item: ScheduleItem) {
    if (!confirm(`‘${item.title}’ 일정을 삭제할까요?`)) return
    await backend.deleteScheduleItem(item.id)
    toast.show('일정을 삭제했어요.')
  }

  if (loading || !activeTrip) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <PageTitle title="일정" subtitle="일자별로 가볍게 짜는 우리 여행" />
        {days.length > 0 && (
          <Button icon="add" onClick={() => openAdd(days[0])} className="mb-2 hidden sm:inline-flex">
            일정 추가
          </Button>
        )}
      </div>

      {days.length === 0 ? (
        <EmptyState
          icon="event"
          title="여행 기간을 먼저 설정해요."
          hint="시작일·종료일을 정하면 일자별로 일정을 짤 수 있어요."
          action={
            <Button icon="settings" onClick={() => nav('/settings')}>
              여행 기간 설정
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {days.map((date, di) => {
            const items = sortDayItems(schedule.filter((s) => s.date === date))
            return (
              <section key={date}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-display text-xl font-extrabold text-ink">Day {di + 1}</h2>
                    <span className="dl-mono text-sm text-muted">{fmtDayLabel(date)}</span>
                  </div>
                  <button
                    className="dl-focus flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-primary hover:bg-primary-soft"
                    onClick={() => openAdd(date)}
                  >
                    <Icon name="add" size={16} /> 추가
                  </button>
                </div>

                {items.length === 0 ? (
                  <button
                    onClick={() => openAdd(date)}
                    className="dl-focus flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-surface-variant py-5 text-sm text-muted hover:bg-surface-container"
                  >
                    <Icon name="add" size={18} /> 이 날의 첫 일정을 담아요
                  </button>
                ) : (
                  <ol className="space-y-2">
                    {items.map((item, ii) => (
                      <ScheduleRow
                        key={item.id}
                        item={item}
                        place={item.placeId ? placeById.get(item.placeId) : undefined}
                        isFirst={ii === 0}
                        isLast={ii === items.length - 1}
                        onUp={() => move(item, items, -1)}
                        onDown={() => move(item, items, 1)}
                        onEdit={() => openEdit(item)}
                        onDelete={() => del(item)}
                      />
                    ))}
                  </ol>
                )}
              </section>
            )
          })}

          {orphans.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-muted">기간 밖 일정</h2>
                <span className="dl-mono text-xs text-muted">여행 날짜를 벗어난 항목이에요</span>
              </div>
              <ol className="space-y-2">
                {orphans.map((item) => (
                  <ScheduleRow
                    key={item.id}
                    item={item}
                    place={item.placeId ? placeById.get(item.placeId) : undefined}
                    isFirst
                    isLast
                    showDate
                    onEdit={() => openEdit(item)}
                    onDelete={() => del(item)}
                  />
                ))}
              </ol>
            </section>
          )}
        </div>
      )}

      {days.length > 0 && (
        <button
          className="dl-focus fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-glow-primary sm:hidden"
          onClick={() => openAdd(days[0])}
          aria-label="일정 추가"
        >
          <Icon name="add" size={28} />
        </button>
      )}

      <AddScheduleItemSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        editing={editing}
        defaultDate={addDate}
      />
    </div>
  )
}

function ScheduleRow({
  item,
  place,
  isFirst,
  isLast,
  showDate,
  onUp,
  onDown,
  onEdit,
  onDelete,
}: {
  item: ScheduleItem
  place?: Place
  isFirst: boolean
  isLast: boolean
  showDate?: boolean
  onUp?: () => void
  onDown?: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <li className="dl-card relative flex items-start gap-3 p-3">
      <Washi color="mint" className="left-6 -top-2" rotate={-4} />
      <div className="dl-mono mt-0.5 w-12 shrink-0 text-center">
        {item.time ? (
          <span className="text-sm font-bold text-primary">{item.time}</span>
        ) : (
          <span className="text-xs text-muted-soft">종일</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-bold leading-snug text-ink">{item.title}</h3>
        {showDate && <p className="dl-mono text-xs text-muted">{item.date.replace(/-/g, '.')}</p>}
        {place && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <Icon name="location_on" size={14} className="text-primary" />
            <span className="truncate">{place.name}</span>
          </p>
        )}
        {item.memo && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.memo}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {onUp && (
          <button
            className="dl-focus grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-container disabled:opacity-30"
            onClick={onUp}
            disabled={isFirst}
            aria-label="위로"
          >
            <Icon name="keyboard_arrow_up" size={18} />
          </button>
        )}
        {onDown && (
          <button
            className="dl-focus grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-container disabled:opacity-30"
            onClick={onDown}
            disabled={isLast}
            aria-label="아래로"
          >
            <Icon name="keyboard_arrow_down" size={18} />
          </button>
        )}
        <button
          className="dl-focus grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-container"
          onClick={onEdit}
          aria-label="수정"
        >
          <Icon name="edit" size={16} />
        </button>
        <button
          className="dl-focus grid h-7 w-7 place-items-center rounded-full text-muted hover:text-error"
          onClick={onDelete}
          aria-label="삭제"
        >
          <Icon name="delete" size={16} />
        </button>
      </div>
    </li>
  )
}

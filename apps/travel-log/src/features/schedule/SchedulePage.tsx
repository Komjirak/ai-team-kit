import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTrip } from '../../trip/TripContext'
import { PageTitle } from '../../components/layout/AppShell'
import { Button, EmptyState, Skeleton } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi } from '../../components/ui/deco'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import { tripDates, sortDayItems, fmtDayLabel } from '../../data/schedule'
import { AddScheduleItemSheet } from './AddScheduleItemSheet'
import { FlightRoute } from './FlightRoute'
import type { Place, ScheduleItem } from '../../data/types'

type Buckets = Record<string, ScheduleItem[]>

export function SchedulePage() {
  const { activeTrip, schedule, places, loading } = useTrip()
  const toast = useToast()
  const nav = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduleItem | null>(null)
  const [addDate, setAddDate] = useState<string | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)

  const days = useMemo(() => tripDates(activeTrip?.startDate, activeTrip?.endDate), [activeTrip])
  const placeById = useMemo(() => {
    const m = new Map<string, Place>()
    for (const p of places) m.set(p.id, p)
    return m
  }, [places])

  // 기간(days)에 속하지 않는 항목 — 안전망(기간 수정으로 밖에 남은 것). DnD 대상 아님.
  const orphans = useMemo(
    () => sortDayItems(schedule.filter((s) => !days.includes(s.date))),
    [schedule, days],
  )

  // 날짜별 버킷(로컬) — 드래그 중에는 여기서 이동을 반영하고, 끝나면 저장한다.
  const [buckets, setBucketsState] = useState<Buckets>({})
  const bucketsRef = useRef<Buckets>({})
  const draggingRef = useRef(false)
  const origByIdRef = useRef<Map<string, ScheduleItem>>(new Map())

  function setBuckets(next: Buckets) {
    bucketsRef.current = next
    setBucketsState(next)
  }

  // schedule/days 변화를 버킷에 반영(드래그 중엔 건드리지 않음 → 튐 방지)
  useEffect(() => {
    origByIdRef.current = new Map(schedule.map((s) => [s.id, s]))
    if (draggingRef.current) return
    const next: Buckets = {}
    for (const d of days) next[d] = sortDayItems(schedule.filter((s) => s.date === d))
    setBuckets(next)
  }, [schedule, days])

  const sensors = useSensors(
    // 6px 이상 움직여야 드래그 시작 → 카드 안 버튼 탭/스크롤과 충돌 방지
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeItem = activeId
    ? Object.values(bucketsRef.current).flat().find((s) => s.id === activeId)
    : null

  function findContainer(id?: string | number): string | undefined {
    if (id == null) return undefined
    const key = String(id)
    if (key in bucketsRef.current) return key // 컨테이너(날짜) id
    return Object.keys(bucketsRef.current).find((d) => bucketsRef.current[d].some((it) => it.id === key))
  }

  function onDragStart(e: DragStartEvent) {
    draggingRef.current = true
    setActiveId(String(e.active.id))
  }

  // 드래그 중 다른 Day 위로 오면 그 순간 버킷 사이로 카드를 옮겨 시각적으로 반영
  function onDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const from = findContainer(active.id)
    const to = findContainer(over.id)
    if (!from || !to || from === to) return

    const prev = bucketsRef.current
    const fromItems = prev[from]
    const toItems = prev[to]
    const activeIndex = fromItems.findIndex((i) => i.id === active.id)
    if (activeIndex < 0) return
    const moved = fromItems[activeIndex]

    let newIndex: number
    if (String(over.id) in prev) {
      newIndex = toItems.length // 빈 영역(컨테이너) 위 → 맨 끝에
    } else {
      const overIndex = toItems.findIndex((i) => i.id === over.id)
      newIndex = overIndex >= 0 ? overIndex : toItems.length
    }

    setBuckets({
      ...prev,
      [from]: fromItems.filter((i) => i.id !== active.id),
      [to]: [...toItems.slice(0, newIndex), { ...moved, date: to }, ...toItems.slice(newIndex)],
    })
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    draggingRef.current = false
    setActiveId(null)

    if (!over) {
      resyncFromSchedule()
      return
    }
    const from = findContainer(active.id)
    const to = findContainer(over.id)
    if (!from || !to) {
      resyncFromSchedule()
      return
    }

    let next = bucketsRef.current
    // 같은 Day 안에서의 순서 이동은 여기서 확정
    if (from === to && active.id !== over.id && !(String(over.id) in next)) {
      const items = next[to]
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      if (oldIndex >= 0 && newIndex >= 0) {
        next = { ...next, [to]: arrayMove(items, oldIndex, newIndex) }
        setBuckets(next)
      }
    }

    // 영향받은 Day(출발·도착)의 order/date를 저장(변경분만)
    const affected = [...new Set([from, to])]
    const updates: Promise<void>[] = []
    for (const date of affected) {
      ;(next[date] ?? []).forEach((it, idx) => {
        const orig = origByIdRef.current.get(it.id)
        if (!orig || orig.order !== idx || orig.date !== date) {
          updates.push(backend.updateScheduleItem(it.id, { order: idx, date }))
        }
      })
    }
    if (updates.length) {
      try {
        await Promise.all(updates)
      } catch {
        toast.show('순서를 저장하지 못했어요.')
        resyncFromSchedule()
      }
    }
  }

  function resyncFromSchedule() {
    const next: Buckets = {}
    for (const d of days) next[d] = sortDayItems(schedule.filter((s) => s.date === d))
    setBuckets(next)
  }

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={() => {
            draggingRef.current = false
            setActiveId(null)
            resyncFromSchedule()
          }}
        >
          <div className="space-y-6">
            {days.map((date, di) => {
              const items = buckets[date] ?? []
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

                  <DayDroppable date={date} itemIds={items.map((s) => s.id)}>
                    {items.length === 0 ? (
                      <button
                        onClick={() => openAdd(date)}
                        className="dl-focus flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-surface-variant py-5 text-sm text-muted hover:bg-surface-container"
                      >
                        <Icon name="add" size={18} /> 이 날의 첫 일정을 담아요 (다른 날 카드를 끌어와도 돼요)
                      </button>
                    ) : (
                      <ol className="space-y-2">
                        {items.map((item) => (
                          <SortableScheduleRow
                            key={item.id}
                            item={item}
                            place={item.placeId ? placeById.get(item.placeId) : undefined}
                            onEdit={() => openEdit(item)}
                            onDelete={() => del(item)}
                          />
                        ))}
                      </ol>
                    )}
                  </DayDroppable>
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
                      showDate
                      onEdit={() => openEdit(item)}
                      onDelete={() => del(item)}
                    />
                  ))}
                </ol>
              </section>
            )}
          </div>

          <DragOverlay>
            {activeItem ? (
              <ScheduleRow
                item={activeItem}
                place={activeItem.placeId ? placeById.get(activeItem.placeId) : undefined}
                onEdit={() => {}}
                onDelete={() => {}}
                isDragging
                overlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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

// 한 Day의 드롭 영역 — 비어 있어도 다른 날 카드를 받을 수 있게 droppable로 감싼다.
function DayDroppable({
  date,
  itemIds,
  children,
}: {
  date: string
  itemIds: string[]
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: date })
  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'rounded-2xl outline-2 outline-dashed outline-primary/40' : undefined}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  )
}

// 드래그로 순서를 바꿀 수 있는 일정 행.
function SortableScheduleRow(props: {
  item: ScheduleItem
  place?: Place
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // 드래그 중 원본은 자리(placeholder)만 남기고 흐리게 — 실체는 DragOverlay가 그림
    opacity: isDragging ? 0.4 : undefined,
  }
  return (
    <ScheduleRow
      {...props}
      dragRef={setNodeRef}
      dragStyle={style}
      handleProps={{ ...attributes, ...listeners }}
    />
  )
}

function ScheduleRow({
  item,
  place,
  showDate,
  onEdit,
  onDelete,
  dragRef,
  dragStyle,
  isDragging,
  overlay,
  handleProps,
}: {
  item: ScheduleItem
  place?: Place
  showDate?: boolean
  onEdit: () => void
  onDelete: () => void
  dragRef?: (el: HTMLElement | null) => void
  dragStyle?: CSSProperties
  isDragging?: boolean
  overlay?: boolean
  handleProps?: HTMLAttributes<HTMLButtonElement>
}) {
  return (
    <li
      ref={dragRef}
      style={dragStyle}
      className={`dl-card relative flex items-start gap-3 px-3 pb-3 pt-6 ${
        isDragging || overlay ? 'shadow-glow-primary ring-2 ring-primary/30' : ''
      } ${overlay ? 'cursor-grabbing' : ''}`}
    >
      {/* 워시테이프 — 상단 여백 띠(pt-6) 위에만 얹혀 글자를 가리지 않음 */}
      <Washi color="mint" className="-top-2 left-5" rotate={-4} />

      <div className="dl-mono mt-0.5 w-12 shrink-0 text-center">
        {item.flight ? (
          <Icon name="flight" size={18} className="rotate-90 text-primary" />
        ) : item.time ? (
          <span className="text-sm font-bold text-primary">{item.time}</span>
        ) : (
          <span className="text-xs text-muted-soft">종일</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-bold leading-snug text-ink">{item.title}</h3>
        {showDate && <p className="dl-mono text-xs text-muted">{item.date.replace(/-/g, '.')}</p>}
        {item.flight && (
          <div className="mt-2">
            <FlightRoute flight={item.flight} />
          </div>
        )}
        {place && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <Icon name="location_on" size={14} className="text-primary" />
            <span className="truncate">{place.name}</span>
          </p>
        )}
        {item.memo && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.memo}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {handleProps && (
          <button
            type="button"
            className="dl-focus grid h-7 w-7 cursor-grab touch-none place-items-center rounded-full text-muted-soft hover:bg-surface-container hover:text-muted active:cursor-grabbing"
            aria-label="드래그해서 순서·날짜 변경"
            {...handleProps}
          >
            <Icon name="drag_indicator" size={18} />
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

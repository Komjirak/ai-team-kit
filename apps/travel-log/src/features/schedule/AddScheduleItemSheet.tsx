import { useEffect, useRef, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button, Spinner } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import { tripDates, fmtDayLabel } from '../../data/schedule'
import { PLACE_CATEGORIES, type PlaceCategory, type ScheduleItem } from '../../data/types'
import { searchPlaces, type PlaceResult } from '../../kakao/placeSearch'

interface Props {
  open: boolean
  onClose: () => void
  editing?: ScheduleItem | null
  defaultDate?: string
}

/** 일정 항목 추가 / 수정 — 날짜·시간·제목·메모·장소 연결. 상세 플래닝은 범위 밖. */
export function AddScheduleItemSheet({ open, onClose, editing, defaultDate }: Props) {
  const { user } = useAuth()
  const { activeTrip, places, schedule } = useTrip()
  const toast = useToast()

  const days = tripDates(activeTrip?.startDate, activeTrip?.endDate)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [placeId, setPlaceId] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 장소 검색
  const [showPlacePicker, setShowPlacePicker] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [addingKey, setAddingKey] = useState<string | null>(null)
  const debounce = useRef<number>()

  useEffect(() => {
    if (!open) return
    setDate(editing?.date ?? defaultDate ?? days[0] ?? '')
    setTime(editing?.time ?? '')
    setTitle(editing?.title ?? '')
    setMemo(editing?.memo ?? '')
    setPlaceId(editing?.placeId)
    setError(null)
    setShowPlacePicker(false)
    setKeyword('')
    setResults([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, defaultDate])

  const linkedPlace = placeId ? places.find((p) => p.id === placeId) : undefined

  function runSearch(q: string) {
    setKeyword(q)
    window.clearTimeout(debounce.current)
    if (!q.trim()) {
      setResults([])
      return
    }
    debounce.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        setResults(await searchPlaces(q))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
  }

  // 검색 결과를 장소(wishlist)로 만들어 연결
  async function linkFromSearch(r: PlaceResult) {
    if (!user || !activeTrip) return
    const key = `${r.name}-${r.lat}-${r.lng}`
    setAddingKey(key)
    try {
      const category: PlaceCategory = PLACE_CATEGORIES.find((c) => r.category?.includes(c)) ?? '기타'
      const place = await backend.addPlace({
        tripId: activeTrip.id,
        name: r.name,
        address: r.address,
        lat: r.lat || undefined,
        lng: r.lng || undefined,
        category,
        status: 'wishlist',
        createdBy: user.id,
      })
      setPlaceId(place.id)
      setShowPlacePicker(false)
      setKeyword('')
      setResults([])
    } catch {
      toast.show('장소를 연결하지 못했어요.')
    } finally {
      setAddingKey(null)
    }
  }

  async function save() {
    if (!user || !activeTrip || !date || !title.trim()) {
      setError('schedule.save_failed')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await backend.updateScheduleItem(editing.id, {
          date,
          time: time || undefined,
          title: title.trim(),
          memo: memo.trim() || undefined,
          placeId,
        })
        toast.show('일정을 수정했어요.')
      } else {
        const sameDay = schedule.filter((s) => s.date === date)
        const order = sameDay.reduce((m, s) => Math.max(m, s.order), -1) + 1
        await backend.addScheduleItem({
          tripId: activeTrip.id,
          date,
          order,
          time: time || undefined,
          title: title.trim(),
          memo: memo.trim() || undefined,
          placeId,
          createdBy: user.id,
        })
        toast.show('일정을 추가했어요.')
      }
      onClose()
    } catch {
      setError('schedule.save_failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? '일정 수정' : '일정 추가'}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={save}
            loading={saving}
            disabled={!title.trim() || !date}
            icon={editing ? 'save' : 'add'}
          >
            {editing ? '저장' : '추가'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-muted">날짜 *</label>
            {days.length > 0 ? (
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              >
                {days.map((d, i) => (
                  <option key={d} value={d}>
                    Day {i + 1} · {fmtDayLabel(d)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-semibold text-muted">시간 (선택)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">제목 *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 한라산 등반"
            className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* 장소 연결 */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">장소 연결 (선택)</label>
          {linkedPlace ? (
            <div className="flex items-center gap-2 rounded-2xl bg-primary-soft px-3 py-2.5">
              <Icon name="location_on" size={18} className="text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{linkedPlace.name}</span>
              <button
                type="button"
                className="text-muted hover:text-error"
                onClick={() => setPlaceId(undefined)}
                aria-label="장소 연결 해제"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          ) : placeId ? (
            // 연결된 placeId가 있으나 장소가 삭제된 경우
            <div className="flex items-center gap-2 rounded-2xl bg-surface-container px-3 py-2.5 text-sm text-muted">
              연결된 장소를 찾을 수 없어요.
              <button type="button" className="ml-auto text-error" onClick={() => setPlaceId(undefined)}>
                해제
              </button>
            </div>
          ) : !showPlacePicker ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-surface-variant px-3 py-2.5 text-sm text-muted"
              onClick={() => setShowPlacePicker(true)}
            >
              <Icon name="add_location_alt" size={18} /> 장소 연결하기
            </button>
          ) : (
            <div className="space-y-2 rounded-2xl border border-surface-variant p-2">
              {/* 담아둔 장소에서 */}
              {places.length > 0 && (
                <div>
                  <p className="px-1 pb-1 text-xs font-semibold text-muted">담아둔 곳에서</p>
                  <div className="flex flex-wrap gap-1.5">
                    {places.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="dl-chip dl-chip-off border border-surface-variant"
                        onClick={() => {
                          setPlaceId(p.id)
                          setShowPlacePicker(false)
                        }}
                      >
                        <Icon name="location_on" size={14} /> {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* 검색으로 추가 */}
              <div>
                <p className="px-1 pb-1 text-xs font-semibold text-muted">장소 검색으로 추가</p>
                <div className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-2">
                  <Icon name="search" size={18} className="text-muted" />
                  <input
                    value={keyword}
                    onChange={(e) => runSearch(e.target.value)}
                    placeholder="예) 성산일출봉"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-soft"
                  />
                  {searching && <Spinner size={14} className="text-primary" />}
                </div>
                {results.length > 0 && (
                  <ul className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-surface-variant">
                    {results.map((r, i) => {
                      const key = `${r.name}-${r.lat}-${r.lng}`
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-surface-container disabled:opacity-50"
                            onClick={() => linkFromSearch(r)}
                            disabled={addingKey === key}
                          >
                            {addingKey === key ? (
                              <Spinner size={14} className="text-primary" />
                            ) : (
                              <Icon name="add" size={16} className="text-primary" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-ink">{r.name}</span>
                              <span className="block truncate text-xs text-muted">{r.address}</span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <button
                type="button"
                className="w-full py-1 text-xs text-muted"
                onClick={() => setShowPlacePicker(false)}
              >
                접기
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="준비물·예약·팁 등"
            className="w-full resize-none rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {error && <p className="text-sm text-error">저장하지 못했어요. (schedule.save_failed) 제목과 날짜를 확인해 주세요.</p>}
      </div>
    </Sheet>
  )
}

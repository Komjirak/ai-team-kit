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
import { searchPlaces, type PlaceResult } from '../../maps/placeSearch'
import { buildFlight, flightTime, isIata, airportOptions } from '../../lib/flight'
import { FlightRoute } from './FlightRoute'

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

  const [mode, setMode] = useState<'normal' | 'flight'>('normal')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [placeId, setPlaceId] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 항공편 (직접 입력)
  const [flightNo, setFlightNo] = useState('')
  const [depIata, setDepIata] = useState('')
  const [depTime, setDepTime] = useState('')
  const [depTerminal, setDepTerminal] = useState('')
  const [arrIata, setArrIata] = useState('')
  const [arrTime, setArrTime] = useState('')
  const [overnight, setOvernight] = useState(false)

  // 장소 검색
  const [showPlacePicker, setShowPlacePicker] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [addingKey, setAddingKey] = useState<string | null>(null)
  const debounce = useRef<number>()

  useEffect(() => {
    if (!open) return
    setMode(editing?.flight ? 'flight' : 'normal')
    setDate(editing?.date ?? defaultDate ?? days[0] ?? '')
    setTime(editing?.time ?? '')
    setTitle(editing?.title ?? '')
    setMemo(editing?.memo ?? '')
    setPlaceId(editing?.placeId)
    setError(null)
    setShowPlacePicker(false)
    setKeyword('')
    setResults([])
    const f = editing?.flight
    setFlightNo(f?.number ?? '')
    setDepIata(f?.dep.iata ?? '')
    setDepTime(flightTime(f?.dep.at))
    setDepTerminal(f?.dep.terminal ?? '')
    setArrIata(f?.arr.iata ?? '')
    setArrTime(flightTime(f?.arr.at))
    // 도착이 출발 다음날이면 +1 유지
    setOvernight(!!f?.dep.at && !!f?.arr.at && f.dep.at.slice(0, 10) !== f.arr.at.slice(0, 10))
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
        thumbnail: r.photoUrl, // 검색 결과 사진 자동 저장
        memo: r.description, // 검색 결과 설명 자동 저장
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

  const isFlight = mode === 'flight'
  // 직접 입력값이 유효하면 라이브 미리보기(카드)로 보여준다.
  const flightReady = isFlight && !!flightNo.trim() && isIata(depIata) && isIata(arrIata) && !!date
  const flightPreview =
    flightReady
      ? buildFlight({
          number: flightNo,
          depIata,
          depTime: depTime || undefined,
          depTerminal: depTerminal || undefined,
          arrIata,
          arrTime: arrTime || undefined,
          date,
          overnight,
        })
      : null

  const canSave = isFlight ? flightReady : !!title.trim() && !!date

  async function save() {
    if (!user || !activeTrip || !date) {
      setError('schedule.save_failed')
      return
    }
    // 공통 필드 구성 (일반 vs 항공편)
    let payload: Partial<ScheduleItem>
    if (isFlight) {
      if (!flightPreview) {
        setError('schedule.save_failed')
        return
      }
      const f = flightPreview
      payload = {
        time: flightTime(f.dep.at) || undefined,
        title: `${f.number} · ${f.dep.iata}→${f.arr.iata}`,
        memo: memo.trim() || undefined,
        flight: f,
        placeId: undefined,
      }
    } else {
      if (!title.trim()) {
        setError('schedule.save_failed')
        return
      }
      payload = {
        time: time || undefined,
        title: title.trim(),
        memo: memo.trim() || undefined,
        placeId,
        flight: undefined,
      }
    }

    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await backend.updateScheduleItem(editing.id, { date, ...payload })
        toast.show('일정을 수정했어요.')
      } else {
        const sameDay = schedule.filter((s) => s.date === date)
        const order = sameDay.reduce((m, s) => Math.max(m, s.order), -1) + 1
        await backend.addScheduleItem({
          tripId: activeTrip.id,
          date,
          order,
          createdBy: user.id,
          title: '',
          ...payload,
        } as Omit<ScheduleItem, 'id' | 'createdAt'>)
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
            disabled={!canSave}
            icon={editing ? 'save' : 'add'}
          >
            {editing ? '저장' : '추가'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 모드 전환: 일반 일정 / 항공편 (수정 중에는 잠금) */}
        {!editing && (
          <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-container p-1">
            <button
              type="button"
              onClick={() => setMode('normal')}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${
                mode === 'normal' ? 'bg-primary text-on-primary shadow-glow-primary' : 'text-muted'
              }`}
            >
              <Icon name="event" size={16} /> 일반 일정
            </button>
            <button
              type="button"
              onClick={() => setMode('flight')}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${
                mode === 'flight' ? 'bg-primary text-on-primary shadow-glow-primary' : 'text-muted'
              }`}
            >
              <Icon name="flight" size={16} className="rotate-90" /> 항공편
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
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
          {!isFlight && (
            <div className="w-36 shrink-0">
              <label className="mb-1 block text-xs font-semibold text-muted">시간 (선택)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
        </div>

        {/* 항공편 직접 입력 */}
        {isFlight && (
          <div className="space-y-3">
            {/* 공항 코드 자동완성 목록 */}
            <datalist id="airport-codes">
              {airportOptions.map((a) => (
                <option key={a.iata} value={a.iata}>
                  {a.name} · {a.city}
                </option>
              ))}
            </datalist>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">편명 *</label>
              <input
                value={flightNo}
                onChange={(e) => setFlightNo(e.target.value)}
                placeholder="예) KE1275"
                autoCapitalize="characters"
                className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 출발 */}
            <div className="rounded-2xl border border-surface-variant p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
                <Icon name="flight_takeoff" size={15} /> 출발
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[11px] font-semibold text-muted">공항 코드 *</label>
                  <input
                    value={depIata}
                    onChange={(e) => setDepIata(e.target.value.toUpperCase().slice(0, 3))}
                    list="airport-codes"
                    placeholder="ICN"
                    maxLength={3}
                    className="w-full rounded-xl bg-surface-container px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-[11px] font-semibold text-muted">시각</label>
                  <input
                    type="time"
                    value={depTime}
                    onChange={(e) => setDepTime(e.target.value)}
                    className="w-full rounded-xl bg-surface-container px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="w-16">
                  <label className="mb-1 block text-[11px] font-semibold text-muted">터미널</label>
                  <input
                    value={depTerminal}
                    onChange={(e) => setDepTerminal(e.target.value.slice(0, 3))}
                    placeholder="2"
                    className="w-full rounded-xl bg-surface-container px-2 py-2.5 text-center text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              {depIata && !isIata(depIata) && (
                <p className="mt-1 text-[11px] text-error">공항 코드는 영문 3자예요. (예: ICN)</p>
              )}
            </div>

            {/* 도착 */}
            <div className="rounded-2xl border border-surface-variant p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
                <Icon name="flight_land" size={15} /> 도착
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[11px] font-semibold text-muted">공항 코드 *</label>
                  <input
                    value={arrIata}
                    onChange={(e) => setArrIata(e.target.value.toUpperCase().slice(0, 3))}
                    list="airport-codes"
                    placeholder="CJU"
                    maxLength={3}
                    className="w-full rounded-xl bg-surface-container px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-[11px] font-semibold text-muted">시각</label>
                  <input
                    type="time"
                    value={arrTime}
                    onChange={(e) => setArrTime(e.target.value)}
                    className="w-full rounded-xl bg-surface-container px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              {arrIata && !isIata(arrIata) && (
                <p className="mt-1 text-[11px] text-error">공항 코드는 영문 3자예요. (예: CJU)</p>
              )}
              <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={overnight}
                  onChange={(e) => setOvernight(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                도착이 다음날이에요 (+1)
              </label>
            </div>

            {/* 라이브 미리보기 */}
            {flightPreview && (
              <div className="rounded-2xl border border-surface-variant p-2">
                <FlightRoute flight={flightPreview} />
              </div>
            )}
            <p className="dl-mono text-[11px] text-muted-soft">
              공항 코드(IATA)를 넣으면 공항 이름·도시가 자동으로 채워져요.
            </p>
          </div>
        )}

        {!isFlight && (
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
        )}

        {/* 장소 연결 */}
        {!isFlight && (
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
        )}

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

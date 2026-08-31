import { useEffect, useRef, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button, Spinner } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { useCouple } from '../../couple/CoupleContext'
import { useAuth } from '../../auth/AuthContext'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import { PLACE_CATEGORIES, type Course, type Place, type PlaceCategory } from '../../data/types'
import { searchPlaces, type PlaceResult } from '../../kakao/placeSearch'

/** 코스 만들기 / 수정: 담아둔 곳에서 고르거나, 검색으로 새 장소를 추가하며 경로를 만든다. */
export function CreateCourseSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: Course | null
}) {
  const { places } = useCouple()
  const { user } = useAuth()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // 검색으로 추가
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [addingKey, setAddingKey] = useState<string | null>(null)
  // 이번 세션에서 검색으로 만든 장소(스냅샷 반영 전에도 즉시 렌더되도록 로컬 보관)
  const [created, setCreated] = useState<Place[]>([])
  const debounce = useRef<number>()

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setMemo(editing?.memo ?? '')
    setPicked(editing?.placeIds ?? [])
    setKeyword('')
    setResults([])
    setSearchError(null)
    setCreated([])
  }, [open, editing])

  const lookup = [...places, ...created.filter((c) => !places.some((p) => p.id === c.id))]

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  function move(id: string, dir: -1 | 1) {
    setPicked((p) => {
      const i = p.indexOf(id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= p.length) return p
      const next = [...p]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function runSearch(q: string) {
    setKeyword(q)
    setSearchError(null)
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
        setSearchError('search.failed')
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
  }

  // 검색 결과를 장소로 만들어 코스에 바로 추가
  async function addFromSearch(r: PlaceResult) {
    if (!user?.coupleId) return
    const key = `${r.name}-${r.lat}-${r.lng}`
    setAddingKey(key)
    try {
      const category: PlaceCategory =
        PLACE_CATEGORIES.find((c) => r.category?.includes(c)) ?? '기타'
      const place = await backend.addPlace({
        coupleId: user.coupleId,
        name: r.name,
        address: r.address,
        lat: r.lat || undefined,
        lng: r.lng || undefined,
        category,
        status: 'wishlist',
        createdBy: user.id,
      })
      setCreated((xs) => [...xs, place])
      setPicked((p) => [...p, place.id])
      setKeyword('')
      setResults([])
    } catch {
      toast.show('장소를 추가하지 못했어요.')
    } finally {
      setAddingKey(null)
    }
  }

  async function save() {
    if (!user?.coupleId || !title.trim() || picked.length === 0) return
    setSaving(true)
    try {
      if (editing) {
        await backend.updateCourse(editing.id, { title: title.trim(), memo: memo.trim() || undefined, placeIds: picked })
        toast.show('코스를 수정했어요.')
      } else {
        await backend.addCourse({
          coupleId: user.coupleId,
          title: title.trim(),
          memo: memo.trim() || undefined,
          placeIds: picked,
          createdBy: user.id,
        })
        toast.show('데이트 코스를 만들었어요.')
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const orderedPicked = picked
    .map((id) => lookup.find((p) => p.id === id))
    .filter((p): p is Place => !!p)
  const unpicked = places.filter((p) => !picked.includes(p.id))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? '코스 수정' : '데이트 코스 만들기'}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={save}
            loading={saving}
            disabled={!title.trim() || picked.length === 0}
            icon="check"
          >
            {editing ? '저장' : '코스 저장'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="코스 이름 (예: 성수동 골목길 투어)"
          className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          placeholder="메모 (선택)"
          className="w-full resize-none rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />

        {/* 코스 순서 */}
        {orderedPicked.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">코스 순서 ({orderedPicked.length}곳)</p>
            <ul className="space-y-2">
              {orderedPicked.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2 rounded-2xl bg-primary-soft px-3 py-2">
                  <span className="dl-mono grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold text-ink">{p.name}</span>
                  <button className="text-muted disabled:opacity-30" onClick={() => move(p.id, -1)} disabled={i === 0} aria-label="위로">
                    <Icon name="keyboard_arrow_up" size={20} />
                  </button>
                  <button
                    className="text-muted disabled:opacity-30"
                    onClick={() => move(p.id, 1)}
                    disabled={i === orderedPicked.length - 1}
                    aria-label="아래로"
                  >
                    <Icon name="keyboard_arrow_down" size={20} />
                  </button>
                  <button className="text-error" onClick={() => toggle(p.id)} aria-label="제거">
                    <Icon name="close" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 검색으로 새 장소 추가 */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">장소 검색으로 추가</p>
          <div className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-3">
            <Icon name="search" size={20} className="text-muted" />
            <input
              value={keyword}
              onChange={(e) => runSearch(e.target.value)}
              placeholder="장소 검색 (예: 성수 카페)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-soft"
            />
            {searching && <Spinner size={16} className="text-primary" />}
          </div>
          {searchError && (
            <p className="mt-2 text-sm text-error">장소 검색에 실패했어요. (search.failed)</p>
          )}
          {results.length > 0 && (
            <ul className="mt-2 max-h-52 overflow-y-auto rounded-2xl border border-surface-variant">
              {results.map((r, i) => {
                const key = `${r.name}-${r.lat}-${r.lng}`
                return (
                  <li key={i}>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-container disabled:opacity-50"
                      onClick={() => addFromSearch(r)}
                      disabled={addingKey === key}
                    >
                      {addingKey === key ? (
                        <Spinner size={16} className="text-primary" />
                      ) : (
                        <Icon name="add" size={18} className="text-primary" />
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

        {/* 담아둔 곳에서 추가 */}
        {unpicked.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">담아둔 곳에서 추가</p>
            <div className="flex flex-wrap gap-2">
              {unpicked.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className="dl-chip dl-chip-off border border-surface-variant"
                >
                  <Icon name="add" size={16} /> {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {orderedPicked.length === 0 && (
          <p className="rounded-xl bg-surface-container px-4 py-4 text-center text-sm text-muted">
            위에서 장소를 검색해 추가하거나, 담아둔 곳에서 골라 코스를 만들어보세요.
          </p>
        )}
      </div>
    </Sheet>
  )
}

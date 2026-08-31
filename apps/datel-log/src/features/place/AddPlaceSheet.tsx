import { useEffect, useRef, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button, Spinner } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { PLACE_CATEGORIES, type Place, type PlaceCategory } from '../../data/types'
import { searchPlaces, type PlaceResult } from '../../kakao/placeSearch'
import { backend } from '../../data'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../../components/ui/Toast'

interface Props {
  open: boolean
  onClose: () => void
  editing?: Place | null
}

/** 장소 추가 / 수정 (PRD §5-3). Search → select → category · memo → 담기. */
export function AddPlaceSheet({ open, onClose, editing }: Props) {
  const { user } = useAuth()
  const toast = useToast()

  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [manual, setManual] = useState(false)
  const [category, setCategory] = useState<PlaceCategory>('카페')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const debounce = useRef<number>()

  useEffect(() => {
    if (!open) return
    if (editing) {
      setSelected({ name: editing.name, address: editing.address, lat: editing.lat ?? 0, lng: editing.lng ?? 0 })
      setCategory(editing.category)
      setMemo(editing.memo ?? '')
      setManual(true)
    } else {
      setKeyword('')
      setResults([])
      setSelected(null)
      setManual(false)
      setCategory('카페')
      setMemo('')
    }
    setSearchError(null)
    setSaveError(null)
  }, [open, editing])

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

  async function save() {
    if (!user?.coupleId) return
    const name = selected?.name?.trim()
    const address = selected?.address?.trim()
    if (!name) {
      setSaveError('place.save_failed')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      if (editing) {
        await backend.updatePlace(editing.id, {
          name,
          address: address ?? '',
          lat: selected?.lat || undefined,
          lng: selected?.lng || undefined,
          category,
          memo: memo.trim() || undefined,
        })
        toast.show('장소를 수정했어요.')
      } else {
        await backend.addPlace({
          coupleId: user.coupleId,
          name,
          address: address ?? '',
          lat: selected?.lat || undefined,
          lng: selected?.lng || undefined,
          category,
          status: 'wishlist',
          createdBy: user.id,
          memo: memo.trim() || undefined,
        })
        toast.show('가고 싶은 곳에 담았어요.')
      }
      onClose()
    } catch {
      setSaveError('place.save_failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? '장소 수정' : '가고 싶은 곳 추가'}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button className="flex-1" onClick={save} loading={saving} icon={editing ? 'save' : 'add'}>
            {editing ? '저장' : '담기'}
          </Button>
        </>
      }
    >
      {!editing && (
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-3">
            <Icon name="search" size={20} className="text-muted" />
            <input
              autoFocus
              value={keyword}
              onChange={(e) => runSearch(e.target.value)}
              placeholder="장소 검색 (예: 성수 카페)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-soft"
            />
            {searching && <Spinner size={16} className="text-primary" />}
          </div>

          {searchError && (
            <div className="mt-2 rounded-xl bg-error-container/60 px-3 py-2 text-sm text-error">
              장소 검색에 실패했어요. (search.failed) — 직접 입력해 담을 수 있어요.{' '}
              <button className="font-bold underline" onClick={() => setManual(true)}>
                직접 입력
              </button>
            </div>
          )}

          {!searchError && keyword.trim() && !searching && results.length === 0 && (
            <p className="mt-2 px-1 text-sm text-muted">
              검색 결과가 없어요. 다른 이름으로 찾아보세요.{' '}
              <button className="font-bold text-primary underline" onClick={() => setManual(true)}>
                직접 입력
              </button>
            </p>
          )}

          {results.length > 0 && (
            <ul className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-surface-variant">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    className={`flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-surface-container ${
                      selected?.name === r.name ? 'bg-primary-soft' : ''
                    }`}
                    onClick={() => {
                      setSelected(r)
                      const c = PLACE_CATEGORIES.find((x) => r.category?.includes(x))
                      if (c) setCategory(c)
                    }}
                  >
                    <span className="text-sm font-semibold text-ink">{r.name}</span>
                    <span className="text-xs text-muted">{r.address}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected / manual entry */}
      {(selected || manual || editing) && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">장소 이름</label>
            <input
              value={selected?.name ?? ''}
              onChange={(e) => setSelected((s) => ({ ...(s ?? { address: '', lat: 0, lng: 0 }), name: e.target.value }))}
              placeholder="장소 이름"
              className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">주소</label>
            <input
              value={selected?.address ?? ''}
              onChange={(e) => setSelected((s) => ({ ...(s ?? { name: '', lat: 0, lng: 0 }), address: e.target.value }))}
              placeholder="주소 (선택)"
              className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {PLACE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`dl-chip ${category === c ? 'dl-chip-on' : 'dl-chip-off border border-surface-variant'}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              placeholder="여기서 뭘 하고 싶어요?"
              className="w-full resize-none rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {saveError && (
            <p className="text-sm text-error">담지 못했어요. (place.save_failed) 다시 시도해 주세요.</p>
          )}
        </div>
      )}

      {!selected && !manual && !editing && !keyword && (
        <p className="py-6 text-center text-sm text-muted">
          가고 싶은 곳을 검색해 담아보세요.
          <br />
          <button className="mt-2 font-bold text-primary underline" onClick={() => setManual(true)}>
            검색 없이 직접 입력하기
          </button>
        </p>
      )}
    </Sheet>
  )
}

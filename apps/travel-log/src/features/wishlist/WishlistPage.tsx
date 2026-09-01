import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTrip } from '../../trip/TripContext'
import { PageTitle } from '../../components/layout/AppShell'
import { PlaceCard, PlaceCardSkeleton } from '../../components/PlaceCard'
import { Button, EmptyState } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { AddPlaceSheet } from '../place/AddPlaceSheet'
import { ImportSheet } from '../place/ImportSheet'
import { RouteView } from './RouteView'
import { enrichPlace, placeNeedsEnrich } from '../place/enrich'
import { useToast } from '../../components/ui/Toast'
import { backend } from '../../data'
import { usePlaceActions } from '../../hooks/usePlaceActions'
import type { Place } from '../../data/types'

export function WishlistPage() {
  const { places, loading } = useTrip()
  const { markVisited, remove } = usePlaceActions()
  const toast = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Place | null>(null)
  const [tab, setTab] = useState<'route' | 'wishlist'>('route')
  const [enriching, setEnriching] = useState<{ done: number; total: number } | null>(null)
  const [deleting, setDeleting] = useState<{ done: number; total: number } | null>(null)
  const [placeFilter, setPlaceFilter] = useState<'wishlist' | 'visited'>('wishlist')

  const wishlist = places.filter((p) => p.status === 'wishlist')
  const visited = places.filter((p) => p.status === 'visited')
  const shown = placeFilter === 'visited' ? visited : wishlist
  const needEnrich = shown.filter(placeNeedsEnrich)

  // 대시보드/홈의 "다녀온 곳" 통계에서 넘어오면 다녀온 곳 필터로 연다.
  const [params] = useSearchParams()
  useEffect(() => {
    if (params.get('filter') === 'visited') {
      setTab('wishlist')
      setPlaceFilter('visited')
    }
  }, [params])

  function openAdd() {
    setEditing(null)
    setSheetOpen(true)
  }
  function openEdit(p: Place) {
    setEditing(p)
    setSheetOpen(true)
  }

  // 사진·위치가 빈 장소들을 이름으로 구글에서 찾아 일괄 보강.
  async function runEnrich() {
    const targets = shown.filter(placeNeedsEnrich)
    if (targets.length === 0) return
    if (!confirm(`${targets.length}곳의 사진·위치를 구글에서 자동으로 채울까요?\n(구글 지도 API를 사용하며 잠시 걸려요.)`)) return
    setEnriching({ done: 0, total: targets.length })
    let updated = 0
    let miss = 0
    for (let i = 0; i < targets.length; i++) {
      try {
        const r = await enrichPlace(targets[i])
        if (r === 'updated') updated++
        else if (r === 'nomatch') miss++
      } catch {
        miss++
      }
      setEnriching({ done: i + 1, total: targets.length })
      await new Promise((res) => setTimeout(res, 120)) // 살짝 텀 — 쿼터 보호
    }
    setEnriching(null)
    toast.show(`${updated}곳을 채웠어요.${miss ? ` (${miss}곳은 못 찾음)` : ''}`)
  }

  // 현재 보고 있는 목록(가고싶은 곳/다녀온 곳) 전체 삭제 (일괄).
  async function deleteAllWishlist() {
    const targets = shown
    if (targets.length === 0) return
    const label = placeFilter === 'visited' ? '다녀온 곳' : '가고싶은 곳'
    if (!confirm(`${label} ${targets.length}곳을 모두 삭제할까요?\n되돌릴 수 없어요.`)) return
    setDeleting({ done: 0, total: targets.length })
    let done = 0
    for (const p of targets) {
      try {
        await backend.deletePlace(p.id)
      } catch {
        /* 개별 실패는 건너뜀 */
      }
      done++
      setDeleting({ done, total: targets.length })
    }
    setDeleting(null)
    toast.show(`${done}곳을 삭제했어요.`)
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <PageTitle title="장소" subtitle="이번 여행에서 가고 싶은 곳" />
        <div className="mb-2 flex gap-2">
          <Button variant="ghost" icon="upload" onClick={() => setImportOpen(true)}>
            가져오기
          </Button>
          <Button icon="add" onClick={openAdd} className="hidden sm:inline-flex">
            가고 싶은 곳 추가
          </Button>
        </div>
      </div>

      {/* 사진·위치 채우기 — 가져온 장소에 비어 있는 사진/좌표를 이름으로 보강 */}
      {tab === 'wishlist' && (needEnrich.length > 0 || enriching) && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-primary-fixed-dim bg-surface-bright px-4 py-3">
          <Icon name="auto_awesome" size={18} className="shrink-0 text-primary" />
          {enriching ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  사진·위치 채우는 중 · {enriching.done}/{enriching.total}
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round((enriching.done / enriching.total) * 100)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="min-w-0 flex-1 text-sm text-ink">
                <b>{needEnrich.length}곳</b>에 사진·위치가 비어 있어요. 이름으로 자동으로 채울 수 있어요.
              </p>
              <button
                onClick={runEnrich}
                className="dl-focus shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary active:scale-95"
              >
                채우기
              </button>
            </>
          )}
        </div>
      )}

      {/* 동선(일정 기반) / 가고싶은 곳 전환 */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-surface-container p-1">
        <button
          onClick={() => setTab('route')}
          className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${
            tab === 'route' ? 'bg-primary text-on-primary shadow-glow-primary' : 'text-muted'
          }`}
        >
          <Icon name="directions" size={16} /> 동선
        </button>
        <button
          onClick={() => setTab('wishlist')}
          className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${
            tab === 'wishlist' ? 'bg-primary text-on-primary shadow-glow-primary' : 'text-muted'
          }`}
        >
          <Icon name="favorite" size={16} /> 가고싶은 곳
        </button>
      </div>

      {tab === 'route' ? (
        <RouteView />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      ) : places.length === 0 ? (
        <EmptyState
          icon="location_on"
          title="아직 담은 곳이 없어요."
          hint="가고 싶은 곳을 담아보세요. 작은 조각들이 모여 큰 추억이 됩니다."
          action={
            <Button icon="add" onClick={openAdd}>
              가고 싶은 곳 추가
            </Button>
          }
        />
      ) : (
        <>
          {/* 상태 필터: 가고싶은 곳 / 다녀온 곳 */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setPlaceFilter('wishlist')}
                className={`dl-chip ${placeFilter === 'wishlist' ? 'dl-chip-on' : 'dl-chip-off border border-surface-variant'}`}
              >
                <Icon name="favorite" size={14} /> 가고싶은 곳 {wishlist.length}
              </button>
              <button
                onClick={() => setPlaceFilter('visited')}
                className={`dl-chip ${placeFilter === 'visited' ? 'dl-chip-on' : 'dl-chip-off border border-surface-variant'}`}
              >
                <Icon name="check" size={14} /> 다녀온 곳 {visited.length}
              </button>
            </div>
            {deleting ? (
              <span className="dl-mono shrink-0 text-xs text-error">삭제 중 {deleting.done}/{deleting.total}…</span>
            ) : (
              shown.length > 0 && (
                <button
                  onClick={deleteAllWishlist}
                  className="dl-focus flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-error hover:bg-error-container/50"
                >
                  <Icon name="delete" size={14} /> 전체 삭제
                </button>
              )
            )}
          </div>

          {shown.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-surface-variant py-10 text-center text-sm text-muted">
              {placeFilter === 'visited'
                ? '아직 다녀온 곳이 없어요. 장소 카드의 “다녀왔어요!”를 누르면 여기로 넘어와요.'
                : '가고싶은 곳이 비어 있어요.'}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((p, i) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    index={i}
                    onVisit={placeFilter === 'wishlist' ? markVisited : undefined}
                    onEdit={openEdit}
                    onDelete={remove}
                    onOpen={openEdit}
                  />
                ))}
              </div>
              {placeFilter === 'wishlist' && (
                <p className="mt-4 text-center text-xs text-muted">
                  “다녀왔어요!”로 넘긴 장소는 위 <b>다녀온 곳</b> 탭에서 다시 볼 수 있어요.
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* mobile FAB */}
      <button
        className="dl-focus fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-glow-primary sm:hidden"
        onClick={openAdd}
        aria-label="가고 싶은 곳 추가"
      >
        <Icon name="add" size={28} />
      </button>

      <AddPlaceSheet open={sheetOpen} onClose={() => setSheetOpen(false)} editing={editing} />
      <ImportSheet open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}

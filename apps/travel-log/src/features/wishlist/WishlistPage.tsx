import { useState } from 'react'
import { useTrip } from '../../trip/TripContext'
import { PageTitle } from '../../components/layout/AppShell'
import { PlaceCard, PlaceCardSkeleton } from '../../components/PlaceCard'
import { Button, EmptyState } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { AddPlaceSheet } from '../place/AddPlaceSheet'
import { ImportSheet } from '../place/ImportSheet'
import { RouteView } from './RouteView'
import { usePlaceActions } from '../../hooks/usePlaceActions'
import type { Place } from '../../data/types'

export function WishlistPage() {
  const { places, loading } = useTrip()
  const { markVisited, remove } = usePlaceActions()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Place | null>(null)
  const [tab, setTab] = useState<'route' | 'wishlist'>('route')

  const wishlist = places.filter((p) => p.status === 'wishlist')

  function openAdd() {
    setEditing(null)
    setSheetOpen(true)
  }
  function openEdit(p: Place) {
    setEditing(p)
    setSheetOpen(true)
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
      ) : wishlist.length === 0 ? (
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
          <p className="dl-mono mb-3 text-sm text-muted">위시리스트 {wishlist.length}곳</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((p, i) => (
              <PlaceCard
                key={p.id}
                place={p}
                index={i}
                onVisit={markVisited}
                onEdit={openEdit}
                onDelete={remove}
                onOpen={openEdit}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            다녀온 곳으로 넘긴 장소는 “여행”에서 다시 볼 수 있어요.
          </p>
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

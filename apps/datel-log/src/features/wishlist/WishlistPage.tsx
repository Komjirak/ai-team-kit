import { useState } from 'react'
import { useCouple } from '../../couple/CoupleContext'
import { PageTitle } from '../../components/layout/AppShell'
import { PlaceCard, PlaceCardSkeleton } from '../../components/PlaceCard'
import { Button, EmptyState } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { AddPlaceSheet } from '../place/AddPlaceSheet'
import { usePlaceActions } from '../../hooks/usePlaceActions'
import type { Place } from '../../data/types'

export function WishlistPage() {
  const { places, loading } = useCouple()
  const { markVisited, remove } = usePlaceActions()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Place | null>(null)

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
        <PageTitle title="가고 싶은 곳" subtitle="언젠가 꼭 함께 가고 싶은 장소들" />
        <Button icon="add" onClick={openAdd} className="mb-2 hidden sm:inline-flex">
          가고 싶은 곳 추가
        </Button>
      </div>

      {loading ? (
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
            전환한 장소는 “우리의 기록”에서 다시 볼 수 있어요.
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
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { StatTile } from '../../components/ui/StatTile'
import { Icon } from '../../components/ui/Icon'
import { Button, EmptyState, Skeleton } from '../../components/ui/basics'
import { Washi, Sticker } from '../../components/ui/deco'
import { PlaceCard } from '../../components/PlaceCard'
import { AddPlaceSheet } from '../place/AddPlaceSheet'
import { usePlaceActions } from '../../hooks/usePlaceActions'
import type { Place } from '../../data/types'

export function HomePage() {
  const { user } = useAuth()
  const { activeTrip, places, stats, loading } = useTrip()
  const { markVisited, remove } = usePlaceActions()
  const nav = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Place | null>(null)

  function openEdit(p: Place) {
    setEditing(p)
    setSheetOpen(true)
  }
  function openAdd() {
    setEditing(null)
    setSheetOpen(true)
  }

  const recent = [...places].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Greeting banner */}
      <section className="relative">
        <Washi color="mint" className="left-10 -top-2" rotate={-3} />
        <div className="dl-card overflow-hidden bg-pastel-blue/60 p-6">
          <Sticker
            icon={<Icon name="favorite" fill size={18} />}
            className="-right-2 -top-2"
            bg="bg-surface"
            color="text-primary-container"
          />
          <h2 className="font-display text-2xl font-extrabold text-ink">
            {activeTrip?.title ?? '우리 여행'} ✨
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/80">
            {user?.nickname ?? '친구'}님, 가고 싶은 곳을 담아볼까요? 함께 갈 곳도, 다녀온 곳도 모두 이 여행의 기록이 돼요.
          </p>
          <Button icon="photo_camera" className="mt-4" onClick={openAdd}>
            새로운 장소 담기
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section>
        <SectionLabel icon="monitoring" text="OUR STATS" />
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              icon="event"
              color="primary"
              value={stats.tripDays ?? '—'}
              label="여행 일수"
              onClick={() => nav('/dashboard')}
            />
            <StatTile
              icon="restaurant"
              color="lavender"
              value={stats.visitedCount}
              label="다녀온 곳"
              onClick={() => nav('/wishlist?filter=visited')}
            />
            <StatTile
              icon="photo_camera"
              color="yellow"
              value={stats.memoryCount}
              label="남긴 추억"
              onClick={() => nav('/memories')}
            />
            <StatTile
              icon="location_on"
              color="mint"
              value={stats.wishlistCount}
              label="가고싶은 곳"
              onClick={() => nav('/wishlist')}
            />
          </div>
        )}
      </section>

      {/* Recent logs */}
      <section>
        <SectionLabel icon="history" text="RECENT LOGS" />
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon="auto_awesome"
            title="첫 기록을 시작해볼까요?"
            hint="가고 싶은 곳을 담으면 여기에 우리의 로그가 쌓여요."
            action={
              <Button icon="add" onClick={openAdd}>
                첫 장소 담기
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p, i) => (
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
        )}
      </section>

      <AddPlaceSheet open={sheetOpen} onClose={() => setSheetOpen(false)} editing={editing} />
    </div>
  )
}

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-muted">
      <Icon name={icon} size={18} />
      <span className="dl-mono text-sm font-bold tracking-wider">{text}</span>
    </div>
  )
}

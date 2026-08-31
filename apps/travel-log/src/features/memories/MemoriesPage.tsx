import { useState } from 'react'
import { useTrip } from '../../trip/TripContext'
import { PageTitle } from '../../components/layout/AppShell'
import { Button, EmptyState, Skeleton } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi, Pin } from '../../components/ui/deco'
import { AddMemorySheet } from './AddMemorySheet'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import type { Trip } from '../../data/types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

export function MemoriesPage() {
  const { activeTrip, memories, expenses, members, stats, loading } = useTrip()
  const toast = useToast()
  const [open, setOpen] = useState(false)

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)

  async function del(id: string, name: string) {
    if (!confirm(`‘${name}’의 추억을 삭제할까요?`)) return
    await backend.deleteMemory(id)
    toast.show('추억을 삭제했어요.')
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <PageTitle title="추억" subtitle="다녀온 곳에 남긴 여행의 조각들" />
        <Button icon="add" onClick={() => setOpen(true)} className="mb-2 hidden sm:inline-flex">
          추억 남기기
        </Button>
      </div>

      {/* 여행 요약 카드 — 재방문 훅(K1) */}
      {!loading && activeTrip && (
        <TripRecap
          trip={activeTrip}
          tripDays={stats.tripDays}
          visitedCount={stats.visitedCount}
          photoCount={stats.photoCount}
          memberCount={members.length}
          totalSpent={totalSpent}
        />
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <EmptyState
          icon="auto_awesome"
          title="아직 남긴 추억이 없어요."
          hint="다녀온 곳에 사진과 후기를 남기면, 여행이 끝난 뒤에도 페이지로 남아요."
          action={
            <Button icon="add" onClick={() => setOpen(true)}>
              추억 남기기
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m, i) => (
            <article key={m.id} className="polaroid relative rounded-2xl" style={{ transform: `rotate(${i % 2 ? 1 : -1.5}deg)` }}>
              {i % 2 === 0 ? (
                <Washi color={(['yellow', 'mint', 'lavender', 'blue'] as const)[i % 4]} className="left-10 -top-2" rotate={-4} />
              ) : (
                <Pin className="right-4 -top-2" color="#655689" />
              )}
              <div className="overflow-hidden rounded-xl bg-surface-container">
                {m.photoUrls[0] ? (
                  <img src={m.photoUrls[0]} alt="" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center text-muted">
                    <Icon name="photo_camera" size={36} />
                  </div>
                )}
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg font-bold text-ink">{m.placeName}</h3>
                  <button className="text-muted hover:text-error" onClick={() => del(m.id, m.placeName)} aria-label="삭제">
                    <Icon name="delete" size={18} />
                  </button>
                </div>
                <p className="dl-mono text-xs text-muted">{m.visitedAt.replace(/-/g, '.')}</p>
                <p className="mt-2 line-clamp-3 text-sm text-ink/80">{m.text}</p>
                {m.photoUrls.length > 1 && (
                  <p className="dl-mono mt-2 text-xs text-muted">
                    <Icon name="photo_library" size={14} className="align-text-bottom" /> 사진 {m.photoUrls.length}장
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <button
        className="dl-focus fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-glow-primary sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="추억 남기기"
      >
        <Icon name="add" size={28} />
      </button>

      <AddMemorySheet open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function isPast(trip: Trip): boolean {
  if (!trip.endDate) return false
  return trip.endDate < new Date().toISOString().slice(0, 10)
}

function TripRecap({
  trip,
  tripDays,
  visitedCount,
  photoCount,
  memberCount,
  totalSpent,
}: {
  trip: Trip
  tripDays: number | null
  visitedCount: number
  photoCount: number
  memberCount: number
  totalSpent: number
}) {
  const past = isPast(trip)
  const stats: { icon: string; label: string; value: string }[] = [
    { icon: 'event', label: '여행', value: tripDays != null ? `${tripDays}일` : '—' },
    { icon: 'location_on', label: '다녀온 곳', value: `${visitedCount}곳` },
    { icon: 'photo_library', label: '사진', value: `${photoCount}장` },
    { icon: 'group', label: '멤버', value: `${memberCount}명` },
    { icon: 'wallet', label: '함께 쓴 돈', value: won(totalSpent) },
  ]

  return (
    <section className="dl-card relative mb-6 overflow-hidden p-5">
      <Washi color="yellow" className="left-1/2 -top-2 -translate-x-1/2" rotate={-2} />
      {past && (
        <span className="dl-mono mb-2 inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
          <Icon name="history" size={14} /> 지난 여행 · 다시 꺼내보기
        </span>
      )}
      <div className="flex items-start gap-4">
        {trip.coverPhoto && (
          <div className="polaroid hidden shrink-0 rounded-xl sm:block" style={{ transform: 'rotate(-3deg)', width: 96 }}>
            <img src={trip.coverPhoto} alt="" className="aspect-square w-full rounded-lg object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-extrabold text-ink">{trip.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {[trip.destination].filter(Boolean).join('')} 이 여행을 오래 간직해요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.map((s) => (
              <span
                key={s.label}
                className="dl-mono inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs font-bold text-ink"
              >
                <Icon name={s.icon} size={14} className="text-primary" />
                <span className="text-muted">{s.label}</span> {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

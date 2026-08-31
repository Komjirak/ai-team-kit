import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useCouple } from '../../couple/CoupleContext'
import { StatTile } from '../../components/ui/StatTile'
import { Icon } from '../../components/ui/Icon'
import { Skeleton } from '../../components/ui/basics'
import { BRAND } from '../../components/layout/nav'
import { Washi, Pin } from '../../components/ui/deco'
import { RunnerRace } from './RunnerRace'

export function DashboardPage() {
  const { user } = useAuth()
  const { couple, stats, loading, partner } = useCouple()
  const nav = useNavigate()

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-56" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-2">
        <Icon name="favorite" fill className="text-primary-container" size={24} />
        <h1 className="font-display text-2xl font-extrabold text-primary">{BRAND} · 우리의 기록</h1>
      </div>

      {/* D-day hero */}
      <section className="relative">
        <Washi color="yellow" className="left-1/2 -top-2 -translate-x-1/2" rotate={-2} />
        <div className="polaroid rounded-[24px]" style={{ transform: 'rotate(-1deg)' }}>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=900&q=70"
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
            <span className="washi washi-mint left-6 top-4" style={{ transform: 'rotate(-8deg)', width: 90 }} />
          </div>
          {stats.daysTogether != null ? (
            <div className="flex flex-wrap items-end justify-between gap-2 px-2 pt-3">
              <p className="font-display text-3xl font-extrabold text-ink">
                함께한 지 <span className="text-primary">{stats.daysTogether}</span>일
              </p>
              <span className="dl-mono rounded-full border border-primary/40 bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                D {couple?.startDate?.replace(/-/g, '.')}
              </span>
            </div>
          ) : (
            <button
              onClick={() => nav('/settings')}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-primary-soft px-4 py-3 text-left"
            >
              <span>
                <span className="block font-display text-lg font-bold text-ink">함께한 지</span>
                <span className="text-sm text-muted">관계 시작일을 설정해주세요</span>
              </span>
              <span className="dl-btn-soft">설정에서 입력하기 →</span>
            </button>
          )}
        </div>
      </section>

      {/* stat tiles */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon="restaurant" color="lavender" value={stats.visitedCount} label="다녀온 곳" onClick={() => nav('/wishlist')} />
        <StatTile icon="location_on" color="mint" value={stats.wishlistCount} label="가고싶은 곳" onClick={() => nav('/wishlist')} />
        <StatTile icon="favorite" color="primary" value={stats.memoryCount} label="남긴 추억" onClick={() => nav('/memories')} />
        <StatTile icon="photo_library" color="yellow" value={stats.photoCount} label="사진" onClick={() => nav('/memories')} />
      </section>

      {/* first record + most-remembered place */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="dl-card relative p-4">
          <Pin className="right-3 -top-2" color="#984631" />
          <p className="dl-mono text-xs font-bold tracking-wider text-muted">추억이 가장 많은 곳</p>
          {stats.topMemoryPlace ? (
            <>
              <p className="mt-2 font-display text-xl font-bold text-ink">{stats.topMemoryPlace.name}</p>
              <p className="text-sm text-muted">추억 {stats.topMemoryPlace.count}개</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">아직 없어요</p>
          )}
        </div>
        <div className="dl-card relative p-4">
          <Washi color="blue" className="left-5 -top-2" rotate={4} />
          <p className="dl-mono text-xs font-bold tracking-wider text-muted">우리의 첫 기록</p>
          {stats.firstVisit ? (
            <>
              <p className="mt-2 font-display text-xl font-bold text-ink">{stats.firstVisit.name}</p>
              <p className="dl-mono text-sm text-muted">
                {stats.firstVisit.visitedAt
                  ? new Date(stats.firstVisit.visitedAt).toISOString().slice(0, 10).replace(/-/g, '.')
                  : ''}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">첫 장소를 담아보세요</p>
          )}
        </div>
      </section>

      {/* runner race */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-ink">누가 더 많이 등록했을까 🏃</h2>
        </div>
        {!partner && (
          <p className="mb-3 text-sm text-muted">파트너가 합류하면 함께 겨뤄봐요. 지금은 나의 기록만 보여요.</p>
        )}
        <RunnerRace runners={stats.perMemberPlaceCount} meId={user?.id} />
        <p className="mt-2 text-center text-xs text-muted">둘이 함께 쌓아온 자리들이에요.</p>
      </section>
    </div>
  )
}

import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'
import { StatTile } from '../../components/ui/StatTile'
import { Icon } from '../../components/ui/Icon'
import { Skeleton, Spinner } from '../../components/ui/basics'
import { Washi, Pin } from '../../components/ui/deco'
import { useToast } from '../../components/ui/Toast'
import { toLocalYmd } from '../../data/schedule'
import { RunnerRace } from './RunnerRace'

function fmtRange(startDate?: string, endDate?: string): string | null {
  if (!startDate) return null
  const s = startDate.replace(/-/g, '.')
  if (!endDate || endDate === startDate) return s
  return `${s} – ${endDate.replace(/-/g, '.')}`
}

export function DashboardPage() {
  const { user } = useAuth()
  const { activeTrip, stats, loading, members } = useTrip()
  const nav = useNavigate()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function pickCover(files: FileList | null) {
    if (!files?.[0] || !activeTrip) return
    setUploading(true)
    try {
      const url = await backend.uploadPhoto(activeTrip.id, files[0])
      await backend.updateTrip(activeTrip.id, { coverPhoto: url })
      toast.show('대표 사진을 바꿨어요.')
    } catch {
      toast.show('사진을 올리지 못했어요. (photo.upload_failed)')
    } finally {
      setUploading(false)
    }
  }

  if (loading || !activeTrip) {
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

  const range = fmtRange(activeTrip.startDate, activeTrip.endDate)

  return (
    <div className="space-y-6 pt-4">
      {/* cover hero */}
      <section className="relative">
        <Washi color="yellow" className="left-1/2 -top-2 -translate-x-1/2" rotate={-2} />
        <div className="polaroid rounded-[24px]" style={{ transform: 'rotate(-1deg)' }}>
          <div className="relative overflow-hidden rounded-2xl bg-surface-container">
            {activeTrip.coverPhoto ? (
              <img src={activeTrip.coverPhoto} alt="" className="aspect-[16/10] w-full object-cover" />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-primary-soft text-primary"
              >
                {uploading ? <Spinner size={26} /> : <Icon name="add_a_photo" size={30} />}
                <span className="text-sm font-semibold">여행 대표 사진 추가하기</span>
              </button>
            )}
            <span className="washi washi-mint left-6 top-4" style={{ transform: 'rotate(-8deg)', width: 90 }} />
            {activeTrip.coverPhoto && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="dl-focus absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-ink/70 text-white backdrop-blur"
                aria-label="대표 사진 바꾸기"
              >
                {uploading ? <Spinner size={18} /> : <Icon name="photo_camera" size={20} />}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickCover(e.target.files)} />

          <div className="flex flex-wrap items-end justify-between gap-2 px-2 pt-3">
            <div className="min-w-0">
              <p className="truncate font-display text-2xl font-extrabold text-ink">{activeTrip.title}</p>
              <p className="dl-mono mt-0.5 text-sm text-muted">
                {[activeTrip.destination, range].filter(Boolean).join(' · ') || '기간 미정'}
              </p>
            </div>
            {stats.tripDays != null && (
              <span className="dl-mono rounded-full border border-primary/40 bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                {stats.tripDays}일 여행
              </span>
            )}
          </div>
          {!range && (
            <button
              onClick={() => nav('/settings')}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-primary-soft px-4 py-3 text-left"
            >
              <span>
                <span className="block font-display text-lg font-bold text-ink">여행 기간</span>
                <span className="text-sm text-muted">설정에서 날짜를 정해요</span>
              </span>
              <span className="dl-btn-soft">설정에서 입력하기 →</span>
            </button>
          )}
        </div>
      </section>

      {/* stat tiles */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon="restaurant" color="lavender" value={stats.visitedCount} label="다녀온 곳" onClick={() => nav('/wishlist?filter=visited')} />
        <StatTile icon="location_on" color="mint" value={stats.wishlistCount} label="가고싶은 곳" onClick={() => nav('/wishlist')} />
        <StatTile icon="photo_camera" color="primary" value={stats.memoryCount} label="남긴 추억" onClick={() => nav('/memories')} />
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
                  ? toLocalYmd(new Date(stats.firstVisit.visitedAt)).replace(/-/g, '.')
                  : ''}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">첫 장소를 담아보세요</p>
          )}
        </div>
      </section>

      {/* member race */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-ink">누가 더 많이 담았을까 🏃</h2>
        </div>
        {members.length <= 1 && (
          <p className="mb-3 text-sm text-muted">친구가 합류하면 함께 겨뤄봐요. 지금은 나의 기록만 보여요.</p>
        )}
        <RunnerRace runners={stats.perMemberPlaceCount} meId={user?.id} />
        <p className="mt-2 text-center text-xs text-muted">함께 쌓아온 자리들이에요.</p>
      </section>

      {/* to settings */}
      <button
        onClick={() => nav('/settings')}
        className="dl-focus flex w-full items-center justify-between rounded-2xl bg-surface-container px-4 py-3 text-left hover:bg-primary-soft"
      >
        <span className="flex items-center gap-2 font-semibold text-ink">
          <Icon name="settings" size={20} className="text-primary" /> 여행 설정 · 초대코드 · 멤버
        </span>
        <Icon name="chevron_right" className="text-muted" />
      </button>
    </div>
  )
}

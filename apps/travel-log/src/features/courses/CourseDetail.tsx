import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCouple } from '../../couple/CoupleContext'
import { backend } from '../../data'
import { Icon } from '../../components/ui/Icon'
import { CategoryBadge, Skeleton } from '../../components/ui/basics'
import { Washi } from '../../components/ui/deco'
import { RouteMap } from '../../kakao/RouteMap'
import { CreateCourseSheet } from './CreateCourseSheet'
import { useToast } from '../../components/ui/Toast'
import { haversine, walkingMinutes } from '../../data/stats'
import type { Place, PlaceCategory } from '../../data/types'

const catIcon: Record<PlaceCategory, string> = {
  카페: 'local_cafe',
  맛집: 'restaurant',
  자연: 'park',
  문화: 'auto_stories',
  데이트: 'favorite',
  기타: 'place',
}

export function CourseDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { courses, places, loading } = useCouple()
  const [editOpen, setEditOpen] = useState(false)

  const course = courses.find((c) => c.id === id)
  const stops = useMemo<Place[]>(
    () =>
      course
        ? course.placeIds
            .map((pid) => places.find((p) => p.id === pid))
            .filter((p): p is Place => !!p)
        : [],
    [course, places],
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-lg font-bold text-ink">코스를 찾을 수 없어요.</p>
        <Link to="/courses" className="mt-3 inline-block text-primary underline">
          코스 목록으로
        </Link>
      </div>
    )
  }

  async function del() {
    if (!course) return
    if (!confirm(`코스 ‘${course.title}’을(를) 삭제할까요?`)) return
    await backend.deleteCourse(course.id)
    toast.show('코스를 삭제했어요.')
    nav('/courses')
  }

  function share() {
    const text = `${course!.title} — Datel.log 데이트 코스`
    if (navigator.share) navigator.share({ title: course!.title, text }).catch(() => {})
    else {
      navigator.clipboard?.writeText(text).catch(() => {})
      toast.show('코스 정보를 복사했어요.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-1 text-sm text-muted" onClick={() => nav('/courses')}>
          <Icon name="arrow_back" size={18} /> 코스 목록
        </button>
        <div className="flex items-center gap-1">
          <button className="dl-btn-ghost !px-3" onClick={share} aria-label="공유">
            <Icon name="ios_share" size={18} /> 공유
          </button>
          <button className="dl-btn-ghost !px-3" onClick={() => setEditOpen(true)}>
            <Icon name="edit" size={18} /> 수정
          </button>
          <button className="dl-btn-ghost !px-3 text-error" onClick={del}>
            <Icon name="delete" size={18} />
          </button>
        </div>
      </div>

      {/* header card */}
      <div className="dl-card relative p-5">
        <Washi color="yellow" className="left-1/2 -top-2 -translate-x-1/2" rotate={-2} />
        <h1 className="font-display text-2xl font-extrabold text-ink">{course.title}</h1>
        {course.memo && <p className="mt-2 text-sm leading-relaxed text-muted">{course.memo}</p>}
        <p className="dl-mono mt-3 text-xs text-muted">장소 {stops.length}곳</p>
      </div>

      {/* map */}
      {stops.length >= 1 ? (
        <div className="relative">
          <p className="dl-mono mb-2 text-center text-sm font-bold tracking-wider text-muted">OUR ROUTE</p>
          <RouteMap places={stops} />
        </div>
      ) : (
        <div className="rounded-card bg-surface-container px-4 py-8 text-center text-sm text-muted">
          장소를 더 담아 코스를 이어보세요.
        </div>
      )}

      {/* timeline */}
      <div>
        <p className="mb-3 font-display text-lg font-bold text-ink">코스 순서</p>
        <ol className="relative space-y-4">
          {stops.map((p, i) => {
            const next = stops[i + 1]
            const km = next ? haversine(p, next) : 0
            return (
              <li key={p.id} className="relative pl-12">
                {/* connector line */}
                {i < stops.length - 1 && (
                  <span className="absolute left-[15px] top-8 h-[calc(100%+1rem)] w-0.5 border-l-2 border-dashed border-surface-variant" />
                )}
                <span className="dl-mono absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-on-primary shadow-glow-primary">
                  {i + 1}
                </span>
                <div className="dl-card relative p-4">
                  <span className="absolute -top-2 right-3 grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary">
                    <Icon name={catIcon[p.category]} size={18} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink">{p.name}</h3>
                  <p className="mt-0.5 text-xs text-muted">{p.address}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <CategoryBadge category={p.category} />
                    {p.status === 'wishlist' && (
                      <span className="dl-mono rounded-full bg-surface-container px-2 py-0.5 text-xs text-muted">
                        위시리스트
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <DirectionsLink place={p} />
                  </div>
                </div>
                {next && km > 0 && (
                  <p className="dl-mono mt-2 pl-1 text-xs text-muted">
                    ↓ 직선거리 {km.toFixed(2)}km · 도보 {walkingMinutes(km)}분
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <CreateCourseSheet open={editOpen} onClose={() => setEditOpen(false)} editing={course} />
    </div>
  )
}

function DirectionsLink({ place }: { place: Place }) {
  const toast = useToast()
  const canDeepLink = place.lat != null && place.lng != null
  const href = canDeepLink
    ? `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`
    : `https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="dl-btn-ghost inline-flex"
      onClick={() => {
        if (!canDeepLink) {
          navigator.clipboard?.writeText(place.name).catch(() => {})
          toast.show('좌표가 없어 장소명을 복사했어요.')
        }
      }}
    >
      <Icon name="directions" size={18} /> 길찾기
    </a>
  )
}

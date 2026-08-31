import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCouple } from '../../couple/CoupleContext'
import { PageTitle } from '../../components/layout/AppShell'
import { Button, EmptyState, Skeleton } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi } from '../../components/ui/deco'
import { CreateCourseSheet } from './CreateCourseSheet'
import { courseDistanceKm } from '../../data/stats'

export function CoursesPage() {
  const { courses, places, loading } = useCouple()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex items-end justify-between">
        <PageTitle title="데이트 코스" subtitle="장소를 이어 하루의 동선을 만들어요" />
        <Button icon="add" onClick={() => setOpen(true)} className="mb-2 hidden sm:inline-flex">
          코스 만들기
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon="map"
          title="아직 만든 코스가 없어요."
          hint="담아둔 장소들을 이어 우리만의 데이트 코스를 만들어보세요."
          action={
            <Button icon="add" onClick={() => setOpen(true)}>
              코스 만들기
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c, i) => {
            const km = courseDistanceKm(c, places)
            return (
              <Link
                key={c.id}
                to={`/course/${c.id}`}
                className="dl-card relative block p-5 transition-transform active:scale-[0.98]"
              >
                <Washi color={i % 2 ? 'lavender' : 'yellow'} className="left-6 -top-2" rotate={-3} />
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-xl font-bold text-ink">{c.title}</h3>
                  <Icon name="chevron_right" className="text-muted" />
                </div>
                {c.memo && <p className="mt-1 line-clamp-2 text-sm text-muted">{c.memo}</p>}
                <div className="dl-mono mt-4 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Icon name="place" size={16} /> {c.placeIds.length}곳
                  </span>
                  {km > 0 && (
                    <span className="flex items-center gap-1">
                      <Icon name="straighten" size={16} /> {km.toFixed(2)}km
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <button
        className="dl-focus fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-glow-primary sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="코스 만들기"
      >
        <Icon name="add" size={28} />
      </button>

      <CreateCourseSheet open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

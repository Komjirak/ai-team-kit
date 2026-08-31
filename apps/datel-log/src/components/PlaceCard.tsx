import { useState } from 'react'
import type { Place, PlaceCategory } from '../data/types'
import { Icon } from './ui/Icon'
import { CategoryBadge } from './ui/basics'
import { Washi, Pin } from './ui/deco'

const washiCycle = ['yellow', 'lavender', 'mint', 'blue'] as const

// Pretty placeholder (icon + soft tint) shown when a place has no photo.
const placeholder: Record<PlaceCategory, { icon: string; tint: string; fg: string }> = {
  카페: { icon: 'local_cafe', tint: 'bg-primary-soft', fg: 'text-primary' },
  맛집: { icon: 'restaurant', tint: 'bg-tape-yellow/50', fg: 'text-ink/70' },
  자연: { icon: 'park', tint: 'bg-pastel-mint', fg: 'text-tertiary' },
  문화: { icon: 'auto_stories', tint: 'bg-pastel-blue', fg: 'text-secondary' },
  데이트: { icon: 'favorite', tint: 'bg-pastel-lavender', fg: 'text-secondary' },
  기타: { icon: 'place', tint: 'bg-surface-container', fg: 'text-muted' },
}

export function PlaceCard({
  place,
  index = 0,
  onVisit,
  onEdit,
  onDelete,
}: {
  place: Place
  index?: number
  onVisit?: (p: Place) => void
  onEdit?: (p: Place) => void
  onDelete?: (p: Place) => void
}) {
  const [menu, setMenu] = useState(false)
  const visited = place.status === 'visited'
  const color = washiCycle[index % washiCycle.length]

  return (
    <article className="dl-card overflow-visible p-3">
      {index % 2 === 0 ? (
        <Washi color={color} className="left-8 -top-2" rotate={-4} />
      ) : (
        <Pin className="-right-1 -top-2" color="#655689" />
      )}

      <div className="relative overflow-hidden rounded-2xl bg-surface-container">
        {place.thumbnail ? (
          <img
            src={place.thumbnail}
            alt=""
            loading="lazy"
            className="aspect-[16/10] w-full object-cover"
          />
        ) : (
          <div
            className={`flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 ${placeholder[place.category].tint} ${placeholder[place.category].fg}`}
          >
            <Icon name={placeholder[place.category].icon} size={34} />
            <span className="dl-mono text-xs opacity-70">{place.category}</span>
          </div>
        )}
        {visited && (
          <span className="dl-mono absolute left-2 top-2 rounded-full bg-ink/75 px-2 py-1 text-xs font-bold text-white">
            다녀온 곳
          </span>
        )}
      </div>

      <div className="px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight text-ink">{place.name}</h3>
          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                className="dl-focus grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-container"
                aria-label="더보기"
                onClick={() => setMenu((m) => !m)}
              >
                <Icon name="more_horiz" size={20} />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="dl-card absolute right-0 z-20 mt-1 w-32 p-1 text-sm">
                    {onEdit && (
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-container"
                        onClick={() => {
                          setMenu(false)
                          onEdit(place)
                        }}
                      >
                        <Icon name="edit" size={16} /> 수정
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-error hover:bg-surface-container"
                        onClick={() => {
                          setMenu(false)
                          onDelete(place)
                        }}
                      >
                        <Icon name="delete" size={16} /> 삭제
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {place.memo && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{place.memo}</p>}
        <p className="mt-1 line-clamp-1 text-xs text-muted-soft">{place.address}</p>

        <div className="mt-3 flex items-center justify-between">
          <CategoryBadge category={place.category} />
          {!visited && onVisit && (
            <button
              className="dl-focus dl-mono rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary transition-transform active:scale-95"
              onClick={() => onVisit(place)}
            >
              다녀왔어요!
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export function PlaceCardSkeleton() {
  return (
    <div className="dl-card p-3">
      <div className="dl-skeleton aspect-[16/10] w-full rounded-2xl" />
      <div className="space-y-2 px-1 pt-3">
        <div className="dl-skeleton h-5 w-2/3 rounded" />
        <div className="dl-skeleton h-3 w-1/2 rounded" />
        <div className="dl-skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

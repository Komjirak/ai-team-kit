import { useState } from 'react'
import { useTrip } from '../../trip/TripContext'
import { PageTitle } from '../../components/layout/AppShell'
import { Button, EmptyState, Skeleton } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi, Pin } from '../../components/ui/deco'
import { AddMemorySheet } from './AddMemorySheet'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'

export function MemoriesPage() {
  const { memories, loading } = useTrip()
  const toast = useToast()
  const [open, setOpen] = useState(false)

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
          hint="다녀온 곳에 사진과 후기를 남겨 추억을 모아보세요."
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

import { useEffect, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { useCouple } from '../../couple/CoupleContext'
import { useAuth } from '../../auth/AuthContext'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import type { Course } from '../../data/types'

/** 코스 만들기 / 수정: pick places, order them, save. */
export function CreateCourseSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: Course | null
}) {
  const { places } = useCouple()
  const { user } = useAuth()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setMemo(editing?.memo ?? '')
    setPicked(editing?.placeIds ?? [])
  }, [open, editing])

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  function move(id: string, dir: -1 | 1) {
    setPicked((p) => {
      const i = p.indexOf(id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= p.length) return p
      const next = [...p]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  async function save() {
    if (!user?.coupleId || !title.trim() || picked.length === 0) return
    setSaving(true)
    try {
      if (editing) {
        await backend.updateCourse(editing.id, { title: title.trim(), memo: memo.trim() || undefined, placeIds: picked })
        toast.show('코스를 수정했어요.')
      } else {
        await backend.addCourse({
          coupleId: user.coupleId,
          title: title.trim(),
          memo: memo.trim() || undefined,
          placeIds: picked,
          createdBy: user.id,
        })
        toast.show('데이트 코스를 만들었어요.')
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const orderedPicked = picked
    .map((id) => places.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
  const unpicked = places.filter((p) => !picked.includes(p.id))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? '코스 수정' : '데이트 코스 만들기'}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={save}
            loading={saving}
            disabled={!title.trim() || picked.length === 0}
            icon="check"
          >
            {editing ? '저장' : '코스 저장'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="코스 이름 (예: 성수동 골목길 투어)"
          className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          placeholder="메모 (선택)"
          className="w-full resize-none rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />

        {places.length === 0 ? (
          <p className="rounded-xl bg-surface-container px-4 py-6 text-center text-sm text-muted">
            먼저 “가고 싶은 곳”에 장소를 담아주세요.
          </p>
        ) : (
          <>
            {orderedPicked.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">코스 순서 ({orderedPicked.length}곳)</p>
                <ul className="space-y-2">
                  {orderedPicked.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-2 rounded-2xl bg-primary-soft px-3 py-2">
                      <span className="dl-mono grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-semibold text-ink">{p.name}</span>
                      <button className="text-muted disabled:opacity-30" onClick={() => move(p.id, -1)} disabled={i === 0} aria-label="위로">
                        <Icon name="keyboard_arrow_up" size={20} />
                      </button>
                      <button
                        className="text-muted disabled:opacity-30"
                        onClick={() => move(p.id, 1)}
                        disabled={i === orderedPicked.length - 1}
                        aria-label="아래로"
                      >
                        <Icon name="keyboard_arrow_down" size={20} />
                      </button>
                      <button className="text-error" onClick={() => toggle(p.id)} aria-label="제거">
                        <Icon name="close" size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {unpicked.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">장소 추가</p>
                <div className="flex flex-wrap gap-2">
                  {unpicked.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      className="dl-chip dl-chip-off border border-surface-variant"
                    >
                      <Icon name="add" size={16} /> {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  )
}

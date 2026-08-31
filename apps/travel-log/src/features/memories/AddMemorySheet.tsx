import { useEffect, useRef, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button, Spinner } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { useTrip } from '../../trip/TripContext'
import { useAuth } from '../../auth/AuthContext'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'

const today = () => new Date().toISOString().slice(0, 10)

/** 추억 남기기: pick a place, write a note, attach photos. */
export function AddMemorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { places, activeTrip } = useTrip()
  const { user } = useAuth()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [placeId, setPlaceId] = useState('')
  const [text, setText] = useState('')
  const [visitedAt, setVisitedAt] = useState(today())
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPlaceId('')
      setText('')
      setVisitedAt(today())
      setPhotos([])
      setError(null)
    }
  }, [open])

  async function pickPhotos(files: FileList | null) {
    if (!files || !activeTrip) return
    setUploading(true)
    setError(null)
    try {
      const urls: string[] = []
      for (const f of Array.from(files).slice(0, 6)) {
        urls.push(await backend.uploadPhoto(activeTrip.id, f))
      }
      setPhotos((p) => [...p, ...urls].slice(0, 6))
    } catch {
      setError('photo.upload_failed')
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    if (!user || !activeTrip || !placeId || !text.trim()) return
    const place = places.find((p) => p.id === placeId)
    setSaving(true)
    try {
      await backend.addMemory({
        tripId: activeTrip.id,
        placeId,
        placeName: place?.name ?? '이름 없는 장소',
        text: text.trim(),
        photoUrls: photos,
        visitedAt,
        createdBy: user.id,
      })
      // moving a wishlist place into "visited" when we log a memory there
      if (place && place.status === 'wishlist') {
        await backend.updatePlace(place.id, { status: 'visited', visitedAt: Date.now() }).catch(() => {})
      }
      toast.show('추억을 남겼어요.')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="추억 남기기"
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button className="flex-1" onClick={save} loading={saving} disabled={!placeId || !text.trim()} icon="favorite">
            남기기
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">어디에서의 추억인가요?</label>
          {places.length === 0 ? (
            <p className="rounded-xl bg-surface-container px-4 py-4 text-sm text-muted">
              먼저 장소를 담아주세요.
            </p>
          ) : (
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">장소 선택</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">방문일</label>
          <input
            type="date"
            value={visitedAt}
            onChange={(e) => setVisitedAt(e.target.value)}
            className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">후기</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="그날 어땠어요?"
            className="w-full resize-none rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">사진 (최대 6장)</label>
          <div className="flex flex-wrap gap-2">
            {photos.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <button
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-white"
                  onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  aria-label="사진 제거"
                >
                  <Icon name="close" size={12} />
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <button
                className="grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-surface-variant text-muted"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Spinner size={20} /> : <Icon name="add_a_photo" size={22} />}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => pickPhotos(e.target.files)}
          />
          {error && <p className="mt-1 text-xs text-error">사진을 올리지 못했어요. (photo.upload_failed)</p>}
        </div>
      </div>
    </Sheet>
  )
}

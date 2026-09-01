import { useEffect, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../auth/AuthContext'
import { backend } from '../../data'

const errText: Record<string, string> = {
  'invite.invalid': '초대코드를 확인해 주세요. (invite.invalid)',
  'trip.create_failed': '여행을 만들지 못했어요. 다시 시도해 주세요. (trip.create_failed)',
  'trip.join_failed': '합류하지 못했어요. 다시 시도해 주세요. (trip.join_failed)',
}

/**
 * 여행 만들기 / 초대코드로 합류.
 * 성공하면 onDone(새 여행의 tripId)로 활성 여행을 넘긴다.
 */
export function CreateTripSheet({
  open,
  onClose,
  onDone,
  initialMode = 'create',
  initialCode = '',
}: {
  open: boolean
  onClose: () => void
  onDone: (tripId: string) => void
  initialMode?: 'create' | 'join'
  initialCode?: string
}) {
  const { user } = useAuth()
  const [mode, setMode] = useState<'create' | 'join'>(initialMode)
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setTitle('')
      setDestination('')
      setStartDate('')
      setEndDate('')
      setCode(initialCode.toUpperCase().slice(0, 6))
      setError(null)
    }
  }, [open, initialMode, initialCode])

  async function create() {
    if (!user || !title.trim()) return
    setBusy(true)
    setError(null)
    try {
      const trip = await backend.createTrip(user, {
        title: title.trim(),
        destination: destination.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      onDone(trip.id)
      onClose()
    } catch {
      setError('trip.create_failed')
    } finally {
      setBusy(false)
    }
  }

  async function join() {
    if (!user || code.trim().length < 6) return
    setBusy(true)
    setError(null)
    try {
      const trip = await backend.joinTrip(user, code)
      onDone(trip.id)
      onClose()
    } catch (e) {
      const msg = (e as Error).message
      setError(msg === 'invite.invalid' ? 'invite.invalid' : 'trip.join_failed')
    } finally {
      setBusy(false)
    }
  }

  const dateInvalid = !!startDate && !!endDate && endDate < startDate

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={mode === 'create' ? '새 여행 만들기' : '초대코드로 합류'}
      footer={
        mode === 'create' ? (
          <>
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={create}
              loading={busy}
              disabled={!title.trim() || dateInvalid}
              icon="add"
            >
              여행 만들기
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button className="flex-1" onClick={join} loading={busy} disabled={code.trim().length < 6} icon="login">
              합류하기
            </Button>
          </>
        )
      }
    >
      {/* mode toggle */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-surface-container p-1">
        <button
          className={`dl-focus rounded-full py-2 text-sm font-bold ${
            mode === 'create' ? 'bg-primary text-on-primary' : 'text-muted'
          }`}
          onClick={() => {
            setMode('create')
            setError(null)
          }}
        >
          여행 만들기
        </button>
        <button
          className={`dl-focus rounded-full py-2 text-sm font-bold ${
            mode === 'join' ? 'bg-primary text-on-primary' : 'text-muted'
          }`}
          onClick={() => {
            setMode('join')
            setError(null)
          }}
        >
          코드로 합류
        </button>
      </div>

      {mode === 'create' ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">여행 이름 *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 제주 우정여행 3박4일"
              className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">목적지 (선택)</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="예) 제주"
              className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-muted">시작일 (선택)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-muted">종료일 (선택)</label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          {dateInvalid && <p className="text-sm text-error">종료일이 시작일보다 빠를 수 없어요.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="flex items-center gap-2 rounded-2xl bg-primary-soft/60 px-4 py-3 text-sm text-ink">
            <Icon name="group_add" size={20} className="text-primary" />
            친구가 보내준 초대코드 6자리를 입력하면 그 여행에 합류해요.
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="예) 5WG97J"
            className="dl-mono w-full rounded-2xl bg-surface-container px-4 py-4 text-center text-2xl font-bold tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-error">{errText[error] ?? '문제가 생겼어요. 다시 시도해 주세요.'}</p>}
    </Sheet>
  )
}

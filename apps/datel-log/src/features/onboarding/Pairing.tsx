import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { backend } from '../../data'
import { Icon } from '../../components/ui/Icon'
import { Button, Spinner } from '../../components/ui/basics'
import { Washi } from '../../components/ui/deco'
import { BRAND } from '../../components/layout/nav'

const errText: Record<string, string> = {
  'invite.invalid': '초대코드를 확인해 주세요. (invite.invalid)',
  'couple.already_bound': '이미 연결된 계정입니다. (couple.already_bound)',
  'couple.full': '이미 두 명이 연결된 코드예요. (couple.full)',
}

/** Couple binding (design screen _9). Create code OR join with a code. */
export function Pairing() {
  const { user, refreshUser } = useAuth()
  const [mode, setMode] = useState<'choice' | 'join'>('choice')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create() {
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      await backend.createCouple(user)
      await refreshUser()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function join() {
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      await backend.joinCouple(user, code)
      await refreshUser()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <span className="font-display text-3xl font-extrabold text-primary wobbly-underline">{BRAND}</span>
        <p className="mt-4">
          <span className="rounded-full bg-surface-container px-4 py-1.5 text-sm font-semibold text-muted">
            우리만의 작은 다이어리
          </span>
        </p>
      </div>

      {mode === 'choice' && (
        <div className="space-y-5">
          <button
            onClick={create}
            disabled={busy}
            className="dl-focus relative block w-full rounded-[28px] border-2 border-primary/70 bg-surface px-6 py-8 text-center shadow-glow-primary transition-transform active:scale-[0.98]"
          >
            <Washi color="yellow" className="left-1/2 -top-2 -translate-x-1/2" rotate={-2} />
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
              {busy ? <Spinner size={22} /> : <Icon name="add" size={26} />}
            </span>
            <p className="font-display text-2xl font-extrabold text-ink">내 초대코드 만들기</p>
            <p className="mt-1 text-sm text-muted">새로운 다이어리를 시작할게요</p>
          </button>

          <button
            onClick={() => {
              setMode('join')
              setError(null)
            }}
            className="dl-focus relative block w-full rounded-[28px] bg-primary-soft px-6 py-8 text-center transition-transform active:scale-[0.98]"
          >
            <Washi color="lavender" className="left-8 -top-2" rotate={-6} />
            <Washi color="lavender" className="right-8 -top-2" rotate={6} />
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
              <Icon name="link" size={24} />
            </span>
            <p className="font-display text-2xl font-extrabold text-ink">초대코드로 합류하기</p>
            <p className="mt-1 text-sm text-muted">연인의 다이어리에 참여할게요</p>
          </button>
          <p className="text-center text-xs text-muted">파트너가 합류하면 같은 커플로 연결돼요.</p>
        </div>
      )}

      {mode === 'join' && (
        <div className="dl-card space-y-4 p-6">
          <button className="flex items-center gap-1 text-sm text-muted" onClick={() => setMode('choice')}>
            <Icon name="arrow_back" size={18} /> 뒤로
          </button>
          <label className="block text-sm font-semibold text-ink">초대코드 6자리</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="예) 5WG97J"
            className="dl-mono w-full rounded-2xl bg-surface-container px-4 py-4 text-center text-2xl font-bold tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary/50"
          />
          {error && <p className="text-sm text-error">{errText[error] ?? '문제가 생겼어요. 다시 시도해 주세요.'}</p>}
          <Button className="w-full py-4" onClick={join} loading={busy} disabled={code.length < 6}>
            합류하기
          </Button>
        </div>
      )}

      {mode === 'choice' && error && (
        <p className="mt-4 text-center text-sm text-error">{errText[error] ?? '문제가 생겼어요.'}</p>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Avatar } from '../../components/layout/Header'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import { tripDates, fmtDayLabel } from '../../data/schedule'
import { splitEqual } from '../../data/settlement'
import type { Expense } from '../../data/types'

// 카테고리는 라벨만 저장(통계는 Could·범위 밖).
const CATEGORIES = ['식비', '교통', '숙박', '카페', '관광', '기타']

interface Props {
  open: boolean
  onClose: () => void
  editing?: Expense | null
}

/** 비용 추가 / 수정 — 제목·금액·결제자·참여자(기본 전원)·카테고리·날짜. v1은 1/N만. */
export function AddExpenseSheet({ open, onClose, editing }: Props) {
  const { user } = useAuth()
  const { activeTrip, members } = useTrip()
  const toast = useToast()

  const memberIds = members.map((m) => m.id)
  const days = tripDates(activeTrip?.startDate, activeTrip?.endDate)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [category, setCategory] = useState<string>('식비')
  const [date, setDate] = useState('')
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal')
  const [customShares, setCustomShares] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setAmount(editing ? String(editing.amount) : '')
    setPaidBy(editing?.paidBy ?? user?.id ?? memberIds[0] ?? '')
    setParticipants(editing?.participants ?? memberIds)
    setCategory(editing?.category ?? '식비')
    setDate(editing?.date ?? '')
    setSplitMode(editing?.splitMode ?? 'equal')
    setCustomShares(
      editing?.shares
        ? Object.fromEntries(Object.entries(editing.shares).map(([k, v]) => [k, String(v)]))
        : {},
    )
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing])

  const amountNum = Math.max(0, Math.floor(Number(amount.replace(/[^\d]/g, '')) || 0))

  // 참여자 순서를 멤버 순서로 정규화(1원 나머지 배분의 결정성 보장)
  const orderedParticipants = memberIds.filter((id) => participants.includes(id))

  // 균등: 참여자별 정확한 분담액(원). 직접입력: 입력값(빈칸=0).
  const equalShares = splitEqual(amountNum, orderedParticipants.length)
  const shareOf = (id: string): number => {
    if (splitMode === 'custom') return Math.max(0, Math.floor(Number(customShares[id] ?? 0)) || 0)
    const i = orderedParticipants.indexOf(id)
    return i >= 0 ? equalShares[i] : 0
  }
  const customSum = orderedParticipants.reduce((s, id) => s + shareOf(id), 0)
  const customValid = splitMode !== 'custom' || customSum === amountNum
  const canSave = title.trim() !== '' && amountNum > 0 && participants.length > 0 && customValid

  function toggleParticipant(id: string) {
    setParticipants((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  function setShare(id: string, val: string) {
    setCustomShares((s) => ({ ...s, [id]: val.replace(/[^\d]/g, '') }))
  }
  // 나머지를 참여자에게 균등 자동 배분(빈칸/미달분 채우기)
  function autofillRemainder() {
    const eq = splitEqual(amountNum, orderedParticipants.length)
    setCustomShares(Object.fromEntries(orderedParticipants.map((id, i) => [id, String(eq[i])])))
  }
  function nameOf(id: string) {
    return members.find((m) => m.id === id)?.nickname ?? '친구'
  }

  async function save() {
    if (!user || !activeTrip) return
    if (!canSave) {
      setError('expense.save_failed')
      return
    }
    const shares =
      splitMode === 'custom'
        ? Object.fromEntries(orderedParticipants.map((id) => [id, shareOf(id)]))
        : undefined
    const payload = {
      title: title.trim(),
      amount: amountNum,
      paidBy,
      participants: orderedParticipants,
      splitMode,
      shares,
      category,
      date: date || undefined,
    }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await backend.updateExpense(editing.id, payload)
        toast.show('비용을 수정했어요.')
      } else {
        await backend.addExpense({ ...payload, tripId: activeTrip.id, createdBy: user.id })
        toast.show('비용을 담았어요.')
      }
      onClose()
    } catch {
      setError('expense.save_failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? '비용 수정' : '비용 담기'}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={save}
            loading={saving}
            disabled={!canSave}
            icon={editing ? 'save' : 'add'}
          >
            {editing ? '저장' : '담기'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">무엇에 썼어요? *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 첫날 저녁 흑돼지"
            className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">금액 (원) *</label>
          <div className="flex items-center gap-2 rounded-2xl bg-surface-container px-4 py-3 focus-within:ring-2 focus-within:ring-primary/50">
            <input
              inputMode="numeric"
              value={amountNum > 0 ? amountNum.toLocaleString('ko-KR') : ''}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="dl-mono w-full bg-transparent text-right text-lg font-bold text-ink outline-none placeholder:text-muted-soft"
            />
            <span className="text-sm text-muted">원</span>
          </div>
        </div>

        {/* 결제자 */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">누가 냈어요?</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaidBy(m.id)}
                className={`dl-focus flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold ${
                  paidBy === m.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-ink'
                }`}
              >
                <Avatar user={m} />
                {m.nickname}
              </button>
            ))}
          </div>
        </div>

        {/* 참여자 */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-muted">누가 나눠 내요?</label>
            <button
              type="button"
              className="text-xs font-bold text-primary"
              onClick={() =>
                setParticipants(participants.length === memberIds.length ? [] : memberIds)
              }
            >
              {participants.length === memberIds.length ? '전체 해제' : '전원 선택'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const on = participants.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleParticipant(m.id)}
                  className={`dl-focus flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    on ? 'bg-primary-soft text-primary' : 'bg-surface-container text-muted'
                  }`}
                >
                  <Icon name={on ? 'check' : 'add'} size={14} /> {m.nickname}
                </button>
              )
            })}
          </div>
          {participants.length === 0 && (
            <p className="mt-2 text-xs text-error">최소 한 명은 나눠 내야 해요.</p>
          )}

          {/* 분할 방식 — 자동 계산 */}
          {participants.length > 0 && (
            <div className="mt-3 rounded-2xl bg-surface-container/60 p-3">
              <div className="mb-2 flex rounded-full bg-surface p-1 text-sm font-semibold">
                {(['equal', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSplitMode(mode)}
                    className={`flex-1 rounded-full py-1.5 transition-colors ${
                      splitMode === mode ? 'bg-primary text-on-primary' : 'text-muted'
                    }`}
                  >
                    {mode === 'equal' ? '균등 1/N' : '직접 입력'}
                  </button>
                ))}
              </div>

              {splitMode === 'equal' ? (
                <ul className="space-y-1">
                  {orderedParticipants.map((id) => (
                    <li key={id} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{nameOf(id)}</span>
                      <span className="dl-mono font-bold text-ink">
                        {shareOf(id).toLocaleString('ko-KR')}원
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <ul className="space-y-1.5">
                    {orderedParticipants.map((id) => (
                      <li key={id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-ink">{nameOf(id)}</span>
                        <span className="flex items-center gap-1 rounded-xl bg-surface px-3 py-1.5">
                          <input
                            inputMode="numeric"
                            value={shareOf(id) > 0 ? shareOf(id).toLocaleString('ko-KR') : ''}
                            onChange={(e) => setShare(id, e.target.value)}
                            placeholder="0"
                            className="dl-mono w-24 bg-transparent text-right font-bold text-ink outline-none placeholder:text-muted-soft"
                          />
                          <span className="text-xs text-muted">원</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center justify-between">
                    <button type="button" className="text-xs font-bold text-primary" onClick={autofillRemainder}>
                      균등하게 자동 배분
                    </button>
                    <span className={`dl-mono text-xs font-bold ${customValid ? 'text-tertiary' : 'text-error'}`}>
                      합계 {customSum.toLocaleString('ko-KR')} / {amountNum.toLocaleString('ko-KR')}원
                      {!customValid && ` (${(amountNum - customSum > 0 ? '+' : '') + (amountNum - customSum).toLocaleString('ko-KR')})`}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 카테고리 */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">분류 (선택)</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`dl-chip ${category === c ? 'dl-chip-on' : 'dl-chip-off border border-surface-variant'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">날짜 (선택)</label>
          {days.length > 0 ? (
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">미지정</option>
              {days.map((d, i) => (
                <option key={d} value={d}>
                  Day {i + 1} · {fmtDayLabel(d)}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-error">
            담지 못했어요. (expense.save_failed) 제목·금액·참여자를 확인해 주세요. (결제자:{' '}
            {nameOf(paidBy)})
          </p>
        )}
      </div>
    </Sheet>
  )
}

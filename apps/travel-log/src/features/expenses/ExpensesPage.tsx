import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { PageTitle } from '../../components/layout/AppShell'
import { Button, EmptyState, Skeleton } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi, Pin } from '../../components/ui/deco'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import { computeSettlement, transferKey } from '../../data/settlement'
import { AddExpenseSheet } from './AddExpenseSheet'
import type { Expense } from '../../data/types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

export function ExpensesPage() {
  const { user } = useAuth()
  const { activeTrip, members, expenses, settledKeys, loading } = useTrip()
  const toast = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [requesting, setRequesting] = useState(false)

  const memberIds = useMemo(() => members.map((m) => m.id), [members])
  const nameOf = (id: string) => members.find((m) => m.id === id)?.nickname ?? '나간 멤버'

  const settlement = useMemo(
    () => computeSettlement(expenses, memberIds),
    [expenses, memberIds],
  )
  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort(
        (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.createdAt - a.createdAt,
      ),
    [expenses],
  )

  const perHead =
    memberIds.length > 0 ? Math.round(settlement.totalSpent / memberIds.length) : 0

  function openAdd() {
    setEditing(null)
    setSheetOpen(true)
  }
  function openEdit(e: Expense) {
    setEditing(e)
    setSheetOpen(true)
  }
  async function del(e: Expense) {
    if (!confirm(`‘${e.title}’ 비용을 삭제할까요?`)) return
    await backend.deleteExpense(e.id)
    toast.show('비용을 삭제했어요.')
  }
  async function toggleSettled(key: string, next: boolean) {
    if (!activeTrip) return
    await backend.setTransferSettled(activeTrip.id, key, next)
  }
  async function sendSettlementRequest() {
    if (!activeTrip || !user) return
    setRequesting(true)
    try {
      await backend.requestSettlement(activeTrip.id, user.nickname)
      toast.show('정산 요청을 보냈어요. 멤버들에게 알림이 가요.')
    } catch {
      toast.show('요청을 보내지 못했어요. (settlement.request_failed)')
    } finally {
      setRequesting(false)
    }
  }

  if (loading || !activeTrip) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <PageTitle title="가계부" subtitle="쓴 돈을 담아두면 1/N로 정산해요" />
        <Button icon="add" onClick={openAdd} className="mb-2 hidden sm:inline-flex">
          비용 담기
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon="wallet"
          title="아직 담은 비용이 없어요."
          hint="누가 얼마 냈는지만 툭 적어두면, 나중에 한 번에 1/N로 계산해요."
          action={
            <Button icon="add" onClick={openAdd}>
              첫 비용 담기
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* ── 정산 요약 ─────────────────────────────── */}
          <section className="dl-card relative overflow-hidden p-5">
            <Washi color="yellow" className="left-8 -top-2" rotate={-3} />
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="dl-mono text-xs font-bold tracking-wider text-muted">함께 쓴 돈</p>
                <p className="dl-mono mt-1 font-display text-3xl font-extrabold text-ink">
                  {won(settlement.totalSpent)}
                </p>
              </div>
              <p className="dl-mono rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                1인당 약 {won(perHead)}
              </p>
            </div>

            {/* 이체 목록 */}
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-ink">이렇게 주고받으면 끝!</p>
              {settlement.transfers.length === 0 ? (
                <p className="rounded-2xl bg-surface-container px-4 py-4 text-center text-sm text-muted">
                  정산할 게 없어요. 이미 딱 맞아요. 👏
                </p>
              ) : (
                <ul className="space-y-2">
                  {settlement.transfers.map((t) => {
                    const key = transferKey(t)
                    const done = settledKeys.includes(key)
                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
                          done
                            ? 'border-transparent bg-surface-container'
                            : 'border-primary/30 bg-primary-soft/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${done ? 'text-muted line-through' : 'text-ink'}`}>
                            <b>{nameOf(t.from)}</b>
                            <Icon name="chevron_right" size={16} className="mx-0.5 align-text-bottom text-muted" />
                            <b>{nameOf(t.to)}</b>
                          </p>
                        </div>
                        <span
                          className={`dl-mono text-base font-bold ${done ? 'text-muted line-through' : 'text-primary'}`}
                        >
                          {won(t.amount)}
                        </span>
                        <button
                          className={`dl-focus flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                            done ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container text-muted'
                          }`}
                          onClick={() => toggleSettled(key, !done)}
                          aria-pressed={done}
                        >
                          <Icon name={done ? 'check' : 'circle'} size={16} />
                          {done ? '정산됨' : '정산 완료'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
              {settlement.transfers.length > 0 && (
                <button
                  className="dl-focus mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
                  onClick={sendSettlementRequest}
                  disabled={requesting}
                >
                  <Icon name="notifications" size={18} /> 정산 요청 보내기
                </button>
              )}
            </div>

            {/* 멤버별 잔액 */}
            <div className="mt-4 border-t border-surface-variant pt-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {settlement.perMember.map((m) => (
                  <span key={m.userId} className="dl-mono text-xs">
                    <span className="text-muted">{nameOf(m.userId)}</span>{' '}
                    <span
                      className={
                        m.net > 0 ? 'font-bold text-tertiary' : m.net < 0 ? 'font-bold text-primary' : 'text-muted'
                      }
                    >
                      {m.net > 0 ? `+${won(m.net)} 받을 돈` : m.net < 0 ? `${won(-m.net)} 낼 돈` : '정산 완료'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── 비용 리스트 ───────────────────────────── */}
          <section>
            <p className="dl-mono mb-2 text-sm text-muted">비용 {expenses.length}건</p>
            <ul className="space-y-2">
              {sortedExpenses.map((e) => (
                <li key={e.id} className="dl-card relative flex items-start gap-3 p-3">
                  <Pin className="-right-1 -top-2" color="#655689" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-base font-bold text-ink">{e.title}</h3>
                      {e.category && (
                        <span className="dl-mono shrink-0 rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold text-muted">
                          {e.category}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      <b className="text-ink/80">{nameOf(e.paidBy)}</b>님이 결제 · {e.participants.length}명 나눔
                      {e.date && ` · ${e.date.replace(/-/g, '.')}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="dl-mono font-bold text-ink">{won(e.amount)}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        className="dl-focus grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-container"
                        onClick={() => openEdit(e)}
                        aria-label="수정"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        className="dl-focus grid h-7 w-7 place-items-center rounded-full text-muted hover:text-error"
                        onClick={() => del(e)}
                        aria-label="삭제"
                      >
                        <Icon name="delete" size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <button
        className="dl-focus fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-glow-primary sm:hidden"
        onClick={openAdd}
        aria-label="비용 담기"
      >
        <Icon name="add" size={28} />
      </button>

      <AddExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} editing={editing} />
    </div>
  )
}

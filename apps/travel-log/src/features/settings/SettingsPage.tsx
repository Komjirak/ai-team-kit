import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'
import { Icon } from '../../components/ui/Icon'
import { Button } from '../../components/ui/basics'
import { Avatar } from '../../components/layout/Header'
import { Washi } from '../../components/ui/deco'
import { useToast } from '../../components/ui/Toast'
import { BRAND } from '../../components/layout/nav'
import { PushSettings } from './PushSettings'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { activeTrip, members, isOwner, setActiveTrip } = useTrip()
  const toast = useToast()
  const nav = useNavigate()

  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // keep the form in sync when the active trip resolves / changes
  useEffect(() => {
    setTitle(activeTrip?.title ?? '')
    setDestination(activeTrip?.destination ?? '')
    setStartDate(activeTrip?.startDate ?? '')
    setEndDate(activeTrip?.endDate ?? '')
  }, [activeTrip?.id, activeTrip?.title, activeTrip?.destination, activeTrip?.startDate, activeTrip?.endDate])

  if (!activeTrip) {
    return (
      <div className="py-16 text-center text-muted">
        여행을 먼저 선택해 주세요.
        <button className="ml-2 text-primary underline" onClick={() => setActiveTrip(null)}>
          여행 목록
        </button>
      </div>
    )
  }

  async function copyCode() {
    if (!activeTrip) return
    try {
      await navigator.clipboard.writeText(activeTrip.inviteCode)
      toast.show('초대코드를 복사했어요.')
    } catch {
      toast.show('코드를 길게 눌러 복사해 주세요.')
    }
  }
  function shareCode() {
    if (!activeTrip) return
    const text = `${BRAND} — ‘${activeTrip.title}’ 여행 초대코드: ${activeTrip.inviteCode}`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else copyCode()
  }

  const dateInvalid = !!startDate && !!endDate && endDate < startDate

  async function saveInfo() {
    if (!activeTrip || !title.trim() || dateInvalid) return
    setSaving(true)
    try {
      await backend.updateTrip(activeTrip.id, {
        title: title.trim(),
        destination: destination.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      toast.show('여행 정보를 저장했어요.')
    } catch {
      toast.show('저장하지 못했어요. (settings.save_failed)')
    } finally {
      setSaving(false)
    }
  }

  async function leave() {
    if (!activeTrip || !user) return
    const last = members.length <= 1
    const msg = last
      ? `‘${activeTrip.title}’의 마지막 멤버예요. 나가면 이 여행과 기록이 삭제돼요. 계속할까요?`
      : isOwner
        ? `‘${activeTrip.title}’에서 나갈까요? 방장 권한은 다른 멤버에게 넘어가요.`
        : `‘${activeTrip.title}’에서 나갈까요?`
    if (!confirm(msg)) return
    setLeaving(true)
    try {
      await backend.leaveTrip(activeTrip.id, user.id)
      toast.show('여행에서 나왔어요.')
      setActiveTrip(null)
      nav('/')
    } catch {
      toast.show('나가지 못했어요. (trip.leave_failed)')
      setLeaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="font-display text-2xl font-extrabold text-ink">여행 설정</h1>
        <button className="flex items-center gap-1 text-sm text-muted" onClick={() => nav('/')}>
          홈으로 <Icon name="home" size={18} />
        </button>
      </div>

      {/* Invite code */}
      <section className="dl-card relative p-5">
        <Washi color="yellow" className="left-6 -top-2" rotate={-3} />
        <p className="dl-mono text-xs font-bold tracking-wider text-muted">여행 초대코드</p>
        <p className="mt-1 text-sm text-muted">이 코드를 친구에게 보내면 여행에 합류할 수 있어요.</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="dl-mono select-all rounded-2xl bg-primary-soft px-5 py-3 text-2xl font-bold tracking-[0.2em] text-primary">
            {activeTrip.inviteCode}
          </span>
          <div className="flex gap-2">
            <Button variant="soft" icon="content_copy" onClick={copyCode}>
              복사
            </Button>
            <Button variant="ghost" icon="ios_share" onClick={shareCode}>
              공유
            </Button>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="dl-card p-5">
        <p className="dl-mono text-xs font-bold tracking-wider text-muted">멤버 {members.length}명</p>
        <ul className="mt-3 space-y-3">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar user={m} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold text-ink">
                  <span className="truncate">{m.nickname}</span>
                  {m.id === activeTrip.ownerId && (
                    <span className="dl-mono inline-flex items-center gap-0.5 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                      <Icon name="workspace_premium" size={12} /> 방장
                    </span>
                  )}
                  {m.id === user?.id && <span className="text-xs text-muted">(나)</span>}
                </p>
                {m.email && <p className="truncate text-sm text-muted">{m.email}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Push notifications (M4) */}
      <PushSettings />

      {/* Trip info */}
      <section className="dl-card p-5">
        <p className="dl-mono text-xs font-bold tracking-wider text-muted">여행 정보</p>
        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">여행 이름</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">목적지</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="예) 제주"
              className="w-full rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-muted">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-2xl bg-surface-container px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-muted">종료일</label>
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
          <Button onClick={saveInfo} loading={saving} disabled={!title.trim() || dateInvalid} icon="save">
            저장
          </Button>
        </div>
      </section>

      {/* My account */}
      <section className="dl-card p-5">
        <p className="dl-mono text-xs font-bold tracking-wider text-muted">내 계정</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar user={user} />
          <div>
            <p className="font-semibold text-ink">{user?.nickname}</p>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Leave / switch / logout */}
      <div className="space-y-2">
        <button
          className="dl-focus flex w-full items-center justify-center gap-2 rounded-full bg-surface-container py-3 text-sm font-semibold text-muted hover:bg-primary-soft"
          onClick={() => setActiveTrip(null)}
        >
          <Icon name="swap_horiz" size={18} /> 다른 여행 보기
        </button>
        <button
          className="dl-focus flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-error hover:bg-error-container/50"
          onClick={leave}
          disabled={leaving}
        >
          <Icon name="logout" size={18} /> 이 여행에서 나가기
        </button>
        <button
          className="dl-focus mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted hover:bg-surface-container"
          onClick={signOut}
        >
          <Icon name="account_circle" size={18} /> 계정 로그아웃
        </button>
      </div>
    </div>
  )
}

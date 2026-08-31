import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useCouple } from '../../couple/CoupleContext'
import { backend } from '../../data'
import { Icon } from '../../components/ui/Icon'
import { Button } from '../../components/ui/basics'
import { Avatar } from '../../components/layout/Header'
import { Washi } from '../../components/ui/deco'
import { useToast } from '../../components/ui/Toast'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { couple, partner, refreshCouple } = useCouple()
  const toast = useToast()
  const nav = useNavigate()

  const [date, setDate] = useState(couple?.startDate ?? '')
  const [saving, setSaving] = useState(false)

  async function copyCode() {
    if (!couple) return
    try {
      await navigator.clipboard.writeText(couple.inviteCode)
      toast.show('초대코드를 복사했어요.')
    } catch {
      toast.show('코드를 길게 눌러 복사해 주세요.')
    }
  }
  function shareCode() {
    if (!couple) return
    const text = `Datel.log 초대코드: ${couple.inviteCode}`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else copyCode()
  }
  async function saveDate() {
    if (!couple || !date) return
    setSaving(true)
    try {
      await backend.setStartDate(couple.id, date)
      await refreshCouple()
      toast.show('관계 시작일을 저장했어요.')
    } catch {
      setDate(couple.startDate ?? '')
      toast.show('저장하지 못했어요. (settings.save_failed)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="font-display text-2xl font-extrabold text-ink">설정</h1>
        <button className="flex items-center gap-1 text-sm text-muted" onClick={() => nav('/')}>
          홈으로 <Icon name="home" size={18} />
        </button>
      </div>

      {/* Invite code */}
      <section className="dl-card relative p-5">
        <Washi color="yellow" className="left-6 -top-2" rotate={-3} />
        <p className="dl-mono text-xs font-bold tracking-wider text-muted">우리 커플 초대코드</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="dl-mono select-all rounded-2xl bg-primary-soft px-5 py-3 text-2xl font-bold tracking-[0.2em] text-primary">
            {couple?.inviteCode ?? '------'}
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
        {!partner && (
          <p className="mt-3 text-sm text-muted">파트너가 아직 합류하지 않았어요. 위 초대코드를 공유해 보세요.</p>
        )}
      </section>

      {/* Start date */}
      <section className="dl-card p-5">
        <p className="dl-mono text-xs font-bold tracking-wider text-muted">관계 시작일</p>
        <p className="mt-1 text-sm text-muted">“함께한 지 N일째”의 기준이에요. 둘 중 누구나 수정할 수 있어요.</p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button onClick={saveDate} loading={saving} disabled={!date}>
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

      {/* Partner account */}
      <section className="dl-card p-5">
        <p className="dl-mono text-xs font-bold tracking-wider text-muted">파트너 계정</p>
        {partner ? (
          <div className="mt-3 flex items-center gap-3">
            <Avatar user={partner} />
            <div>
              <p className="font-semibold text-ink">{partner.nickname}</p>
              <p className="text-sm text-muted">{partner.email}</p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">아직 합류하지 않았어요.</p>
        )}
      </section>

      <button
        className="dl-focus mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted hover:bg-surface-container"
        onClick={signOut}
      >
        <Icon name="logout" size={18} /> 로그아웃
      </button>
    </div>
  )
}

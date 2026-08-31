import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { Button, Spinner } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi } from '../../components/ui/deco'
import { BRAND, SLOGAN } from '../../components/layout/nav'
import { CreateTripSheet } from './CreateTripSheet'
import type { Trip } from '../../data/types'

function fmtRange(t: Trip): string | null {
  if (!t.startDate) return null
  const s = t.startDate.replace(/-/g, '.')
  if (!t.endDate || t.endDate === t.startDate) return s
  return `${s} – ${t.endDate.replace(/-/g, '.')}`
}

/**
 * 여행 선택 · 온보딩 레이어.
 * 로그인 후 활성 여행이 없을 때 나온다:
 *   - 여행 0개 → 온보딩(만들기 / 코드 합류)
 *   - 여행 있음 → 목록에서 활성 여행 선택 + 만들기/합류
 */
export function TripPicker() {
  const { user, signOut } = useAuth()
  const { trips, tripsLoading, setActiveTrip } = useTrip()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'join'>('create')

  function openSheet(m: 'create' | 'join') {
    setMode(m)
    setSheetOpen(true)
  }

  const empty = trips.length === 0

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="luggage" fill className="text-primary-container" size={26} />
          <span className="font-display text-2xl font-extrabold text-primary">{BRAND}</span>
        </div>
        <button
          className="dl-focus flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface-container"
          onClick={signOut}
        >
          <Icon name="logout" size={16} /> 로그아웃
        </button>
      </div>

      {tripsLoading ? (
        <div className="grid flex-1 place-items-center">
          <Spinner size={26} className="text-primary" />
        </div>
      ) : empty ? (
        // ── 온보딩 (여행 0개) ──────────────────────────────────
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
              친구들과 떠날
              <br />
              <span className="wobbly-underline">첫 여행</span>을 만들어요
            </h1>
            <p className="mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-muted">
              {SLOGAN}. 여행을 만들고 초대코드로 친구를 부르면, 함께 담고 남길 수 있어요.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openSheet('create')}
              className="dl-focus relative block w-full rounded-[28px] border-2 border-primary/70 bg-surface px-6 py-7 text-center shadow-glow-primary transition-transform active:scale-[0.98]"
            >
              <Washi color="yellow" className="left-1/2 -top-2 -translate-x-1/2" rotate={-2} />
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
                <Icon name="add" size={26} />
              </span>
              <p className="font-display text-xl font-extrabold text-ink">새 여행 만들기</p>
              <p className="mt-1 text-sm text-muted">여행 이름·목적지·기간을 정해요</p>
            </button>
            <button
              onClick={() => openSheet('join')}
              className="dl-focus relative block w-full rounded-[28px] bg-primary-soft px-6 py-7 text-center transition-transform active:scale-[0.98]"
            >
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
                <Icon name="group_add" size={24} />
              </span>
              <p className="font-display text-xl font-extrabold text-ink">초대코드로 합류</p>
              <p className="mt-1 text-sm text-muted">친구 여행에 참여할게요</p>
            </button>
          </div>
        </div>
      ) : (
        // ── 여행 선택 (여행 있음) ──────────────────────────────
        <div className="flex flex-1 flex-col pt-8">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            어떤 여행을 볼까요, {user?.nickname ?? '친구'}님?
          </h1>
          <p className="mt-1 text-sm text-muted">내가 함께하는 여행 {trips.length}개</p>

          <ul className="mt-5 space-y-3">
            {trips.map((t, i) => {
              const range = fmtRange(t)
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveTrip(t.id)}
                    className="dl-card dl-focus relative block w-full p-4 text-left transition-transform active:scale-[0.98]"
                  >
                    <Washi
                      color={(['yellow', 'lavender', 'mint', 'blue'] as const)[i % 4]}
                      className="left-6 -top-2"
                      rotate={-3}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-lg font-bold text-ink">{t.title}</h3>
                        <p className="dl-mono mt-0.5 text-xs text-muted">
                          {[t.destination, range].filter(Boolean).join(' · ') || '기간 미정'}
                        </p>
                      </div>
                      <Icon name="chevron_right" className="shrink-0 text-muted" />
                    </div>
                    <p className="mt-3 flex items-center gap-1 text-xs text-muted">
                      <Icon name="group" size={16} /> 멤버 {t.memberIds.length}명
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button variant="soft" icon="add" className="flex-1" onClick={() => openSheet('create')}>
              새 여행 만들기
            </Button>
            <Button variant="ghost" icon="group_add" className="flex-1" onClick={() => openSheet('join')}>
              초대코드로 합류
            </Button>
          </div>
        </div>
      )}

      <CreateTripSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onDone={(id) => setActiveTrip(id)}
        initialMode={mode}
      />
    </div>
  )
}

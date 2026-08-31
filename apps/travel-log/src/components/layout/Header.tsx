import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Icon } from '../ui/Icon'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'
import { BRAND, TABS } from './nav'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const { user, signOut } = useAuth()
  const { activeTrip, trips, setActiveTrip } = useTrip()
  const nav = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-surface-variant/60 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Icon name="luggage" fill className="text-primary-container" size={26} />
          <span className="font-display text-2xl font-extrabold tracking-tight text-primary">{BRAND}</span>
        </Link>

        {/* active trip name + switch (여행 전환) */}
        {activeTrip && (
          <button
            className="dl-focus ml-1 hidden items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 text-sm font-semibold text-ink hover:bg-primary-soft sm:flex"
            onClick={() => setActiveTrip(null)}
            title="여행 전환"
          >
            <Icon name="luggage" size={16} className="text-primary" />
            <span className="max-w-[10rem] truncate">{activeTrip.title}</span>
            {trips.length > 1 && <Icon name="unfold_more" size={16} className="text-muted" />}
          </button>
        )}

        {/* desktop top-nav (chips) */}
        <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) => `dl-chip ${isActive ? 'dl-chip-on' : 'dl-chip-off'}`}
            >
              <Icon name={t.icon} size={18} />
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          <div className="relative">
            <button
              className="dl-focus flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-container"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <Avatar user={user} />
              <span className="hidden text-sm font-semibold text-ink sm:inline">
                {user?.nickname ?? '나'}
              </span>
              <Icon name="expand_more" size={18} className="text-muted" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="dl-card absolute right-0 z-20 mt-2 w-60 p-3 text-sm">
                  <p className="px-2 py-1 text-xs text-muted">내 계정</p>
                  <p className="px-2 font-semibold text-ink">{user?.nickname}</p>
                  <p className="px-2 pb-2 text-xs text-muted">{user?.email}</p>
                  <div className="my-2 border-t border-surface-variant" />
                  {activeTrip && (
                    <>
                      <p className="px-2 text-xs text-muted">현재 여행</p>
                      <p className="px-2 pb-2 font-medium text-ink">{activeTrip.title}</p>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-surface-container"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon name="luggage" size={18} /> 여행 기록
                      </Link>
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-surface-container"
                        onClick={() => {
                          setMenuOpen(false)
                          setActiveTrip(null)
                        }}
                      >
                        <Icon name="swap_horiz" size={18} /> 여행 전환 · 새 여행
                      </button>
                    </>
                  )}
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-surface-container"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon name="settings" size={18} /> 설정 · 초대코드
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-muted hover:bg-surface-container"
                    onClick={async () => {
                      setMenuOpen(false)
                      if (activeTrip) await backend.markNotificationsRead(activeTrip.id).catch(() => {})
                      await signOut()
                      nav('/')
                    }}
                  >
                    <Icon name="logout" size={18} /> 로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export function Avatar({ user }: { user: { nickname?: string; photoURL?: string } | null }) {
  if (user?.photoURL) {
    return <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
  }
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-container font-display text-sm font-bold text-on-primary">
      {(user?.nickname ?? '나').slice(0, 1)}
    </span>
  )
}

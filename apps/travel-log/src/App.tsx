import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { TripProvider, useTrip } from './trip/TripContext'
import { CreateTripSheet } from './features/trips/CreateTripSheet'
import { AppShell } from './components/layout/AppShell'
import { Spinner } from './components/ui/basics'
import { Icon } from './components/ui/Icon'
import { Welcome } from './features/onboarding/Welcome'
import { TripPicker } from './features/trips/TripPicker'
import { HomePage } from './features/home/HomePage'
import { SchedulePage } from './features/schedule/SchedulePage'
import { WishlistPage } from './features/wishlist/WishlistPage'
import { ExpensesPage } from './features/expenses/ExpensesPage'
import { MemoriesPage } from './features/memories/MemoriesPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { BRAND } from './components/layout/nav'

function Splash({ label }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-3 text-primary">
        <Icon name="luggage" fill size={40} className="animate-float-slow text-primary-container" />
        <span className="font-display text-xl font-extrabold">{BRAND}</span>
        <Spinner size={22} />
        {label && <span className="text-sm text-muted">{label}</span>}
      </div>
    </div>
  )
}

/**
 * 초대 딥링크(?join=CODE) 처리 — 로그인 후 어디에 있든 코드가 채워진 합류 창을 띄운다.
 * 활성 여행 유무와 상관없이 동작하고, 처리 후 URL에서 join 파라미터를 지운다.
 */
function JoinIntent() {
  const [params, setParams] = useSearchParams()
  const { setActiveTrip } = useTrip()
  const code = (params.get('join') ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (code.length >= 4) setOpen(true)
  }, [code])

  if (!code) return null

  function clear() {
    setOpen(false)
    const next = new URLSearchParams(params)
    next.delete('join')
    setParams(next, { replace: true })
  }

  return (
    <CreateTripSheet
      open={open}
      onClose={clear}
      onDone={(id) => {
        setActiveTrip(id)
        clear()
      }}
      initialMode="join"
      initialCode={code}
    />
  )
}

/** Routes available once signed in AND an active trip is chosen. */
function TripRoutes() {
  const { tripsLoading, activeTrip } = useTrip()
  if (tripsLoading) return <Splash label="여행을 불러오는 중" />

  return (
    <>
      <JoinIntent />
      {!activeTrip ? (
        <TripPicker />
      ) : (
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      )}
    </>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />
  if (!user) return <Welcome />

  return (
    <BrowserRouter>
      <TripProvider>
        <TripRoutes />
      </TripProvider>
    </BrowserRouter>
  )
}

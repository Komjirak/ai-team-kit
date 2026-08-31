import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { TripProvider, useTrip } from './trip/TripContext'
import { AppShell } from './components/layout/AppShell'
import { Spinner } from './components/ui/basics'
import { Icon } from './components/ui/Icon'
import { Welcome } from './features/onboarding/Welcome'
import { TripPicker } from './features/trips/TripPicker'
import { HomePage } from './features/home/HomePage'
import { SchedulePage } from './features/schedule/SchedulePage'
import { WishlistPage } from './features/wishlist/WishlistPage'
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

/** Routes available once signed in AND an active trip is chosen. */
function TripRoutes() {
  const { tripsLoading, activeTrip } = useTrip()
  if (tripsLoading) return <Splash label="여행을 불러오는 중" />
  if (!activeTrip) return <TripPicker />

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
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

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { CoupleProvider, useCouple } from './couple/CoupleContext'
import { AppShell } from './components/layout/AppShell'
import { Spinner } from './components/ui/basics'
import { Icon } from './components/ui/Icon'
import { Welcome } from './features/onboarding/Welcome'
import { Pairing } from './features/onboarding/Pairing'
import { HomePage } from './features/home/HomePage'
import { WishlistPage } from './features/wishlist/WishlistPage'
import { CoursesPage } from './features/courses/CoursesPage'
import { CourseDetail } from './features/courses/CourseDetail'
import { MemoriesPage } from './features/memories/MemoriesPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { BRAND } from './components/layout/nav'

function Splash({ label }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-3 text-primary">
        <Icon name="favorite" fill size={40} className="animate-float-slow text-primary-container" />
        <span className="font-display text-xl font-extrabold">{BRAND}</span>
        <Spinner size={22} />
        {label && <span className="text-sm text-muted">{label}</span>}
      </div>
    </div>
  )
}

/** Routes available once the user is signed in AND paired. */
function PairedRoutes() {
  const { couple, loading } = useCouple()
  if (loading) return <Splash label="우리의 기록을 불러오는 중" />
  if (!couple) return <Pairing />

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:id" element={<CourseDetail />} />
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
      <CoupleProvider>
        <PairedRoutes />
      </CoupleProvider>
    </BrowserRouter>
  )
}

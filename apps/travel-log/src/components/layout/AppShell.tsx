import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { InstallPrompt } from './InstallPrompt'

/** Page chrome shared by all authenticated, paired screens. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 lg:pb-12">{children}</main>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}

/** Standard page header: masking-tape title + subtitle. */
export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative mb-5 pt-4">
      <span className="washi left-2 -top-1" style={{ transform: 'rotate(-4deg)' }} aria-hidden />
      <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  )
}

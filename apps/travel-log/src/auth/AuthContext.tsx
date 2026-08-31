import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { backend } from '../data'
import type { AppUser } from '../data/types'

interface AuthState {
  user: AppUser | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  /** re-read the signed-in user (e.g. after pairing sets a coupleId). */
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = backend.auth.onUser((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signIn: () => backend.auth.signInWithGoogle(),
      signOut: () => backend.auth.signOut(),
      refreshUser: async () => setUser(await backend.auth.reload()),
    }),
    [user, loading],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import { backend } from '../data'
import { computeStats } from '../data/stats'
import type {
  AppNotification,
  AppUser,
  Couple,
  Course,
  Memory,
  Place,
  Stats,
} from '../data/types'

interface CoupleState {
  couple: Couple | null
  members: AppUser[]
  partner: AppUser | null
  places: Place[]
  courses: Course[]
  memories: Memory[]
  notifications: AppNotification[]
  unreadCount: number
  stats: Stats
  loading: boolean
  refreshCouple: () => Promise<void>
}

const Ctx = createContext<CoupleState | null>(null)

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [couple, setCouple] = useState<Couple | null>(null)
  const [members, setMembers] = useState<AppUser[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const coupleId = user?.coupleId

  async function loadCouple() {
    if (!coupleId) {
      setCouple(null)
      setMembers([])
      return
    }
    const [c, m] = await Promise.all([
      backend.getCouple(coupleId),
      backend.getCoupleMembers(coupleId),
    ])
    setCouple(c)
    setMembers(m)
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      await loadCouple()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId])

  useEffect(() => {
    if (!coupleId) {
      setPlaces([])
      setCourses([])
      setMemories([])
      setNotifications([])
      return
    }
    const unsubs = [
      backend.watchPlaces(coupleId, setPlaces),
      backend.watchCourses(coupleId, setCourses),
      backend.watchMemories(coupleId, setMemories),
      backend.watchNotifications(coupleId, setNotifications),
    ]
    return () => unsubs.forEach((u) => u())
  }, [coupleId])

  const partner = useMemo(
    () => members.find((m) => m.id !== user?.id) ?? null,
    [members, user?.id],
  )
  const stats = useMemo(
    () => computeStats(couple, members, places, memories),
    [couple, members, places, memories],
  )
  const unreadCount = notifications.filter((n) => !n.readAt).length

  const value: CoupleState = {
    couple,
    members,
    partner,
    places,
    courses,
    memories,
    notifications,
    unreadCount,
    stats,
    loading,
    refreshCouple: loadCouple,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCouple() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCouple must be used within CoupleProvider')
  return v
}

import {
  createContext,
  useCallback,
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
  Memory,
  Place,
  Stats,
  Trip,
} from '../data/types'

interface TripState {
  // 여행 목록 (내가 멤버인)
  trips: Trip[]
  tripsLoading: boolean
  // 활성 여행 (앱이 스코프로 삼는 여행)
  activeTrip: Trip | null
  activeTripId: string | null
  setActiveTrip: (id: string | null) => void
  isOwner: boolean
  // 활성 여행 스코프 데이터
  members: AppUser[]
  places: Place[]
  memories: Memory[]
  notifications: AppNotification[]
  unreadCount: number
  stats: Stats
  loading: boolean
  refreshTrip: () => Promise<void>
}

const Ctx = createContext<TripState | null>(null)

const activeKey = (userId: string) => `ganjik:activeTrip:${userId}`

function readActive(userId: string): string | null {
  try {
    return localStorage.getItem(activeKey(userId))
  } catch {
    return null
  }
}
function writeActive(userId: string, tripId: string | null) {
  try {
    if (tripId) localStorage.setItem(activeKey(userId), tripId)
    else localStorage.removeItem(activeKey(userId))
  } catch {
    /* private mode — active trip lives in-session only */
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id

  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [activeTripId, setActiveTripId] = useState<string | null>(null)

  const [members, setMembers] = useState<AppUser[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)

  // ── watch my trips, restore the saved active trip ────────────
  useEffect(() => {
    if (!userId) {
      setTrips([])
      setActiveTripId(null)
      setTripsLoading(false)
      return
    }
    setTripsLoading(true)
    setActiveTripId(readActive(userId))
    const unsub = backend.watchTrips(userId, (list) => {
      setTrips(list)
      setTripsLoading(false)
      // 저장된 활성 여행이 더 이상 내 여행이 아니면 해제(선택 화면으로)
      setActiveTripId((cur) => (cur && list.some((t) => t.id === cur) ? cur : null))
    })
    return unsub
  }, [userId])

  const setActiveTrip = useCallback(
    (id: string | null) => {
      if (userId) writeActive(userId, id)
      setActiveTripId(id)
    },
    [userId],
  )

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? null,
    [trips, activeTripId],
  )

  // ── active-trip members ──────────────────────────────────────
  const loadMembers = useCallback(async () => {
    if (!activeTripId) {
      setMembers([])
      return
    }
    setMembers(await backend.getTripMembers(activeTripId))
  }, [activeTripId])

  useEffect(() => {
    let cancelled = false
    if (!activeTripId) {
      setMembers([])
      setLoading(false)
      return
    }
    setLoading(true)
    ;(async () => {
      await loadMembers()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [activeTripId, loadMembers])

  // ── active-trip scoped subscriptions ─────────────────────────
  useEffect(() => {
    if (!activeTripId) {
      setPlaces([])
      setMemories([])
      setNotifications([])
      return
    }
    const unsubs = [
      backend.watchPlaces(activeTripId, setPlaces),
      backend.watchMemories(activeTripId, setMemories),
      backend.watchNotifications(activeTripId, setNotifications),
    ]
    return () => unsubs.forEach((u) => u())
  }, [activeTripId])

  const stats = useMemo(
    () => computeStats(activeTrip, members, places, memories),
    [activeTrip, members, places, memories],
  )
  const unreadCount = notifications.filter((n) => !n.readAt).length
  const isOwner = !!activeTrip && !!userId && activeTrip.ownerId === userId

  const value: TripState = {
    trips,
    tripsLoading,
    activeTrip,
    activeTripId,
    setActiveTrip,
    isOwner,
    members,
    places,
    memories,
    notifications,
    unreadCount,
    stats,
    loading,
    refreshTrip: loadMembers,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTrip() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTrip must be used within TripProvider')
  return v
}

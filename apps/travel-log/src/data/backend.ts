import type {
  AppNotification,
  AppUser,
  Memory,
  Place,
  ScheduleItem,
  Trip,
} from './types'

// The backend contract. Two implementations satisfy it:
//   - localBackend  (demo: localStorage + mock google login)
//   - firebaseBackend (real: Firebase Auth + Firestore + Storage)
// Everything above the data layer talks only to this interface, so flipping
// from demo to production is a config change, not a rewrite.

export interface AuthApi {
  /** subscribe to auth state; returns unsubscribe. */
  onUser(cb: (user: AppUser | null) => void): () => void
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  /** re-read the current user. */
  reload(): Promise<AppUser | null>
}

export interface CreateTripInput {
  title: string
  destination?: string
  startDate?: string
  endDate?: string
}

export interface Backend {
  auth: AuthApi

  // Trips / membership (PRD §5, §6) — N인, 권한은 Trip.ownerId/memberIds로 표현
  /** 내가 멤버인 여행 목록(실시간). */
  watchTrips(userId: string, cb: (trips: Trip[]) => void): () => void
  getTrip(tripId: string): Promise<Trip | null>
  createTrip(user: AppUser, input: CreateTripInput): Promise<Trip>
  /** 초대코드로 합류(N인). 이미 멤버면 그대로 반환(무시). */
  joinTrip(user: AppUser, inviteCode: string): Promise<Trip>
  /** 여행 나가기. owner가 나가면 이양, 마지막 멤버면 삭제. */
  leaveTrip(tripId: string, userId: string): Promise<void>
  updateTrip(tripId: string, patch: Partial<Trip>): Promise<void>
  getTripMembers(tripId: string): Promise<AppUser[]>

  // Places
  watchPlaces(tripId: string, cb: (places: Place[]) => void): () => void
  addPlace(input: Omit<Place, 'id' | 'createdAt'>): Promise<Place>
  updatePlace(id: string, patch: Partial<Place>): Promise<void>
  deletePlace(id: string): Promise<void>

  // Schedule (M2) — 인앱 정본. orderBy 없이 클라 정렬(색인 이슈 회피).
  watchSchedule(tripId: string, cb: (items: ScheduleItem[]) => void): () => void
  addScheduleItem(input: Omit<ScheduleItem, 'id' | 'createdAt'>): Promise<ScheduleItem>
  updateScheduleItem(id: string, patch: Partial<ScheduleItem>): Promise<void>
  deleteScheduleItem(id: string): Promise<void>

  // Memories + photos
  watchMemories(tripId: string, cb: (memories: Memory[]) => void): () => void
  addMemory(input: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory>
  deleteMemory(id: string): Promise<void>
  uploadPhoto(tripId: string, file: File): Promise<string>

  // Notifications
  watchNotifications(tripId: string, cb: (n: AppNotification[]) => void): () => void
  markNotificationsRead(tripId: string): Promise<void>
}

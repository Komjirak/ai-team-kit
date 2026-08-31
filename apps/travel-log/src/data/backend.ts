import type {
  AppNotification,
  AppUser,
  Couple,
  Course,
  Memory,
  Place,
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
  /** re-read the current user (e.g. to pick up a freshly set coupleId). */
  reload(): Promise<AppUser | null>
}

export interface Backend {
  auth: AuthApi

  // Couple / pairing (I1, I9)
  getCouple(coupleId: string): Promise<Couple | null>
  getCoupleByMember(userId: string): Promise<Couple | null>
  createCouple(user: AppUser): Promise<Couple>
  joinCouple(user: AppUser, inviteCode: string): Promise<Couple>
  setStartDate(coupleId: string, startDate: string): Promise<void>
  setCoverPhoto(coupleId: string, url: string): Promise<void>
  getCoupleMembers(coupleId: string): Promise<AppUser[]>

  // Places (I2, I3)
  watchPlaces(coupleId: string, cb: (places: Place[]) => void): () => void
  addPlace(input: Omit<Place, 'id' | 'createdAt'>): Promise<Place>
  updatePlace(id: string, patch: Partial<Place>): Promise<void>
  deletePlace(id: string): Promise<void>

  // Courses (I5)
  watchCourses(coupleId: string, cb: (courses: Course[]) => void): () => void
  addCourse(input: Omit<Course, 'id' | 'createdAt'>): Promise<Course>
  updateCourse(id: string, patch: Partial<Course>): Promise<void>
  deleteCourse(id: string): Promise<void>

  // Memories + photos (I8)
  watchMemories(coupleId: string, cb: (memories: Memory[]) => void): () => void
  addMemory(input: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory>
  deleteMemory(id: string): Promise<void>
  uploadPhoto(coupleId: string, file: File): Promise<string>

  // Notifications (I10)
  watchNotifications(coupleId: string, cb: (n: AppNotification[]) => void): () => void
  markNotificationsRead(coupleId: string): Promise<void>
}

import type { Backend, AuthApi } from './backend'
import type {
  AppNotification,
  AppUser,
  Couple,
  Course,
  Memory,
  Place,
} from './types'

// ─────────────────────────────────────────────────────────────
// Local demo backend — runs the whole app with no secrets.
// Data lives in localStorage; "Google login" is a friendly mock.
// Real-time watchers are simulated with an in-memory event bus.
// ─────────────────────────────────────────────────────────────

const K = {
  user: 'datel:user',
  couples: 'datel:couples',
  users: 'datel:users',
  places: 'datel:places',
  courses: 'datel:courses',
  memories: 'datel:memories',
  notifs: 'datel:notifications',
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
const inviteCode = () =>
  Array.from({ length: 6 }, () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 32)]).join('')

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / quota — demo degrades to in-session only */
  }
  bus.emit(key)
}

// tiny event bus so watchers re-read on change
const bus = (() => {
  const map = new Map<string, Set<() => void>>()
  return {
    on(key: string, fn: () => void) {
      const set = map.get(key) ?? new Set()
      set.add(fn)
      map.set(key, set)
      return () => set.delete(fn)
    },
    emit(key: string) {
      map.get(key)?.forEach((fn) => fn())
    },
  }
})()

// ── Seed a believable demo couple on first run ────────────────
function seed() {
  if (read<AppUser | null>(K.user, null)) return

  const me: AppUser = {
    id: 'demo-eunae',
    nickname: '은애',
    email: 'sogsagim@gmail.com',
    photoURL: '',
    coupleId: 'demo-couple',
  }
  const couple: Couple = {
    id: 'demo-couple',
    inviteCode: '5WG97J',
    startDate: '2021-10-14',
    memberIds: ['demo-eunae'],
  }
  const now = Date.now()
  const day = 86_400_000
  const places: Place[] = [
    {
      id: 'p1', coupleId: couple.id, name: '햇살 가득한 카페', address: '서울 성동구 서울숲2길 18-14',
      category: '카페', status: 'wishlist', createdBy: me.id, createdAt: now - 3 * day,
      lat: 37.5445, lng: 127.0445, memo: '창가 자리에서 여유롭게 커피 마시기',
      thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=640&q=70',
    },
    {
      id: 'p2', coupleId: couple.id, name: '비밀의 숲 산책로', address: '서울 성동구 뚝섬로 273',
      category: '자연', status: 'wishlist', createdBy: me.id, createdAt: now - 2 * day,
      lat: 37.5443, lng: 127.0378, memo: '자연 속에서 힐링 데이트',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=70',
    },
    {
      id: 'p3', coupleId: couple.id, name: '카멜커피 성수', address: '서울 성동구 성수이로7가길 9',
      category: '카페', status: 'visited', createdBy: me.id, createdAt: now - 10 * day, visitedAt: now - 6 * day,
      lat: 37.5447, lng: 127.0559, memo: '시그니처 카멜커피와 앙버터로 당 충전',
      thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&q=70',
    },
  ]
  const courses: Course[] = [
    {
      id: 'c1', coupleId: couple.id, title: '성수동 골목길 투어', memo: '여유로운 주말, 골목 구석구석을 누비며 찾는 소소한 행복들.',
      placeIds: ['p3', 'p1', 'p2'], createdBy: me.id, createdAt: now - 5 * day,
    },
  ]
  const memories: Memory[] = [
    {
      id: 'm1', coupleId: couple.id, placeId: 'p3', placeName: '카멜커피 성수',
      text: '빈티지한 인테리어가 사진 찍기 좋았던 곳. 앙버터가 진짜 맛있었다.',
      photoUrls: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=640&q=70'],
      visitedAt: '2026-08-25', createdBy: me.id, createdAt: now - 6 * day,
    },
  ]

  write(K.user, me)
  write(K.users, [me])
  write(K.couples, [couple])
  write(K.places, places)
  write(K.courses, courses)
  write(K.memories, memories)
  write(K.notifs, [] as AppNotification[])
}

// ── Auth (mock Google) ────────────────────────────────────────
const authListeners = new Set<(u: AppUser | null) => void>()
function emitUser() {
  const u = read<AppUser | null>(K.user, null)
  authListeners.forEach((cb) => cb(u))
}

const auth: AuthApi = {
  onUser(cb) {
    authListeners.add(cb)
    queueMicrotask(() => cb(read<AppUser | null>(K.user, null)))
    return () => authListeners.delete(cb)
  },
  async signInWithGoogle() {
    seed()
    let user = read<AppUser | null>(K.user, null)
    if (!user) {
      user = { id: uid(), nickname: '나', email: 'me@datel.log', coupleId: undefined }
      write(K.user, user)
      write(K.users, [...read<AppUser[]>(K.users, []), user])
    }
    emitUser()
  },
  async signOut() {
    write(K.user, null)
    emitUser()
  },
  async reload() {
    return read<AppUser | null>(K.user, null)
  },
}

// ── helpers ───────────────────────────────────────────────────
function upsertUser(u: AppUser) {
  const users = read<AppUser[]>(K.users, [])
  const i = users.findIndex((x) => x.id === u.id)
  if (i >= 0) users[i] = u
  else users.push(u)
  write(K.users, users)
}
function pushNotif(n: Omit<AppNotification, 'id' | 'createdAt'>) {
  const list = read<AppNotification[]>(K.notifs, [])
  list.unshift({ ...n, id: uid(), createdAt: Date.now() })
  write(K.notifs, list.slice(0, 50))
}

export const localBackend: Backend = {
  auth,

  async getCouple(id) {
    return read<Couple[]>(K.couples, []).find((c) => c.id === id) ?? null
  },
  async getCoupleByMember(userId) {
    return read<Couple[]>(K.couples, []).find((c) => c.memberIds.includes(userId)) ?? null
  },
  async createCouple(user) {
    const couple: Couple = { id: uid(), inviteCode: inviteCode(), memberIds: [user.id] }
    write(K.couples, [...read<Couple[]>(K.couples, []), couple])
    const u = { ...user, coupleId: couple.id }
    write(K.user, u)
    upsertUser(u)
    emitUser()
    return couple
  },
  async joinCouple(user, code) {
    const couples = read<Couple[]>(K.couples, [])
    const couple = couples.find((c) => c.inviteCode.toUpperCase() === code.trim().toUpperCase())
    if (!couple) throw new Error('invite.invalid')
    if (user.coupleId && user.coupleId !== couple.id) throw new Error('couple.already_bound')
    if (couple.memberIds.length >= 2 && !couple.memberIds.includes(user.id))
      throw new Error('couple.full')
    if (!couple.memberIds.includes(user.id)) couple.memberIds.push(user.id)
    write(K.couples, couples)
    const u = { ...user, coupleId: couple.id }
    write(K.user, u)
    upsertUser(u)
    pushNotif({ coupleId: couple.id, type: 'partner_joined', message: `${u.nickname}님이 합류했어요.` })
    emitUser()
    return couple
  },
  async setStartDate(coupleId, startDate) {
    const couples = read<Couple[]>(K.couples, [])
    const c = couples.find((x) => x.id === coupleId)
    if (!c) throw new Error('couple.not_found')
    c.startDate = startDate
    write(K.couples, couples)
  },
  async getCoupleMembers(coupleId) {
    const couple = await this.getCouple(coupleId)
    if (!couple) return []
    const users = read<AppUser[]>(K.users, [])
    return couple.memberIds.map(
      (id) => users.find((u) => u.id === id) ?? { id, nickname: '파트너', email: '' },
    )
  },

  watchPlaces(coupleId, cb) {
    const run = () => cb(read<Place[]>(K.places, []).filter((p) => p.coupleId === coupleId))
    run()
    return bus.on(K.places, run)
  },
  async addPlace(input) {
    const place: Place = { ...input, id: uid(), createdAt: Date.now() }
    write(K.places, [...read<Place[]>(K.places, []), place])
    pushNotif({ coupleId: place.coupleId, type: 'place_added', message: `‘${place.name}’을(를) 담았어요.` })
    return place
  },
  async updatePlace(id, patch) {
    const list = read<Place[]>(K.places, [])
    const i = list.findIndex((p) => p.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], ...patch }
      write(K.places, list)
    }
  },
  async deletePlace(id) {
    write(K.places, read<Place[]>(K.places, []).filter((p) => p.id !== id))
  },

  watchCourses(coupleId, cb) {
    const run = () => cb(read<Course[]>(K.courses, []).filter((c) => c.coupleId === coupleId))
    run()
    return bus.on(K.courses, run)
  },
  async addCourse(input) {
    const course: Course = { ...input, id: uid(), createdAt: Date.now() }
    write(K.courses, [...read<Course[]>(K.courses, []), course])
    pushNotif({ coupleId: course.coupleId, type: 'course_added', message: `코스 ‘${course.title}’을(를) 만들었어요.` })
    return course
  },
  async updateCourse(id, patch) {
    const list = read<Course[]>(K.courses, [])
    const i = list.findIndex((c) => c.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], ...patch }
      write(K.courses, list)
    }
  },
  async deleteCourse(id) {
    write(K.courses, read<Course[]>(K.courses, []).filter((c) => c.id !== id))
  },

  watchMemories(coupleId, cb) {
    const run = () => cb(read<Memory[]>(K.memories, []).filter((m) => m.coupleId === coupleId))
    run()
    return bus.on(K.memories, run)
  },
  async addMemory(input) {
    const memory: Memory = { ...input, id: uid(), createdAt: Date.now() }
    write(K.memories, [...read<Memory[]>(K.memories, []), memory])
    pushNotif({ coupleId: memory.coupleId, type: 'memory_added', message: `‘${memory.placeName}’에 추억을 남겼어요.` })
    return memory
  },
  async deleteMemory(id) {
    write(K.memories, read<Memory[]>(K.memories, []).filter((m) => m.id !== id))
  },
  async uploadPhoto(_coupleId, file) {
    // demo: keep the image as a data URL so it survives reloads locally
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('photo.upload_failed'))
      reader.readAsDataURL(file)
    })
  },

  watchNotifications(coupleId, cb) {
    const run = () => cb(read<AppNotification[]>(K.notifs, []).filter((n) => n.coupleId === coupleId))
    run()
    return bus.on(K.notifs, run)
  },
  async markNotificationsRead(coupleId) {
    const list = read<AppNotification[]>(K.notifs, [])
    let touched = false
    for (const n of list)
      if (n.coupleId === coupleId && !n.readAt) {
        n.readAt = Date.now()
        touched = true
      }
    if (touched) write(K.notifs, list)
  },
}

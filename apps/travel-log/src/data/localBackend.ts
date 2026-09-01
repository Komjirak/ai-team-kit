import type { Backend, AuthApi } from './backend'
import type {
  AppNotification,
  AppUser,
  Expense,
  Memory,
  Place,
  ScheduleItem,
  SettlementState,
  Trip,
} from './types'

// ─────────────────────────────────────────────────────────────
// Local demo backend — runs the whole app with no secrets.
// Data lives in localStorage; "Google login" is a friendly mock.
// Real-time watchers are simulated with an in-memory event bus.
// ─────────────────────────────────────────────────────────────

const K = {
  user: 'ganjik:user',
  trips: 'ganjik:trips',
  users: 'ganjik:users',
  places: 'ganjik:places',
  schedule: 'ganjik:schedule',
  expenses: 'ganjik:expenses',
  settlements: 'ganjik:settlements',
  memories: 'ganjik:memories',
  notifs: 'ganjik:notifications',
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

// ── Seed a believable demo trip (4 friends) on first run ──────
function seed() {
  if (read<AppUser | null>(K.user, null)) return

  const me: AppUser = { id: 'demo-eunae', nickname: '은애', email: 'sogsagim@gmail.com', photoURL: '' }
  const jihoon: AppUser = { id: 'demo-jihoon', nickname: '지훈', email: 'jihoon@ganjik.log' }
  const minji: AppUser = { id: 'demo-minji', nickname: '민지', email: 'minji@ganjik.log' }
  const suah: AppUser = { id: 'demo-suah', nickname: '수아', email: 'suah@ganjik.log' }

  const trip: Trip = {
    id: 'demo-trip',
    inviteCode: '5WG97J',
    title: '제주 우정여행 3박4일',
    destination: '제주',
    startDate: '2026-09-18',
    endDate: '2026-09-21',
    ownerId: me.id,
    memberIds: [me.id, jihoon.id, minji.id, suah.id], // 4인 합류 완료 상태로 시드
    createdAt: Date.now() - 7 * 86_400_000,
  }

  const now = Date.now()
  const day = 86_400_000
  const places: Place[] = [
    {
      id: 'p1', tripId: trip.id, name: '카페 델문도', address: '제주 제주시 조천읍 조함해안로 519-10',
      category: '카페', status: 'wishlist', createdBy: jihoon.id, createdAt: now - 3 * day,
      lat: 33.5399, lng: 126.6699, memo: '바다 보이는 창가에서 아침 커피',
      thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=640&q=70',
    },
    {
      id: 'p2', tripId: trip.id, name: '한라산 성판악 코스', address: '제주 제주시 조천읍 516로 1865',
      category: '자연', status: 'wishlist', createdBy: minji.id, createdAt: now - 2 * day,
      lat: 33.3856, lng: 126.6194, memo: '아침 일찍 출발, 김밥 챙기기',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=70',
    },
    {
      id: 'p3', tripId: trip.id, name: '흑돼지 맛집 돈사돈', address: '제주 제주시 우평로 19',
      category: '맛집', status: 'visited', createdBy: me.id, createdAt: now - 10 * day, visitedAt: now - 6 * day,
      lat: 33.4835, lng: 126.4783, memo: '첫날 저녁 회식! 근고기 강추',
      thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&q=70',
    },
  ]
  const memories: Memory[] = [
    {
      id: 'm1', tripId: trip.id, placeId: 'p3', placeName: '흑돼지 맛집 돈사돈',
      text: '넷이 둘러앉아 근고기 구워 먹은 첫날 저녁. 여행의 시작을 제대로 알린 곳.',
      photoUrls: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=640&q=70'],
      visitedAt: '2026-09-18', createdBy: me.id, createdAt: now - 6 * day,
    },
    {
      id: 'm2', tripId: trip.id, placeId: 'p2', placeName: '한라산 성판악 코스',
      text: '정상까지 5시간… 다리는 후들거렸지만 백록담 보고 다 같이 소리 질렀다. 이 맛에 등산하나 봐.',
      photoUrls: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=70',
        'https://images.unsplash.com/photo-1454372182658-c712e4c5a1db?w=640&q=70',
      ],
      visitedAt: '2026-09-19', createdBy: minji.id, createdAt: now - 5 * day,
    },
    {
      id: 'm3', tripId: trip.id, placeId: 'p1', placeName: '카페 델문도',
      text: '바다 보면서 마신 아침 커피. 지훈이가 여기 오려고 여행 짰다고 실토함 ㅋㅋ',
      photoUrls: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=640&q=70'],
      visitedAt: '2026-09-19', createdBy: jihoon.id, createdAt: now - 5 * day,
    },
  ]
  // 3일치 일정 (장소 연결 포함) — 바로 보이도록 시드
  const schedule: ScheduleItem[] = [
    {
      id: 's0', tripId: trip.id, date: '2026-09-18', order: 0, time: '13:20', title: 'KE1275 · ICN→CJU',
      flight: {
        number: 'KE1275', carrier: 'KE', source: 'manual',
        dep: { iata: 'ICN', airport: '인천국제공항', city: '서울', at: '2026-09-18T13:20:00', terminal: '2', lat: 37.4602, lng: 126.4407 },
        arr: { iata: 'CJU', airport: '제주국제공항', city: '제주', at: '2026-09-18T14:35:00', lat: 33.5113, lng: 126.493 },
      },
      createdBy: me.id, createdAt: now - 6 * day,
    },
    { id: 's1', tripId: trip.id, date: '2026-09-18', order: 1, time: '15:00', title: '제주공항 도착 · 렌터카 픽업', createdBy: me.id, createdAt: now - 6 * day },
    { id: 's2', tripId: trip.id, date: '2026-09-18', order: 2, time: '19:00', title: '첫날 저녁 회식', placeId: 'p3', memo: '근고기 예약 완료', createdBy: me.id, createdAt: now - 6 * day },
    { id: 's3', tripId: trip.id, date: '2026-09-19', order: 0, time: '09:00', title: '바다 보며 모닝커피', placeId: 'p1', createdBy: jihoon.id, createdAt: now - 5 * day },
    { id: 's4', tripId: trip.id, date: '2026-09-19', order: 1, time: '13:00', title: '한라산 등반', placeId: 'p2', memo: '김밥·물 챙기기, 일찍 하산', createdBy: minji.id, createdAt: now - 5 * day },
    { id: 's5', tripId: trip.id, date: '2026-09-20', order: 0, title: '자유시간 · 각자 카페 투어', createdBy: suah.id, createdAt: now - 4 * day },
    {
      id: 's6', tripId: trip.id, date: '2026-09-20', order: 1, time: '18:40', title: 'OZ8952 · CJU→GMP',
      flight: {
        number: 'OZ8952', carrier: 'OZ', source: 'manual',
        dep: { iata: 'CJU', airport: '제주국제공항', city: '제주', at: '2026-09-20T18:40:00', lat: 33.5113, lng: 126.493 },
        arr: { iata: 'GMP', airport: '김포국제공항', city: '서울', at: '2026-09-20T19:50:00', lat: 37.5583, lng: 126.7906 },
      },
      createdBy: suah.id, createdAt: now - 4 * day,
    },
  ]

  // 제주여행 비용 8건 (결제자·참여자 섞어서) — 정산 요약이 바로 보이도록 시드
  const all = [me.id, jihoon.id, minji.id, suah.id]
  const expenses: Expense[] = [
    { id: 'x1', tripId: trip.id, title: '렌터카 3박4일', amount: 240000, paidBy: me.id, participants: all, category: '교통', date: '2026-09-18', createdBy: me.id, createdAt: now - 6 * day },
    { id: 'x2', tripId: trip.id, title: '첫날 흑돼지 회식', amount: 132000, paidBy: jihoon.id, participants: all, category: '식비', date: '2026-09-18', createdBy: jihoon.id, createdAt: now - 6 * day },
    { id: 'x3', tripId: trip.id, title: '숙소 (2박)', amount: 320000, paidBy: minji.id, participants: all, category: '숙박', date: '2026-09-18', createdBy: minji.id, createdAt: now - 6 * day },
    { id: 'x4', tripId: trip.id, title: '카페 델문도', amount: 28000, paidBy: suah.id, participants: all, category: '카페', date: '2026-09-19', createdBy: suah.id, createdAt: now - 5 * day },
    { id: 'x5', tripId: trip.id, title: '한라산 김밥·간식', amount: 21000, paidBy: me.id, participants: all, category: '식비', date: '2026-09-19', createdBy: me.id, createdAt: now - 5 * day },
    { id: 'x6', tripId: trip.id, title: '둘째날 저녁 해산물', amount: 96000, paidBy: jihoon.id, participants: all, category: '식비', date: '2026-09-19', createdBy: jihoon.id, createdAt: now - 5 * day },
    { id: 'x7', tripId: trip.id, title: '기념품 (민지·수아)', amount: 34000, paidBy: minji.id, participants: [minji.id, suah.id], category: '기타', date: '2026-09-20', createdBy: minji.id, createdAt: now - 4 * day },
    { id: 'x8', tripId: trip.id, title: '주유비', amount: 55000, paidBy: suah.id, participants: all, category: '교통', date: '2026-09-20', createdBy: suah.id, createdAt: now - 4 * day },
    { id: 'x9', tripId: trip.id, title: '둘째날 술자리 (은애 안 마심)', amount: 60000, paidBy: jihoon.id, participants: all, splitMode: 'custom', shares: { [me.id]: 0, [jihoon.id]: 20000, [minji.id]: 20000, [suah.id]: 20000 }, category: '식비', date: '2026-09-19', createdBy: jihoon.id, createdAt: now - 5 * day },
  ]

  write(K.user, me)
  write(K.users, [me, jihoon, minji, suah])
  write(K.trips, [trip])
  write(K.places, places)
  write(K.schedule, schedule)
  write(K.expenses, expenses)
  write(K.settlements, [] as SettlementState[])
  write(K.memories, memories)
  // 인앱 알림 3종 중 '합류'를 시드로 노출(나머지 2종은 사용자 행동으로 생성)
  write(K.notifs, [
    { id: 'n1', tripId: trip.id, type: 'member_joined', message: '수아님이 여행에 합류했어요.', createdAt: now - 6 * day },
  ] as AppNotification[])
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
      user = { id: uid(), nickname: '나', email: 'me@ganjik.log' }
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

  watchTrips(userId, cb) {
    const run = () =>
      cb(
        read<Trip[]>(K.trips, [])
          .filter((t) => t.memberIds.includes(userId))
          .sort((a, b) => b.createdAt - a.createdAt),
      )
    run()
    return bus.on(K.trips, run)
  },
  async getTrip(id) {
    return read<Trip[]>(K.trips, []).find((t) => t.id === id) ?? null
  },
  async createTrip(user, input) {
    upsertUser(user)
    const trip: Trip = {
      id: uid(),
      inviteCode: inviteCode(),
      title: input.title,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      ownerId: user.id,
      memberIds: [user.id],
      createdAt: Date.now(),
    }
    write(K.trips, [...read<Trip[]>(K.trips, []), trip])
    return trip
  },
  async joinTrip(user, code) {
    const trips = read<Trip[]>(K.trips, [])
    const trip = trips.find((t) => t.inviteCode.toUpperCase() === code.trim().toUpperCase())
    if (!trip) throw new Error('invite.invalid')
    upsertUser(user)
    if (trip.memberIds.includes(user.id)) return trip // 이미 멤버면 무시
    trip.memberIds.push(user.id)
    write(K.trips, trips)
    pushNotif({ tripId: trip.id, type: 'member_joined', message: `${user.nickname}님이 여행에 합류했어요.` })
    return trip
  },
  async leaveTrip(tripId, userId) {
    const trips = read<Trip[]>(K.trips, [])
    const t = trips.find((x) => x.id === tripId)
    if (!t) return
    t.memberIds = t.memberIds.filter((id) => id !== userId)
    if (t.memberIds.length === 0) {
      // 마지막 멤버가 나가면 여행과 딸린 데이터를 정리
      write(K.trips, trips.filter((x) => x.id !== tripId))
      write(K.places, read<Place[]>(K.places, []).filter((p) => p.tripId !== tripId))
      write(K.schedule, read<ScheduleItem[]>(K.schedule, []).filter((s) => s.tripId !== tripId))
      write(K.expenses, read<Expense[]>(K.expenses, []).filter((x) => x.tripId !== tripId))
      write(K.settlements, read<SettlementState[]>(K.settlements, []).filter((x) => x.tripId !== tripId))
      write(K.memories, read<Memory[]>(K.memories, []).filter((m) => m.tripId !== tripId))
      write(K.notifs, read<AppNotification[]>(K.notifs, []).filter((n) => n.tripId !== tripId))
      return
    }
    if (t.ownerId === userId) t.ownerId = t.memberIds[0] // owner 이양
    write(K.trips, trips)
  },
  async updateTrip(tripId, patch) {
    const trips = read<Trip[]>(K.trips, [])
    const i = trips.findIndex((t) => t.id === tripId)
    if (i >= 0) {
      trips[i] = { ...trips[i], ...patch }
      write(K.trips, trips)
    }
  },
  async getTripMembers(tripId) {
    const trip = await this.getTrip(tripId)
    if (!trip) return []
    const users = read<AppUser[]>(K.users, [])
    return trip.memberIds.map(
      (id) => users.find((u) => u.id === id) ?? { id, nickname: '친구', email: '' },
    )
  },

  watchPlaces(tripId, cb) {
    const run = () => cb(read<Place[]>(K.places, []).filter((p) => p.tripId === tripId))
    run()
    return bus.on(K.places, run)
  },
  async addPlace(input) {
    const place: Place = { ...input, id: uid(), createdAt: Date.now() }
    write(K.places, [...read<Place[]>(K.places, []), place])
    pushNotif({ tripId: place.tripId, type: 'place_added', message: `‘${place.name}’을(를) 담았어요.` })
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

  watchSchedule(tripId, cb) {
    const run = () => cb(read<ScheduleItem[]>(K.schedule, []).filter((s) => s.tripId === tripId))
    run()
    return bus.on(K.schedule, run)
  },
  async addScheduleItem(input) {
    const item: ScheduleItem = { ...input, id: uid(), createdAt: Date.now() }
    write(K.schedule, [...read<ScheduleItem[]>(K.schedule, []), item])
    pushNotif({ tripId: item.tripId, type: 'schedule_changed', message: `새 일정 ‘${item.title}’을(를) 추가했어요.` })
    return item
  },
  async updateScheduleItem(id, patch) {
    const list = read<ScheduleItem[]>(K.schedule, [])
    const i = list.findIndex((s) => s.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], ...patch }
      write(K.schedule, list)
    }
  },
  async deleteScheduleItem(id) {
    write(K.schedule, read<ScheduleItem[]>(K.schedule, []).filter((s) => s.id !== id))
  },

  watchExpenses(tripId, cb) {
    const run = () => cb(read<Expense[]>(K.expenses, []).filter((x) => x.tripId === tripId))
    run()
    return bus.on(K.expenses, run)
  },
  async addExpense(input) {
    const item: Expense = { ...input, id: uid(), createdAt: Date.now() }
    write(K.expenses, [...read<Expense[]>(K.expenses, []), item])
    return item
  },
  async updateExpense(id, patch) {
    const list = read<Expense[]>(K.expenses, [])
    const i = list.findIndex((x) => x.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], ...patch }
      write(K.expenses, list)
    }
  },
  async deleteExpense(id) {
    write(K.expenses, read<Expense[]>(K.expenses, []).filter((x) => x.id !== id))
  },

  watchSettlement(tripId, cb) {
    const run = () => {
      const s = read<SettlementState[]>(K.settlements, []).find((x) => x.tripId === tripId)
      cb(s?.settledKeys ?? [])
    }
    run()
    return bus.on(K.settlements, run)
  },
  async setTransferSettled(tripId, key, settled) {
    const list = read<SettlementState[]>(K.settlements, [])
    let s = list.find((x) => x.tripId === tripId)
    if (!s) {
      s = { tripId, settledKeys: [] }
      list.push(s)
    }
    const has = s.settledKeys.includes(key)
    if (settled && !has) s.settledKeys.push(key)
    else if (!settled && has) s.settledKeys = s.settledKeys.filter((k) => k !== key)
    else return
    write(K.settlements, list)
  },

  watchMemories(tripId, cb) {
    const run = () => cb(read<Memory[]>(K.memories, []).filter((m) => m.tripId === tripId))
    run()
    return bus.on(K.memories, run)
  },
  async addMemory(input) {
    const memory: Memory = { ...input, id: uid(), createdAt: Date.now() }
    write(K.memories, [...read<Memory[]>(K.memories, []), memory])
    pushNotif({ tripId: memory.tripId, type: 'memory_added', message: `‘${memory.placeName}’에 추억을 남겼어요.` })
    return memory
  },
  async deleteMemory(id) {
    write(K.memories, read<Memory[]>(K.memories, []).filter((m) => m.id !== id))
  },
  async uploadPhoto(_tripId, file) {
    // demo: keep the image as a data URL so it survives reloads locally
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('photo.upload_failed'))
      reader.readAsDataURL(file)
    })
  },

  watchNotifications(tripId, cb) {
    const run = () => cb(read<AppNotification[]>(K.notifs, []).filter((n) => n.tripId === tripId))
    run()
    return bus.on(K.notifs, run)
  },
  async markNotificationsRead(tripId) {
    const list = read<AppNotification[]>(K.notifs, [])
    let touched = false
    for (const n of list)
      if (n.tripId === tripId && !n.readAt) {
        n.readAt = Date.now()
        touched = true
      }
    if (touched) write(K.notifs, list)
  },
  async requestSettlement(tripId, requesterNickname) {
    pushNotif({
      tripId,
      type: 'settlement_requested',
      message: `${requesterNickname}님이 정산을 요청했어요. 가계부에서 확인해요.`,
    })
  },

  async saveFcmToken(userId, token) {
    const users = read<AppUser[]>(K.users, [])
    const i = users.findIndex((u) => u.id === userId)
    if (i >= 0) {
      const set = new Set([...(users[i].fcmTokens ?? []), token])
      users[i] = { ...users[i], fcmTokens: [...set] }
      write(K.users, users)
    }
    const me = read<AppUser | null>(K.user, null)
    if (me && me.id === userId) {
      write(K.user, { ...me, fcmTokens: [...new Set([...(me.fcmTokens ?? []), token])] })
      emitUser()
    }
  },
  async removeFcmToken(userId, token) {
    const users = read<AppUser[]>(K.users, [])
    const i = users.findIndex((u) => u.id === userId)
    if (i >= 0) {
      users[i] = { ...users[i], fcmTokens: (users[i].fcmTokens ?? []).filter((t) => t !== token) }
      write(K.users, users)
    }
    const me = read<AppUser | null>(K.user, null)
    if (me && me.id === userId) {
      write(K.user, { ...me, fcmTokens: (me.fcmTokens ?? []).filter((t) => t !== token) })
      emitUser()
    }
  },
}

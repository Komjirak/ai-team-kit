import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { fbAuth, fbDb, fbStorage } from '../lib/firebase'
import type { Backend, AuthApi } from './backend'
import type {
  AppNotification,
  AppUser,
  Expense,
  Memory,
  Place,
  ScheduleItem,
  Trip,
} from './types'

// ─────────────────────────────────────────────────────────────
// Real backend: Firebase Auth (Google) + Firestore + Storage.
// Collections: users, trips, places, memories, notifications.
// Trip-member-scoped access is enforced in firestore.rules
// (a member is anyone in trips/{id}.memberIds — see report to BE/ORCH).
// ─────────────────────────────────────────────────────────────

const code6 = () =>
  Array.from(
    { length: 6 },
    () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 32)],
  ).join('')

const auth: AuthApi = {
  onUser(cb) {
    return onAuthStateChanged(fbAuth(), async (u) => {
      if (!u) return cb(null)
      const base: AppUser = {
        id: u.uid,
        nickname: u.displayName || (u.email ? u.email.split('@')[0] : '나'),
        email: u.email || '',
        photoURL: u.photoURL || undefined,
      }
      // ensure a users/{uid} doc exists (used to resolve member names)
      const userRef = doc(fbDb(), 'users', u.uid)
      const existing = await getDoc(userRef)
      if (!existing.exists()) {
        await setDoc(userRef, { ...base, createdAt: serverTimestamp() })
      }
      cb(base)
    })
  },
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(fbAuth(), provider)
  },
  async signOut() {
    await fbSignOut(fbAuth())
  },
  async reload() {
    const u = fbAuth().currentUser
    if (!u) return null
    return {
      id: u.uid,
      nickname: u.displayName || (u.email ? u.email.split('@')[0] : '나'),
      email: u.email || '',
      photoURL: u.photoURL || undefined,
    }
  },
}

function mapDoc<T>(d: { id: string; data: () => unknown }): T {
  return { id: d.id, ...(d.data() as object) } as T
}

// Sort newest-first in the client so the list queries need only a single
// equality/array-contains filter — no composite index required.
function byCreatedDesc<T extends { createdAt?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

export const firebaseBackend: Backend = {
  auth,

  watchTrips(userId, cb) {
    const q = query(collection(fbDb(), 'trips'), where('memberIds', 'array-contains', userId))
    return onSnapshot(q, (s) => cb(byCreatedDesc(s.docs.map((d) => mapDoc<Trip>(d)))))
  },
  async getTrip(id) {
    const snap = await getDoc(doc(fbDb(), 'trips', id))
    return snap.exists() ? (mapDoc<Trip>(snap) as Trip) : null
  },
  async createTrip(user, input) {
    const ref_ = await addDoc(collection(fbDb(), 'trips'), {
      inviteCode: code6(),
      title: input.title,
      destination: input.destination ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      ownerId: user.id,
      memberIds: [user.id],
      createdAt: Date.now(),
    })
    const snap = await getDoc(ref_)
    return mapDoc<Trip>(snap) as Trip
  },
  async joinTrip(user, inviteCode) {
    const q = query(
      collection(fbDb(), 'trips'),
      where('inviteCode', '==', inviteCode.trim().toUpperCase()),
      limit(1),
    )
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('invite.invalid')
    const trip = mapDoc<Trip>(snap.docs[0]) as Trip
    if (trip.memberIds.includes(user.id)) return trip // 이미 멤버면 무시
    const members = [...trip.memberIds, user.id]
    await updateDoc(doc(fbDb(), 'trips', trip.id), { memberIds: members })
    await addDoc(collection(fbDb(), 'notifications'), {
      tripId: trip.id,
      type: 'member_joined',
      message: `${user.nickname}님이 여행에 합류했어요.`,
      createdAt: Date.now(),
      readAt: null,
    })
    return { ...trip, memberIds: members }
  },
  async leaveTrip(tripId, userId) {
    const trip = await this.getTrip(tripId)
    if (!trip) return
    const members = trip.memberIds.filter((id) => id !== userId)
    if (members.length === 0) {
      await deleteDoc(doc(fbDb(), 'trips', tripId))
      return
    }
    const patch: Partial<Trip> = { memberIds: members }
    if (trip.ownerId === userId) patch.ownerId = members[0] // owner 이양
    await updateDoc(doc(fbDb(), 'trips', tripId), patch)
  },
  async updateTrip(tripId, patch) {
    await updateDoc(doc(fbDb(), 'trips', tripId), patch)
  },
  async getTripMembers(tripId) {
    const trip = await this.getTrip(tripId)
    if (!trip) return []
    const out: AppUser[] = []
    for (const id of trip.memberIds) {
      const s = await getDoc(doc(fbDb(), 'users', id))
      out.push(s.exists() ? (mapDoc<AppUser>(s) as AppUser) : { id, nickname: '친구', email: '' })
    }
    return out
  },

  watchPlaces(tripId, cb) {
    const q = query(collection(fbDb(), 'places'), where('tripId', '==', tripId))
    return onSnapshot(q, (s) => cb(byCreatedDesc(s.docs.map((d) => mapDoc<Place>(d)))))
  },
  async addPlace(input) {
    const ref_ = await addDoc(collection(fbDb(), 'places'), { ...input, createdAt: Date.now() })
    return { ...input, id: ref_.id, createdAt: Date.now() }
  },
  async updatePlace(id, patch) {
    await updateDoc(doc(fbDb(), 'places', id), patch)
  },
  async deletePlace(id) {
    await deleteDoc(doc(fbDb(), 'places', id))
  },

  watchSchedule(tripId, cb) {
    // orderBy 없이 tripId 동등 필터만 — 클라에서 정렬(색인 요구 회피).
    const q = query(collection(fbDb(), 'schedules'), where('tripId', '==', tripId))
    return onSnapshot(q, (s) => cb(s.docs.map((d) => mapDoc<ScheduleItem>(d))))
  },
  async addScheduleItem(input) {
    const ref_ = await addDoc(collection(fbDb(), 'schedules'), { ...input, createdAt: Date.now() })
    return { ...input, id: ref_.id, createdAt: Date.now() }
  },
  async updateScheduleItem(id, patch) {
    await updateDoc(doc(fbDb(), 'schedules', id), patch)
  },
  async deleteScheduleItem(id) {
    await deleteDoc(doc(fbDb(), 'schedules', id))
  },

  watchExpenses(tripId, cb) {
    const q = query(collection(fbDb(), 'expenses'), where('tripId', '==', tripId))
    return onSnapshot(q, (s) => cb(byCreatedDesc(s.docs.map((d) => mapDoc<Expense>(d)))))
  },
  async addExpense(input) {
    const ref_ = await addDoc(collection(fbDb(), 'expenses'), { ...input, createdAt: Date.now() })
    return { ...input, id: ref_.id, createdAt: Date.now() }
  },
  async updateExpense(id, patch) {
    await updateDoc(doc(fbDb(), 'expenses', id), patch)
  },
  async deleteExpense(id) {
    await deleteDoc(doc(fbDb(), 'expenses', id))
  },

  watchSettlement(tripId, cb) {
    // settlements/{tripId} 문서 하나. 없으면 빈 배열.
    return onSnapshot(doc(fbDb(), 'settlements', tripId), (s) =>
      cb(((s.data()?.settledKeys as string[] | undefined) ?? [])),
    )
  },
  async setTransferSettled(tripId, key, settled) {
    await setDoc(
      doc(fbDb(), 'settlements', tripId),
      { tripId, settledKeys: settled ? arrayUnion(key) : arrayRemove(key) },
      { merge: true },
    )
  },

  watchMemories(tripId, cb) {
    const q = query(collection(fbDb(), 'memories'), where('tripId', '==', tripId))
    return onSnapshot(q, (s) => cb(byCreatedDesc(s.docs.map((d) => mapDoc<Memory>(d)))))
  },
  async addMemory(input) {
    const ref_ = await addDoc(collection(fbDb(), 'memories'), { ...input, createdAt: Date.now() })
    return { ...input, id: ref_.id, createdAt: Date.now() }
  },
  async deleteMemory(id) {
    await deleteDoc(doc(fbDb(), 'memories', id))
  },
  async uploadPhoto(tripId, file) {
    const path = `trips/${tripId}/${Date.now()}-${file.name}`
    const r = ref(fbStorage(), path)
    await uploadBytes(r, file)
    return await getDownloadURL(r)
  },

  watchNotifications(tripId, cb) {
    const q = query(collection(fbDb(), 'notifications'), where('tripId', '==', tripId))
    return onSnapshot(q, (s) =>
      cb(byCreatedDesc(s.docs.map((d) => mapDoc<AppNotification>(d))).slice(0, 30)),
    )
  },
  async markNotificationsRead(tripId) {
    const q = query(
      collection(fbDb(), 'notifications'),
      where('tripId', '==', tripId),
      where('readAt', '==', null),
    )
    const snap = await getDocs(q)
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { readAt: Date.now() })))
  },
}

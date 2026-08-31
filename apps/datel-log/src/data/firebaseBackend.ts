import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
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
  Couple,
  Course,
  Memory,
  Place,
} from './types'

// ─────────────────────────────────────────────────────────────
// Real backend: Firebase Auth (Google) + Firestore + Storage.
// Collections: users, couples, places, courses, memories, notifications.
// Membership-scoped access is enforced in firestore.rules.
// ─────────────────────────────────────────────────────────────

const code6 = () =>
  Array.from(
    { length: 6 },
    () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 32)],
  ).join('')

async function loadCoupleId(userId: string): Promise<string | undefined> {
  const snap = await getDoc(doc(fbDb(), 'users', userId))
  return (snap.data()?.coupleId as string | undefined) ?? undefined
}

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
      // ensure a users/{uid} doc exists, then attach coupleId
      const userRef = doc(fbDb(), 'users', u.uid)
      const existing = await getDoc(userRef)
      if (!existing.exists()) {
        await setDoc(userRef, { ...base, createdAt: serverTimestamp() })
      }
      cb({ ...base, coupleId: await loadCoupleId(u.uid) })
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
    const base: AppUser = {
      id: u.uid,
      nickname: u.displayName || (u.email ? u.email.split('@')[0] : '나'),
      email: u.email || '',
      photoURL: u.photoURL || undefined,
    }
    return { ...base, coupleId: await loadCoupleId(u.uid) }
  },
}

function mapDoc<T>(d: { id: string; data: () => unknown }): T {
  return { id: d.id, ...(d.data() as object) } as T
}

export const firebaseBackend: Backend = {
  auth,

  async getCouple(id) {
    const snap = await getDoc(doc(fbDb(), 'couples', id))
    return snap.exists() ? (mapDoc<Couple>(snap) as Couple) : null
  },
  async getCoupleByMember(userId) {
    const q = query(collection(fbDb(), 'couples'), where('memberIds', 'array-contains', userId), limit(1))
    const snap = await getDocs(q)
    return snap.empty ? null : (mapDoc<Couple>(snap.docs[0]) as Couple)
  },
  async createCouple(user) {
    const ref_ = await addDoc(collection(fbDb(), 'couples'), {
      inviteCode: code6(),
      memberIds: [user.id],
      startDate: null,
      createdAt: serverTimestamp(),
    })
    await updateDoc(doc(fbDb(), 'users', user.id), { coupleId: ref_.id })
    const snap = await getDoc(ref_)
    return mapDoc<Couple>(snap) as Couple
  },
  async joinCouple(user, inviteCode) {
    const q = query(
      collection(fbDb(), 'couples'),
      where('inviteCode', '==', inviteCode.trim().toUpperCase()),
      limit(1),
    )
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('invite.invalid')
    const couple = mapDoc<Couple>(snap.docs[0]) as Couple
    if (user.coupleId && user.coupleId !== couple.id) throw new Error('couple.already_bound')
    if (couple.memberIds.length >= 2 && !couple.memberIds.includes(user.id))
      throw new Error('couple.full')
    const members = couple.memberIds.includes(user.id)
      ? couple.memberIds
      : [...couple.memberIds, user.id]
    await updateDoc(doc(fbDb(), 'couples', couple.id), { memberIds: members })
    await updateDoc(doc(fbDb(), 'users', user.id), { coupleId: couple.id })
    await addDoc(collection(fbDb(), 'notifications'), {
      coupleId: couple.id,
      type: 'partner_joined',
      message: `${user.nickname}님이 합류했어요.`,
      createdAt: serverTimestamp(),
      readAt: null,
    })
    return { ...couple, memberIds: members }
  },
  async setStartDate(coupleId, startDate) {
    await updateDoc(doc(fbDb(), 'couples', coupleId), { startDate })
  },
  async getCoupleMembers(coupleId) {
    const couple = await this.getCouple(coupleId)
    if (!couple) return []
    const out: AppUser[] = []
    for (const id of couple.memberIds) {
      const s = await getDoc(doc(fbDb(), 'users', id))
      out.push(s.exists() ? (mapDoc<AppUser>(s) as AppUser) : { id, nickname: '파트너', email: '' })
    }
    return out
  },

  watchPlaces(coupleId, cb) {
    const q = query(
      collection(fbDb(), 'places'),
      where('coupleId', '==', coupleId),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, (s) => cb(s.docs.map((d) => mapDoc<Place>(d))))
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

  watchCourses(coupleId, cb) {
    const q = query(
      collection(fbDb(), 'courses'),
      where('coupleId', '==', coupleId),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, (s) => cb(s.docs.map((d) => mapDoc<Course>(d))))
  },
  async addCourse(input) {
    const ref_ = await addDoc(collection(fbDb(), 'courses'), { ...input, createdAt: Date.now() })
    return { ...input, id: ref_.id, createdAt: Date.now() }
  },
  async updateCourse(id, patch) {
    await updateDoc(doc(fbDb(), 'courses', id), patch)
  },
  async deleteCourse(id) {
    await deleteDoc(doc(fbDb(), 'courses', id))
  },

  watchMemories(coupleId, cb) {
    const q = query(
      collection(fbDb(), 'memories'),
      where('coupleId', '==', coupleId),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, (s) => cb(s.docs.map((d) => mapDoc<Memory>(d))))
  },
  async addMemory(input) {
    const ref_ = await addDoc(collection(fbDb(), 'memories'), { ...input, createdAt: Date.now() })
    return { ...input, id: ref_.id, createdAt: Date.now() }
  },
  async deleteMemory(id) {
    await deleteDoc(doc(fbDb(), 'memories', id))
  },
  async uploadPhoto(coupleId, file) {
    const path = `couples/${coupleId}/${Date.now()}-${file.name}`
    const r = ref(fbStorage(), path)
    await uploadBytes(r, file)
    return await getDownloadURL(r)
  },

  watchNotifications(coupleId, cb) {
    const q = query(
      collection(fbDb(), 'notifications'),
      where('coupleId', '==', coupleId),
      orderBy('createdAt', 'desc'),
      limit(30),
    )
    return onSnapshot(q, (s) => cb(s.docs.map((d) => mapDoc<AppNotification>(d))))
  },
  async markNotificationsRead(coupleId) {
    const q = query(
      collection(fbDb(), 'notifications'),
      where('coupleId', '==', coupleId),
      where('readAt', '==', null),
    )
    const snap = await getDocs(q)
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { readAt: Date.now() })))
  },
}

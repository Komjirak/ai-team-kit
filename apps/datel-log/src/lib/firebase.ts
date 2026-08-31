import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { firebaseConfig, hasFirebase } from './env'

// Lazily initialized so the demo path never touches Firebase.
let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

function ensure() {
  if (!hasFirebase) throw new Error('firebase.not_configured')
  if (!app) {
    app = initializeApp({
      apiKey: firebaseConfig.apiKey!,
      authDomain: firebaseConfig.authDomain!,
      projectId: firebaseConfig.projectId!,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId!,
    })
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
    storageInstance = getStorage(app)
  }
}

export function fbAuth(): Auth {
  ensure()
  return authInstance!
}
export function fbDb(): Firestore {
  ensure()
  return dbInstance!
}
export function fbStorage(): FirebaseStorage {
  ensure()
  return storageInstance!
}

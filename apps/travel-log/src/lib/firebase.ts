import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeFirestore, type Firestore } from 'firebase/firestore'
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
    // ignoreUndefinedProperties: 선택 필드(메모·좌표 등)가 없을 때 undefined로
    // 넘어와도 Firestore가 거부하지 않고 그 필드를 생략하도록 한다.
    dbInstance = initializeFirestore(app, { ignoreUndefinedProperties: true })
    storageInstance = getStorage(app)
  }
}

export function fbApp(): FirebaseApp {
  ensure()
  return app!
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

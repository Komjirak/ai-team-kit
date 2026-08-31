import { kakaoMapKey, hasKakao } from '../lib/env'

// Loads the Kakao Maps JS SDK once, with the services (place search) library.
// Resolves the global `kakao` namespace, or rejects so callers can show the
// map.load_failed fallback required by the PRD.

declare global {
  interface Window {
    kakao?: any
  }
}

let promise: Promise<any> | null = null

export function loadKakao(): Promise<any> {
  if (!hasKakao) return Promise.reject(new Error('kakao.not_configured'))
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  if (promise) return promise

  promise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false&libraries=services`
    script.async = true
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error('map.load_failed'))
        return
      }
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => {
      promise = null
      reject(new Error('map.load_failed'))
    }
    document.head.appendChild(script)
  })
  return promise
}

export { hasKakao }

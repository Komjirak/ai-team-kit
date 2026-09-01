import { googleMapsKey, hasGoogleMaps } from '../lib/env'

// Loads the Google Maps JS API once (with the Places library). Resolves the
// global `google` namespace, or rejects so callers can show the search/map
// failure fallback. Demo mode never calls this (no key → demo dataset).

declare global {
  interface Window {
    google?: any
    __ganjikInitGMaps?: () => void
    __ganjikMapsAuthFailed?: boolean
    gm_authFailure?: () => void
  }
}

// 키·리퍼러·결제 문제로 인증 실패 시 구글이 호출하는 전역 콜백.
// 회색 오류 박스 대신 우리 폴백을 띄우도록 플래그/이벤트로 알린다.
if (typeof window !== 'undefined' && !window.gm_authFailure) {
  window.gm_authFailure = () => {
    window.__ganjikMapsAuthFailed = true
    window.dispatchEvent(new Event('ganjik:maps-auth-failed'))
  }
}

export function mapsAuthFailed(): boolean {
  return typeof window !== 'undefined' && !!window.__ganjikMapsAuthFailed
}

let promise: Promise<any> | null = null

export function loadGoogleMaps(): Promise<any> {
  if (!hasGoogleMaps) return Promise.reject(new Error('maps.not_configured'))
  if (window.google?.maps) return Promise.resolve(window.google)
  if (promise) return promise

  promise = new Promise((resolve, reject) => {
    window.__ganjikInitGMaps = () => resolve(window.google)
    const s = document.createElement('script')
    s.src =
      `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}` +
      `&libraries=places&language=ko&region=KR&loading=async&callback=__ganjikInitGMaps`
    s.async = true
    s.onerror = () => {
      promise = null
      reject(new Error('maps.load_failed'))
    }
    document.head.appendChild(s)
  })
  return promise
}

export { hasGoogleMaps }

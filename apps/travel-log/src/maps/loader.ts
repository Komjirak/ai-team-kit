import { googleMapsKey, hasGoogleMaps } from '../lib/env'

// Loads the Google Maps JS API once (with the Places library). Resolves the
// global `google` namespace, or rejects so callers can show the search/map
// failure fallback. Demo mode never calls this (no key → demo dataset).

declare global {
  interface Window {
    google?: any
    __ganjikInitGMaps?: () => void
  }
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

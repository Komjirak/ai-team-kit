import { loadGoogleMaps, hasGoogleMaps } from './loader'

export interface PlaceResult {
  name: string
  address: string
  lat: number
  lng: number
  category?: string
}

/**
 * Searches places via Google Places (Places API — new `Place.searchByText`).
 * Throws 'search.failed' on SDK/quota error so callers can offer the manual
 * fallback. With no Google Maps key we return a demo result set by keyword.
 */
export async function searchPlaces(keyword: string): Promise<PlaceResult[]> {
  const q = keyword.trim()
  if (!q) return []
  if (!hasGoogleMaps) return demoSearch(q)

  const google = await loadGoogleMaps().catch(() => {
    throw new Error('search.failed')
  })

  try {
    const { Place } = await google.maps.importLibrary('places')
    const { places } = await Place.searchByText({
      textQuery: q,
      fields: ['displayName', 'formattedAddress', 'location'],
      language: 'ko',
      region: 'kr',
      maxResultCount: 12,
    })
    return (places ?? []).map((p: any) => ({
      name: typeof p.displayName === 'string' ? p.displayName : p.displayName?.text ?? '',
      address: p.formattedAddress ?? '',
      lat: typeof p.location?.lat === 'function' ? p.location.lat() : p.location?.lat,
      lng: typeof p.location?.lng === 'function' ? p.location.lng() : p.location?.lng,
    }))
  } catch {
    throw new Error('search.failed')
  }
}

// A tiny offline dataset so the demo build has something to pick (제주 위주 + 서울).
const DEMO: PlaceResult[] = [
  { name: '카멜리아힐', address: '제주 서귀포시 안덕면 병악로 166', lat: 33.2896, lng: 126.365, category: '자연' },
  { name: '성산일출봉', address: '제주 서귀포시 성산읍 일출로 284-12', lat: 33.4587, lng: 126.9426, category: '자연' },
  { name: '카페 델문도', address: '제주 제주시 조천읍 조함해안로 519-10', lat: 33.5432, lng: 126.6699, category: '카페' },
  { name: '흑돼지거리 돈사돈', address: '제주 제주시 원노형로 88', lat: 33.4726, lng: 126.4813, category: '맛집' },
  { name: '한라산 성판악탐방로', address: '제주 제주시 조천읍 516로 1865', lat: 33.3856, lng: 126.6136, category: '자연' },
  { name: '오설록 티뮤지엄', address: '제주 서귀포시 안덕면 신화역사로 15', lat: 33.3057, lng: 126.2896, category: '문화' },
]

function demoSearch(q: string): PlaceResult[] {
  const hit = DEMO.filter((d) => d.name.includes(q) || d.address.includes(q))
  return hit.length ? hit : DEMO.slice(0, 4)
}

import { loadKakao, hasKakao } from './loader'

export interface PlaceResult {
  name: string
  address: string
  lat: number
  lng: number
  category?: string
}

/**
 * Searches places via Kakao Local. Throws 'search.failed' on SDK/quota error
 * so the add-place screen can offer the manual-entry fallback (PRD §5-3).
 * When no Kakao key is configured we return a demo result set by keyword.
 */
export async function searchPlaces(keyword: string): Promise<PlaceResult[]> {
  const q = keyword.trim()
  if (!q) return []

  if (!hasKakao) return demoSearch(q)

  const kakao = await loadKakao().catch(() => {
    throw new Error('search.failed')
  })

  return new Promise<PlaceResult[]>((resolve, reject) => {
    const ps = new kakao.maps.services.Places()
    ps.keywordSearch(q, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK) {
        resolve(
          data.slice(0, 12).map((d) => ({
            name: d.place_name,
            address: d.road_address_name || d.address_name,
            lat: parseFloat(d.y),
            lng: parseFloat(d.x),
            category: d.category_group_name || undefined,
          })),
        )
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        resolve([])
      } else {
        reject(new Error('search.failed'))
      }
    })
  })
}

// A tiny offline dataset so the demo build has something to pick.
const DEMO: PlaceResult[] = [
  { name: '한남작업실', address: '서울 용산구 이태원로55나길 7', lat: 37.5378, lng: 127.0018, category: '카페' },
  { name: '현대카드 뮤직 라이브러리', address: '서울 용산구 이태원로 246', lat: 37.5349, lng: 127.0009, category: '문화' },
  { name: '사운즈 한남', address: '서울 용산구 대사관로 35', lat: 37.5372, lng: 127.0033, category: '문화' },
  { name: '성수연방', address: '서울 성동구 성수이로14길 14', lat: 37.5427, lng: 127.0561, category: '카페' },
  { name: '서울숲', address: '서울 성동구 뚝섬로 273', lat: 37.5443, lng: 127.0378, category: '자연' },
  { name: '대림창고', address: '서울 성동구 성수이로 78', lat: 37.5417, lng: 127.0556, category: '카페' },
]

function demoSearch(q: string): PlaceResult[] {
  const hit = DEMO.filter((d) => d.name.includes(q) || d.address.includes(q))
  return hit.length ? hit : DEMO.slice(0, 4)
}

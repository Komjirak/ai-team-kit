import { loadGoogleMaps, hasGoogleMaps } from './loader'

export interface PlaceResult {
  name: string
  address: string
  lat: number
  lng: number
  category?: string
  photoUrl?: string // 대표 사진(자동) — 담을 때 썸네일로
  description?: string // 장소 설명(자동) — 담을 때 메모로
  rating?: number
}

// Google Places types → 우리 카테고리 라벨(자동 분류용).
function categoryFromTypes(types?: string[]): string | undefined {
  if (!types || !types.length) return undefined
  const t = types.join(' ')
  if (/cafe|coffee|bakery|tea/.test(t)) return '카페'
  if (/restaurant|food|meal|bar|diner/.test(t)) return '맛집'
  if (/lodging|hotel|motel|resort|guest/.test(t)) return '숙소'
  if (/park|natural|beach|mountain|hiking|forest|garden|zoo|aquarium/.test(t)) return '자연'
  if (/museum|tourist|art|temple|shrine|church|historic|landmark|theater/.test(t)) return '문화'
  return '기타'
}

function readEditorial(x: any): string | undefined {
  if (!x) return undefined
  if (typeof x === 'string') return x
  return x.text ?? undefined
}

/**
 * Searches places via Google Places (Places API — new `Place.searchByText`).
 * 사진(photoUrl)·설명(description)·평점(rating)까지 함께 가져와 담을 때 자동 채운다.
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
      fields: [
        'displayName',
        'formattedAddress',
        'location',
        'photos',
        'editorialSummary',
        'rating',
        'types',
      ],
      language: 'ko',
      region: 'kr',
      maxResultCount: 12,
    })
    return (places ?? []).map((p: any) => {
      let photoUrl: string | undefined
      try {
        photoUrl = p.photos?.[0]?.getURI ? p.photos[0].getURI({ maxWidthPx: 800 }) : undefined
      } catch {
        photoUrl = undefined
      }
      return {
        name: typeof p.displayName === 'string' ? p.displayName : p.displayName?.text ?? '',
        address: p.formattedAddress ?? '',
        lat: typeof p.location?.lat === 'function' ? p.location.lat() : p.location?.lat,
        lng: typeof p.location?.lng === 'function' ? p.location.lng() : p.location?.lng,
        category: categoryFromTypes(p.types),
        photoUrl,
        description: readEditorial(p.editorialSummary),
        rating: typeof p.rating === 'number' ? p.rating : undefined,
      }
    })
  } catch {
    throw new Error('search.failed')
  }
}

// A tiny offline dataset so the demo build has something to pick (제주 위주 + 서울).
// 사진·설명도 넣어 "자동 채움" 흐름을 데모에서도 그대로 보여준다.
const DEMO: PlaceResult[] = [
  {
    name: '카멜리아힐', address: '제주 서귀포시 안덕면 병악로 166', lat: 33.2896, lng: 126.365, category: '자연',
    rating: 4.5,
    description: '사계절 동백과 야생화가 가득한 대형 수목원. 산책로가 잘 정비돼 있어 천천히 걷기 좋다.',
    photoUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=70',
  },
  {
    name: '성산일출봉', address: '제주 서귀포시 성산읍 일출로 284-12', lat: 33.4587, lng: 126.9426, category: '자연',
    rating: 4.6,
    description: '유네스코 세계자연유산. 분화구 정상까지 오르면 성산 앞바다가 한눈에 들어온다.',
    photoUrl: 'https://images.unsplash.com/photo-1601733127588-2c1a5f6c1a17?w=800&q=70',
  },
  {
    name: '카페 델문도', address: '제주 제주시 조천읍 조함해안로 519-10', lat: 33.5432, lng: 126.6699, category: '카페',
    rating: 4.3,
    description: '함덕 바다 바로 앞 대형 로스터리 카페. 통유리 너머로 에메랄드빛 바다가 펼쳐진다.',
    photoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=70',
  },
  {
    name: '흑돼지거리 돈사돈', address: '제주 제주시 원노형로 88', lat: 33.4726, lng: 126.4813, category: '맛집',
    rating: 4.4,
    description: '두툼한 근고기로 유명한 제주 흑돼지 노포. 저녁엔 대기가 길어 예약 추천.',
    photoUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=70',
  },
  {
    name: '한라산 성판악탐방로', address: '제주 제주시 조천읍 516로 1865', lat: 33.3856, lng: 126.6136, category: '자연',
    rating: 4.7,
    description: '백록담으로 오르는 대표 코스. 왕복 약 9시간, 이른 아침 출발이 정석이다.',
    photoUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70',
  },
  {
    name: '오설록 티뮤지엄', address: '제주 서귀포시 안덕면 신화역사로 15', lat: 33.3057, lng: 126.2896, category: '문화',
    rating: 4.2,
    description: '드넓은 녹차밭 옆 티 뮤지엄. 녹차 아이스크림과 티 라운지가 인기.',
    photoUrl: 'https://images.unsplash.com/photo-1523920290228-4f321a939b4c?w=800&q=70',
  },
]

function demoSearch(q: string): PlaceResult[] {
  const hit = DEMO.filter((d) => d.name.includes(q) || d.address.includes(q))
  return hit.length ? hit : DEMO.slice(0, 4)
}

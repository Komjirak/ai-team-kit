import { backend } from '../../data'
import { searchPlaces } from '../../maps/placeSearch'
import { cleanPlaceName } from '../../data/placeText'
import { PLACE_CATEGORIES, type Place, type PlaceCategory } from '../../data/types'

// 주소가 사실은 지도 링크/URL이면 "주소 없음"으로 취급(가져오기 때 새어든 것 정리).
export function addressIsJunk(addr?: string): boolean {
  if (!addr) return true
  return /^https?:\/\//i.test(addr) || /google\.[a-z.]+\/maps|maps\.app\.goo\.gl/i.test(addr)
}

/** 이름 뒤에 URL이 붙어 저장된 경우(옛 가져오기 버그) 이름만 남긴다. */
export function cleanName(name: string): string {
  return cleanPlaceName(name) || name.trim()
}

/** 이 장소가 사진·좌표·주소·이름 정리가 필요한가. */
export function placeNeedsEnrich(p: Place): boolean {
  return (
    p.lat == null ||
    p.lng == null ||
    !p.thumbnail ||
    addressIsJunk(p.address) ||
    cleanName(p.name) !== p.name
  )
}

/**
 * 이름으로 구글에서 사진·좌표·설명·주소를 찾아 비어 있는 값만 채운다.
 * (이름에 URL이 붙어 있으면 먼저 정리한 뒤 그 이름으로 검색·저장한다.)
 * 반환: 'updated' | 'skip'(채울 것 없음) | 'nomatch'(검색 결과 없음)
 */
export async function enrichPlace(p: Place): Promise<'updated' | 'skip' | 'nomatch'> {
  if (!placeNeedsEnrich(p)) return 'skip'
  const name = cleanName(p.name)
  const patch: Partial<Place> = {}
  if (name !== p.name) patch.name = name // 깨진 이름 정리

  const hit = (await searchPlaces(name))[0]
  if (hit) {
    if ((p.lat == null || p.lng == null) && hit.lat && hit.lng) {
      patch.lat = hit.lat
      patch.lng = hit.lng
    }
    if (!p.thumbnail && hit.photoUrl) patch.thumbnail = hit.photoUrl
    if (!p.memo && hit.description) patch.memo = hit.description
    if (addressIsJunk(p.address) && hit.address) patch.address = hit.address
    if (p.category === '기타' && hit.category) {
      const c = PLACE_CATEGORIES.find((x) => hit.category?.includes(x)) as PlaceCategory | undefined
      if (c) patch.category = c
    }
  } else if (Object.keys(patch).length === 0) {
    return 'nomatch'
  }

  if (Object.keys(patch).length === 0) return 'skip'
  await backend.updatePlace(p.id, patch)
  return 'updated'
}

import type { AppUser, Memory, Place, Stats, Trip } from './types'

/** 여행 기간(일). start~end 양끝 포함. 기간 미설정이면 null. */
export function tripDayCount(trip: Trip | null): number | null {
  if (!trip?.startDate || !trip?.endDate) return null
  const start = new Date(trip.startDate + 'T00:00:00')
  const end = new Date(trip.endDate + 'T00:00:00')
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const diff = Math.floor((end.getTime() - start.getTime()) / 86_400_000)
  return diff >= 0 ? diff + 1 : null
}

export function computeStats(
  trip: Trip | null,
  members: AppUser[],
  places: Place[],
  memories: Memory[],
): Stats {
  const visited = places.filter((p) => p.status === 'visited')
  const wishlist = places.filter((p) => p.status === 'wishlist')
  const photoCount = memories.reduce((n, m) => n + (m.photoUrls?.length ?? 0), 0)

  const firstVisit =
    visited
      .filter((p) => p.visitedAt)
      .sort((a, b) => (a.visitedAt ?? 0) - (b.visitedAt ?? 0))[0] ?? null

  // most-remembered place
  const byPlace = new Map<string, number>()
  for (const m of memories) byPlace.set(m.placeName, (byPlace.get(m.placeName) ?? 0) + 1)
  let topMemoryPlace: Stats['topMemoryPlace'] = null
  for (const [name, count] of byPlace)
    if (!topMemoryPlace || count > topMemoryPlace.count) topMemoryPlace = { name, count }

  // per-member registration count (the "누가 더 많이 담았나")
  const perMemberPlaceCount = members.map((u) => ({
    userId: u.id,
    nickname: u.nickname,
    count: places.filter((p) => p.createdBy === u.id).length,
  }))

  return {
    tripDays: tripDayCount(trip),
    visitedCount: visited.length,
    wishlistCount: wishlist.length,
    memoryCount: memories.length,
    photoCount,
    firstVisit,
    topMemoryPlace,
    perMemberPlaceCount,
  }
}

export function haversine(a: { lat?: number; lng?: number }, b: { lat?: number; lng?: number }): number {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return 0
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

/** rough walking minutes from km (≈ 4.8 km/h) */
export function walkingMinutes(km: number): number {
  return Math.max(1, Math.round((km / 4.8) * 60))
}

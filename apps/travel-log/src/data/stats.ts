import type { AppUser, Course, Couple, Memory, Place, Stats } from './types'

export function daysBetween(startDate: string | undefined): number | null {
  if (!startDate) return null
  const start = new Date(startDate + 'T00:00:00')
  if (Number.isNaN(start.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000)
  return diff + 1 // day 1 = start day itself ("함께한 지 N일째")
}

export function computeStats(
  couple: Couple | null,
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

  // per-member registration count (the "runner race")
  const perMemberPlaceCount = members.map((u) => ({
    userId: u.id,
    nickname: u.nickname,
    count: places.filter((p) => p.createdBy === u.id).length,
  }))

  return {
    daysTogether: daysBetween(couple?.startDate),
    visitedCount: visited.length,
    wishlistCount: wishlist.length,
    memoryCount: memories.length,
    photoCount,
    firstVisit,
    topMemoryPlace,
    perMemberPlaceCount,
  }
}

/** total segment distances for a course, using straight-line (haversine). */
export function courseDistanceKm(course: Course, places: Place[]): number {
  const pts = course.placeIds
    .map((id) => places.find((p) => p.id === id))
    .filter((p): p is Place => !!p && p.lat != null && p.lng != null)
  let km = 0
  for (let i = 1; i < pts.length; i++) km += haversine(pts[i - 1], pts[i])
  return km
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

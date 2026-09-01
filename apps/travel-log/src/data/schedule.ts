import type { ScheduleItem } from './types'

/** "yyyy-mm-dd" → 로컬 자정 Date. TZ 변환 없이 날짜 부품으로만 만든다. */
function parseLocalDate(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** Date → 로컬 기준 "yyyy-mm-dd" (toISOString의 UTC 변환으로 인한 하루 밀림 방지). */
export function toLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 오늘 날짜를 로컬 기준 "yyyy-mm-dd"로. */
export function todayYmd(): string {
  return toLocalYmd(new Date())
}

/** 여행 기간의 날짜 목록(ISO yyyy-mm-dd), 양끝 포함. 기간 미설정이면 []. */
export function tripDates(startDate?: string, endDate?: string): string[] {
  if (!startDate) return []
  const start = parseLocalDate(startDate)
  if (!start) return []
  const end = endDate ? parseLocalDate(endDate) : start
  if (!end || end.getTime() < start.getTime()) return [startDate]
  const out: string[] = []
  const cur = new Date(start)
  // 안전 상한(무한 루프 방지) — 여행은 조연이므로 넉넉히 60일까지만
  for (let i = 0; i < 60 && cur.getTime() <= end.getTime(); i++) {
    out.push(toLocalYmd(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

/** 같은 날 안에서의 정렬: order → time → createdAt. */
export function sortDayItems(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    const at = a.time ?? '99:99'
    const bt = b.time ?? '99:99'
    if (at !== bt) return at < bt ? -1 : 1
    return a.createdAt - b.createdAt
  })
}

/** yyyy-mm-dd → "9.18 (금)" 표기. */
export function fmtDayLabel(date: string): string {
  const d = new Date(date + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return date
  const w = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${d.getMonth() + 1}.${d.getDate()} (${w})`
}

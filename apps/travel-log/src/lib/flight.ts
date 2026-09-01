import { isDemo } from './env'
import { airport } from '../data/airports'
import type { FlightInfo, FlightLeg } from '../data/types'

// ─────────────────────────────────────────────────────────────
// 항공편 조회 — 날짜 + 편명 → 출발/도착/경로.
//   • 실 배포(Vercel): /api/flight 서버리스 함수가 Amadeus를 호출(키는 서버에만).
//   • 데모 모드: 키·서버 없이 도는 샘플/합성 데이터.
// 결과는 airports 사전으로 좌표·이름을 보강해 지도 경로에 쓸 수 있게 한다.
// ─────────────────────────────────────────────────────────────

export interface ParsedFlight {
  carrierCode: string // 항공사 IATA 2자 (예: KE)
  flightNumber: string // 숫자만 (예: 1275)
  display: string // 정규화 표기 (예: KE1275)
}

/** "ke 001", "KE0001", "7C101" → { carrierCode, flightNumber, display }. 형식 오류면 null. */
export function parseFlightNumber(raw: string): ParsedFlight | null {
  const s = (raw || '').toUpperCase().replace(/\s+/g, '')
  const m = s.match(/^([0-9A-Z]{2})0*(\d{1,4})[A-Z]?$/)
  if (!m) return null
  const carrierCode = m[1]
  // 항공사 코드는 최소 한 글자가 알파벳이어야 함(예: 7C ok, 12 는 아님)
  if (!/[A-Z]/.test(carrierCode)) return null
  const flightNumber = String(parseInt(m[2], 10))
  const display = carrierCode + flightNumber.padStart(3, '0')
  return { carrierCode, flightNumber, display }
}

function enrichLeg(leg: FlightLeg): FlightLeg {
  const a = airport(leg.iata)
  if (!a) return leg
  return {
    ...leg,
    airport: leg.airport || a.name,
    city: leg.city || a.city,
    lat: leg.lat ?? a.lat,
    lng: leg.lng ?? a.lng,
  }
}

function enrich(f: FlightInfo): FlightInfo {
  return { ...f, dep: enrichLeg(f.dep), arr: enrichLeg(f.arr) }
}

/**
 * 날짜(yyyy-mm-dd) + 편명으로 항공편을 조회한다.
 * 성공 시 FlightInfo, 실패 시 throw:
 *   'flight.bad_number' | 'flight.not_found' | 'flight.lookup_failed'
 */
export async function lookupFlight(rawNumber: string, date: string): Promise<FlightInfo> {
  const parsed = parseFlightNumber(rawNumber)
  if (!parsed) throw new Error('flight.bad_number')
  if (!date) throw new Error('flight.not_found')

  // 데모: 서버 없이 샘플/합성 데이터
  if (isDemo) return enrich(demoFlight(parsed, date))

  // 실모드: Vercel 서버리스 프록시(Amadeus)
  try {
    const res = await fetch(
      `/api/flight?carrierCode=${parsed.carrierCode}&flightNumber=${parsed.flightNumber}&date=${date}`,
    )
    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; flight?: FlightInfo; reason?: string }
      if (data.ok && data.flight) return enrich(data.flight)
      if (data.reason === 'not_found') throw new Error('flight.not_found')
      // not_configured 등 → 데모로 폴백(로컬/키미설정 시에도 흐름 유지)
      return enrich(demoFlight(parsed, date))
    }
    // 라우트 자체가 없거나(로컬 dev) 서버 오류 → 데모 폴백
    return enrich(demoFlight(parsed, date))
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('flight.')) throw e
    // 네트워크 실패 → 데모 폴백(끊긴 상태에서도 저장 흐름은 살림)
    return enrich(demoFlight(parsed, date))
  }
}

// ── 데모/폴백 데이터 ───────────────────────────────────────────
// 잘 알려진 몇 편은 고정 매핑, 그 외엔 편명으로 결정적(deterministic) 합성.
// source:'demo'로 표시되어 카드에 "데모" 배지가 붙는다(실제 시각 아님 고지).

const DEMO_TABLE: Record<string, { dep: string; arr: string; depH: number; depM: number; dur: number; term?: string }> = {
  KE1275: { dep: 'ICN', arr: 'CJU', depH: 9, depM: 5, dur: 75, term: '2' },
  KE705: { dep: 'ICN', arr: 'NRT', depH: 10, depM: 30, dur: 150, term: '2' },
  OZ8901: { dep: 'GMP', arr: 'CJU', depH: 8, depM: 0, dur: 70 },
  OZ102: { dep: 'ICN', arr: 'SGN', depH: 14, depM: 40, dur: 330, term: '1' },
  '7C101': { dep: 'ICN', arr: 'CJU', depH: 7, depM: 15, dur: 70, term: '1' },
  LJ201: { dep: 'ICN', arr: 'DAD', depH: 20, depM: 10, dur: 300, term: '1' },
  BX8801: { dep: 'PUS', arr: 'CJU', depH: 11, depM: 0, dur: 60 },
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function demoFlight(p: ParsedFlight, date: string): FlightInfo {
  const known = DEMO_TABLE[p.display]
  const routes: [string, string, number][] = [
    ['ICN', 'CJU', 75],
    ['GMP', 'CJU', 70],
    ['ICN', 'NRT', 150],
    ['ICN', 'DAD', 300],
    ['PUS', 'CJU', 60],
  ]
  // 미등록 편명은 편번호로 결정적 선택(같은 편명이면 항상 같은 결과)
  const n = parseInt(p.flightNumber, 10) || 0
  const r = known
    ? { dep: known.dep, arr: known.arr, depH: known.depH, depM: known.depM, dur: known.dur, term: known.term }
    : (() => {
        const [dep, arr, dur] = routes[n % routes.length]
        const depH = 6 + (n % 12) // 06~17시
        return { dep, arr, depH, depM: (n % 4) * 15, dur, term: undefined as string | undefined }
      })()

  const depAt = `${date}T${pad2(r.depH)}:${pad2(r.depM)}:00`
  const total = r.depH * 60 + r.depM + r.dur
  const arrH = Math.floor(total / 60) % 24
  const arrM = total % 60
  // 도착이 자정을 넘기면 다음 날짜로
  const overnight = Math.floor((r.depH * 60 + r.depM + r.dur) / (24 * 60))
  const arrDate = overnight > 0 ? addDays(date, overnight) : date
  const arrAt = `${arrDate}T${pad2(arrH)}:${pad2(arrM)}:00`

  return {
    number: p.display,
    carrier: p.carrierCode,
    dep: { iata: r.dep, at: depAt, terminal: r.term },
    arr: { iata: r.arr, at: arrAt },
    source: 'demo',
  }
}

function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** ISO 시각에서 "HH:mm"만. 없으면 빈 문자열. */
export function flightTime(at?: string): string {
  if (!at) return ''
  const m = at.match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : ''
}

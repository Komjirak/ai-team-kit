import { airport, AIRPORT_LIST } from '../data/airports'
import type { FlightInfo, FlightLeg } from '../data/types'

// ─────────────────────────────────────────────────────────────
// 항공편 — 날짜 + 편명 + 출발/도착 공항·시각을 직접 입력해 저장한다.
// (외부 조회 API 없이 동작. 공항 코드는 airports 사전으로 이름·도시·좌표를 보강.)
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

/** 저장 전 공항 이름·도시·좌표를 사전에서 채워 넣는다. */
export function enrichFlight(f: FlightInfo): FlightInfo {
  return { ...f, dep: enrichLeg(f.dep), arr: enrichLeg(f.arr) }
}

export interface FlightFormInput {
  number?: string // 편명 (예: KE1275) — 선택
  depIata: string // 출발 공항 IATA (예: ICN)
  depTime?: string // "HH:mm" — 출발 시각(선택)
  depTerminal?: string // 터미널(선택)
  arrIata: string // 도착 공항 IATA
  arrTime?: string // "HH:mm" — 도착 시각(선택)
  date: string // 출발 날짜 yyyy-mm-dd (일정 Day)
  overnight?: boolean // 도착이 다음날이면 true(+1)
}

/** 유효한 IATA(영문 3자)인지. */
export function isIata(s?: string): boolean {
  return !!s && /^[A-Za-z]{3}$/.test(s.trim())
}

/** 직접 입력값으로 FlightInfo를 만든다(공항 정보 보강 포함). */
export function buildFlight(input: FlightFormInput): FlightInfo {
  const dep = input.depIata.trim().toUpperCase()
  const arr = input.arrIata.trim().toUpperCase()
  const arrDate = input.overnight ? addDays(input.date, 1) : input.date

  const parsed = input.number ? parseFlightNumber(input.number) : null
  const number = parsed?.display ?? (input.number || '').trim().toUpperCase()

  const info: FlightInfo = {
    number,
    carrier: parsed?.carrierCode,
    dep: {
      iata: dep,
      at: input.depTime ? `${input.date}T${input.depTime}:00` : undefined,
      terminal: input.depTerminal?.trim() || undefined,
    },
    arr: {
      iata: arr,
      at: input.arrTime ? `${arrDate}T${input.arrTime}:00` : undefined,
    },
    source: 'manual',
  }
  return enrichFlight(info)
}

function addDays(date: string, days: number): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return date
  // 로컬 날짜 부품으로만 계산 → toISOString의 UTC 변환에 의한 하루 밀림 방지
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

/** ISO 시각에서 "HH:mm"만. 없으면 빈 문자열. */
export function flightTime(at?: string): string {
  if (!at) return ''
  const m = at.match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : ''
}

/** 자동완성용 공항 목록(코드 · 이름 · 도시). airports 사전에서 파생. */
export const airportOptions = AIRPORT_LIST

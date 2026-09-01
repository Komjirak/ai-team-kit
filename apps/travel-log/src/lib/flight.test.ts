import { describe, it, expect } from 'vitest'
import { parseFlightNumber, lookupFlight, flightTime } from './flight'

// 환경: 테스트는 Firebase 미설정 → isDemo=true 경로(합성/샘플)로 동작.

describe('parseFlightNumber', () => {
  it('일반 편명', () => {
    expect(parseFlightNumber('KE1275')).toEqual({ carrierCode: 'KE', flightNumber: '1275', display: 'KE1275' })
  })
  it('공백·소문자·선행 0 정규화', () => {
    expect(parseFlightNumber(' ke 001 ')).toEqual({ carrierCode: 'KE', flightNumber: '1', display: 'KE001' })
  })
  it('숫자로 시작하는 항공사 코드(7C 제주항공)', () => {
    expect(parseFlightNumber('7C101')).toEqual({ carrierCode: '7C', flightNumber: '101', display: '7C101' })
  })
  it('편명 뒤 접미 문자 허용', () => {
    expect(parseFlightNumber('KE1275A')?.display).toBe('KE1275')
  })
  it('형식 오류는 null', () => {
    expect(parseFlightNumber('')).toBeNull()
    expect(parseFlightNumber('12')).toBeNull() // 알파벳 없음
    expect(parseFlightNumber('KE')).toBeNull() // 숫자 없음
    expect(parseFlightNumber('K1')).toBeNull() // 코드 1자
  })
})

describe('flightTime', () => {
  it('ISO에서 HH:mm 추출', () => {
    expect(flightTime('2026-09-18T09:05:00')).toBe('09:05')
    expect(flightTime('2026-09-18T14:35:00+09:00')).toBe('14:35')
    expect(flightTime(undefined)).toBe('')
  })
})

describe('lookupFlight (데모)', () => {
  it('잘못된 편명은 throw', async () => {
    await expect(lookupFlight('12', '2026-09-18')).rejects.toThrow('flight.bad_number')
  })
  it('날짜 없으면 throw', async () => {
    await expect(lookupFlight('KE1275', '')).rejects.toThrow()
  })
  it('알려진 편명 → 출발/도착 + 공항 좌표 보강', async () => {
    const f = await lookupFlight('KE1275', '2026-09-18')
    expect(f.number).toBe('KE1275')
    expect(f.dep.iata).toBe('ICN')
    expect(f.arr.iata).toBe('CJU')
    expect(f.dep.city).toBe('서울')
    expect(f.dep.lat).toBeCloseTo(37.4602, 3)
    expect(f.arr.lat).toBeCloseTo(33.5113, 3)
    expect(flightTime(f.dep.at)).toBe('09:05')
  })
  it('미등록 편명도 결정적으로 합성(같은 편명=같은 결과)', async () => {
    const a = await lookupFlight('ZZ777', '2026-09-18')
    const b = await lookupFlight('ZZ777', '2026-09-18')
    expect(a).toEqual(b)
    expect(a.dep.iata).toBeTruthy()
    expect(a.arr.iata).toBeTruthy()
    expect(a.source).toBe('demo')
  })
  it('출발 시각은 요청 날짜 위에 놓인다', async () => {
    const f = await lookupFlight('KE705', '2026-12-24')
    expect(f.dep.at?.startsWith('2026-12-24')).toBe(true)
  })
})

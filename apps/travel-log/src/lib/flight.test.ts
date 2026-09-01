import { describe, it, expect } from 'vitest'
import { parseFlightNumber, buildFlight, flightTime, isIata } from './flight'

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
  it('형식 오류는 null', () => {
    expect(parseFlightNumber('12')).toBeNull() // 알파벳 없음
    expect(parseFlightNumber('KE')).toBeNull() // 숫자 없음
  })
})

describe('isIata', () => {
  it('영문 3자만 통과', () => {
    expect(isIata('ICN')).toBe(true)
    expect(isIata('icn')).toBe(true)
    expect(isIata('IC')).toBe(false)
    expect(isIata('ICN1')).toBe(false)
    expect(isIata('')).toBe(false)
  })
})

describe('flightTime', () => {
  it('ISO에서 HH:mm 추출', () => {
    expect(flightTime('2026-09-18T09:05:00')).toBe('09:05')
    expect(flightTime(undefined)).toBe('')
  })
})

describe('buildFlight (직접 입력)', () => {
  it('공항 코드로 이름·도시·좌표 보강', () => {
    const f = buildFlight({
      number: 'KE1275', depIata: 'icn', depTime: '09:05', depTerminal: '2',
      arrIata: 'cju', arrTime: '10:20', date: '2026-09-18',
    })
    expect(f.number).toBe('KE1275')
    expect(f.dep.iata).toBe('ICN')
    expect(f.dep.airport).toBe('인천국제공항')
    expect(f.dep.city).toBe('서울')
    expect(f.dep.terminal).toBe('2')
    expect(f.dep.lat).toBeCloseTo(37.4602, 3)
    expect(f.arr.iata).toBe('CJU')
    expect(f.arr.lat).toBeCloseTo(33.5113, 3)
    expect(flightTime(f.dep.at)).toBe('09:05')
    expect(f.source).toBe('manual')
  })
  it('시각은 출발 날짜 위에 놓인다', () => {
    const f = buildFlight({ number: 'KE705', depIata: 'ICN', depTime: '10:30', arrIata: 'NRT', arrTime: '13:00', date: '2026-12-24' })
    expect(f.dep.at).toBe('2026-12-24T10:30:00')
    expect(f.arr.at).toBe('2026-12-24T13:00:00')
  })
  it('다음날 도착(+1)이면 도착 날짜가 하루 뒤', () => {
    const f = buildFlight({ number: 'OZ102', depIata: 'ICN', depTime: '23:30', arrIata: 'SGN', arrTime: '03:20', date: '2026-09-18', overnight: true })
    expect(f.dep.at).toBe('2026-09-18T23:30:00')
    expect(f.arr.at).toBe('2026-09-19T03:20:00')
  })
  it('미등록 공항 코드는 코드만 유지(보강 없음)', () => {
    const f = buildFlight({ number: 'AA100', depIata: 'XYZ', arrIata: 'ICN', date: '2026-09-18' })
    expect(f.dep.iata).toBe('XYZ')
    expect(f.dep.airport).toBeUndefined()
    expect(f.arr.airport).toBe('인천국제공항')
  })
  it('시각 미입력이면 at 없음', () => {
    const f = buildFlight({ number: 'KE1275', depIata: 'ICN', arrIata: 'CJU', date: '2026-09-18' })
    expect(f.dep.at).toBeUndefined()
    expect(f.arr.at).toBeUndefined()
  })
})

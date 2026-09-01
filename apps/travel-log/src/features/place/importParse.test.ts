import { describe, it, expect } from 'vitest'
import { parseMapsUrl, extractMapLinks, isShortMapLink, isMapLink, parseImport } from './importParse'

describe('parseImport — Takeout 목록 CSV (Title,Note,URL)', () => {
  it('제목 + URL 좌표를 함께 읽는다', () => {
    const csv = [
      'Title,Note,URL',
      '"센소지",,"https://www.google.com/maps/place/%EC%84%BC%EC%86%8C%EC%A7%80/@35.7148,139.7967,17z"',
      '"시부야 스크램블",,"https://www.google.com/maps/place/x/@35.6595,139.7005,17z"',
    ].join('\n')
    const items = parseImport(csv)
    expect(items).toHaveLength(2)
    expect(items[0].name).toBe('센소지')
    expect(items[0].lat).toBeCloseTo(35.7148, 3)
    expect(items[1].name).toBe('시부야 스크램블')
    expect(items[1].lng).toBeCloseTo(139.7005, 3)
  })
})

describe('parseMapsUrl', () => {
  it('/maps/place/이름/@lat,lng 에서 이름·좌표', () => {
    const r = parseMapsUrl('https://www.google.com/maps/place/성수연방/@37.5445,127.0557,17z')
    expect(r?.name).toBe('성수연방')
    expect(r?.lat).toBeCloseTo(37.5445, 3)
    expect(r?.lng).toBeCloseTo(127.0557, 3)
  })
  it('!3d!4d 좌표를 @중심좌표보다 우선', () => {
    const r = parseMapsUrl(
      'https://www.google.com/maps/place/X/@37.1,127.1,17z/data=!3d37.5445!4d127.0557',
    )
    expect(r?.lat).toBeCloseTo(37.5445, 3)
    expect(r?.lng).toBeCloseTo(127.0557, 3)
  })
  it('q=lat,lng', () => {
    const r = parseMapsUrl('https://maps.google.com/?q=33.5113,126.4930')
    expect(r?.lat).toBeCloseTo(33.5113, 3)
    expect(r?.lng).toBeCloseTo(126.493, 3)
  })
  it('URL 인코딩된 한글 이름 디코드', () => {
    const r = parseMapsUrl('https://www.google.com/maps/place/%EC%B9%B4%ED%8E%98%20%EB%8D%B8%EB%AC%B8%EB%8F%84/@33.54,126.66,17z')
    expect(r?.name).toBe('카페 델문도')
  })
  it('장소 정보가 없으면 null', () => {
    expect(parseMapsUrl('https://www.google.com/maps')).toBeNull()
  })
})

describe('링크 감지', () => {
  it('extractMapLinks는 지도 링크만', () => {
    const text = '여기 좋아 https://maps.app.goo.gl/abc123 그리고 https://naver.me/x 도'
    expect(extractMapLinks(text)).toEqual(['https://maps.app.goo.gl/abc123'])
  })
  it('여러 링크', () => {
    const text = 'https://maps.app.goo.gl/a\nhttps://www.google.com/maps/place/B/@1.0,2.0'
    expect(extractMapLinks(text)).toHaveLength(2)
  })
  it('단축/일반 구분', () => {
    expect(isShortMapLink('https://maps.app.goo.gl/abc')).toBe(true)
    expect(isShortMapLink('https://www.google.com/maps/place/x/@1,2')).toBe(false)
    expect(isMapLink('https://www.google.com/maps/place/x')).toBe(true)
    expect(isMapLink('https://example.com')).toBe(false)
  })
})

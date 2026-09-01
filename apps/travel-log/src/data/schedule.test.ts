import { describe, it, expect } from 'vitest'
import { tripDates, toLocalYmd } from './schedule'

// 하루 밀림 회귀 테스트. 고친 코드는 모든 타임존에서 옳지만, 옛 toISOString 방식은
// UTC+ 지역(예: TZ=Asia/Seoul)에서만 9/15를 9/14로 밀었다 → 그 환경에서 돌리면 회귀를 잡는다.

describe('tripDates (타임존 안전)', () => {
  it('시작~종료를 그대로, 하루 밀림 없이 나열', () => {
    expect(tripDates('2026-09-15', '2026-09-21')).toEqual([
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
      '2026-09-18',
      '2026-09-19',
      '2026-09-20',
      '2026-09-21',
    ])
  })
  it('종료 미지정이면 시작 하루만', () => {
    expect(tripDates('2026-09-15')).toEqual(['2026-09-15'])
  })
  it('종료가 시작보다 빠르면 시작 하루만', () => {
    expect(tripDates('2026-09-15', '2026-09-10')).toEqual(['2026-09-15'])
  })
  it('시작 미지정이면 빈 배열', () => {
    expect(tripDates(undefined, '2026-09-21')).toEqual([])
  })
})

describe('toLocalYmd', () => {
  it('로컬 날짜 부품으로 yyyy-mm-dd', () => {
    expect(toLocalYmd(new Date(2026, 8, 15))).toBe('2026-09-15') // month는 0-based
  })
})

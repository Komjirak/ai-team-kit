import { describe, it, expect } from 'vitest'
import {
  computeSettlement,
  minTransfers,
  splitEqual,
  transferKey,
  type MemberBalance,
  type Transfer,
} from './settlement'
import type { Expense } from './types'

// 테스트 헬퍼: 최소 필드만 갖춘 Expense
let seq = 0
function ex(amount: number, paidBy: string, participants: string[]): Expense {
  seq++
  return {
    id: `e${seq}`,
    tripId: 't',
    title: `expense ${seq}`,
    amount,
    paidBy,
    participants,
    createdBy: paidBy,
    createdAt: seq,
  }
}

// 이체 목록을 적용했을 때 모든 멤버가 0으로 수렴하는지 검사하는 불변식.
// 각 멤버: (받은 돈) - (보낸 돈) === net.
function assertTransfersZeroOut(perMember: MemberBalance[], transfers: Transfer[]) {
  const incoming = new Map<string, number>()
  const outgoing = new Map<string, number>()
  for (const t of transfers) {
    expect(t.amount).toBeGreaterThan(0) // 0원·음수 이체 없음
    incoming.set(t.to, (incoming.get(t.to) ?? 0) + t.amount)
    outgoing.set(t.from, (outgoing.get(t.from) ?? 0) + t.amount)
  }
  for (const m of perMember) {
    const net = (incoming.get(m.userId) ?? 0) - (outgoing.get(m.userId) ?? 0)
    expect(net).toBe(m.net)
  }
}

describe('splitEqual — 정수 반올림, 합계 보존', () => {
  it('나눠떨어지면 균등', () => {
    expect(splitEqual(4000, 4)).toEqual([1000, 1000, 1000, 1000])
  })
  it('나머지는 앞에서부터 1원씩(결정적), 합계는 amount', () => {
    const s = splitEqual(10000, 3)
    expect(s).toEqual([3334, 3333, 3333])
    expect(s.reduce((a, b) => a + b, 0)).toBe(10000)
  })
  it('나머지 2원도 앞 두 명에게', () => {
    const s = splitEqual(3002, 3)
    expect(s).toEqual([1001, 1001, 1000])
    expect(s.reduce((a, b) => a + b, 0)).toBe(3002)
  })
  it('0원은 전부 0', () => {
    expect(splitEqual(0, 3)).toEqual([0, 0, 0])
  })
})

describe('(a) 비용 15건 — 수기 검산과 일치', () => {
  // 4인(a,b,c,d), 각 비용 4000원을 전원 4등분(1인당 1000).
  // 결제자 회전: a·b·c 각 4건, d 3건 = 15건.
  const members = ['a', 'b', 'c', 'd']
  const payers = ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c', 'd', 'd', 'd']
  const expenses = payers.map((p) => ex(4000, p, members))

  const r = computeSettlement(expenses, members)

  it('총 지출 = 60,000원', () => {
    expect(r.totalSpent).toBe(60000)
  })
  it('멤버별 net = 수기 계산과 일치 (a,b,c +1000 / d -3000)', () => {
    const net = Object.fromEntries(r.perMember.map((m) => [m.userId, m.net]))
    expect(net).toEqual({ a: 1000, b: 1000, c: 1000, d: -3000 })
  })
  it('net 합계 = 0 (불변식)', () => {
    expect(r.perMember.reduce((s, m) => s + m.net, 0)).toBe(0)
  })
  it('이체 목록 = 수기 계산 (d가 a·b·c에게 1000원씩, 3건)', () => {
    expect(r.transfers).toEqual([
      { from: 'd', to: 'a', amount: 1000 },
      { from: 'd', to: 'b', amount: 1000 },
      { from: 'd', to: 'c', amount: 1000 },
    ])
  })
  it('이체 합계 = 채권 총액 3000', () => {
    expect(r.transfers.reduce((s, t) => s + t.amount, 0)).toBe(3000)
  })
  it('이체 적용 시 전원 0으로 수렴', () => {
    assertTransfersZeroOut(r.perMember, r.transfers)
  })
})

describe('(b) 3인 나눠떨어지지 않는 금액 — 반올림 나머지 규칙(합계 보존)', () => {
  // a가 10,000원을 a,b,c 3등분: [3334,3333,3333]. a net +6666, b·c -3333.
  const r = computeSettlement([ex(10000, 'a', ['a', 'b', 'c'])], ['a', 'b', 'c'])

  it('net: a +6666, b -3333, c -3333 · 합계 0', () => {
    const net = Object.fromEntries(r.perMember.map((m) => [m.userId, m.net]))
    expect(net).toEqual({ a: 6666, b: -3333, c: -3333 })
    expect(r.perMember.reduce((s, m) => s + m.net, 0)).toBe(0)
  })
  it('이체: b→a 3333, c→a 3333 (합 6666, 1원 오차 없음)', () => {
    expect(r.transfers).toEqual([
      { from: 'b', to: 'a', amount: 3333 },
      { from: 'c', to: 'a', amount: 3333 },
    ])
    expect(r.transfers.reduce((s, t) => s + t.amount, 0)).toBe(6666)
  })
  it('전원 0으로 수렴', () => {
    assertTransfersZeroOut(r.perMember, r.transfers)
  })
})

describe('(c) 전원 동일 결제 — 이체 0건', () => {
  const members = ['a', 'b', 'c', 'd']
  // 각자 4000원씩 결제, 매번 전원 4등분 → 모두 net 0
  const expenses = members.map((m) => ex(4000, m, members))
  const r = computeSettlement(expenses, members)

  it('모든 net 0', () => {
    expect(r.perMember.every((m) => m.net === 0)).toBe(true)
  })
  it('이체 0건', () => {
    expect(r.transfers).toEqual([])
  })
})

describe('엣지 · 불변식', () => {
  it('참여자 없는 비용은 정산에서 제외(합계 불변식 보존)', () => {
    const r = computeSettlement(
      [ex(5000, 'a', []), ex(3000, 'a', ['a', 'b'])],
      ['a', 'b'],
    )
    expect(r.totalSpent).toBe(3000)
    expect(r.perMember.reduce((s, m) => s + m.net, 0)).toBe(0)
  })

  it('결제자가 참여자에 없어도 잔액이 맞는다', () => {
    // a가 6000 결제하되 자기는 안 먹음(b,c만 3등분… 2등분): b,c 각 3000
    const r = computeSettlement([ex(6000, 'a', ['b', 'c'])], ['a', 'b', 'c'])
    const net = Object.fromEntries(r.perMember.map((m) => [m.userId, m.net]))
    expect(net).toEqual({ a: 6000, b: -3000, c: -3000 })
    assertTransfersZeroOut(r.perMember, r.transfers)
  })

  it('나간 멤버(memberIds 밖)가 낀 비용도 합계 불변식 유지', () => {
    // x는 현재 멤버가 아니지만 비용에 등장 → 잔액에 포함되어 sum net = 0
    const r = computeSettlement([ex(9000, 'a', ['a', 'b', 'x'])], ['a', 'b'])
    expect(r.perMember.reduce((s, m) => s + m.net, 0)).toBe(0)
    expect(r.perMember.some((m) => m.userId === 'x')).toBe(true)
    assertTransfersZeroOut(r.perMember, r.transfers)
  })

  it('뒤섞인 15건(부분 참여·비정수 분담)에서도 불변식 유지', () => {
    const members = ['a', 'b', 'c', 'd']
    const messy: Expense[] = [
      ex(13333, 'a', ['a', 'b', 'c']),
      ex(9999, 'b', ['a', 'b', 'c', 'd']),
      ex(5000, 'c', ['c', 'd']),
      ex(7777, 'd', ['a', 'd']),
      ex(1, 'a', ['a', 'b', 'c', 'd']),
      ex(20000, 'b', ['a', 'b']),
      ex(3333, 'c', ['a', 'b', 'c']),
      ex(4500, 'd', ['b', 'c', 'd']),
      ex(100, 'a', ['a']),
      ex(88888, 'b', ['a', 'b', 'c', 'd']),
      ex(250, 'c', ['a', 'c']),
      ex(6001, 'd', ['a', 'b', 'c', 'd']),
      ex(999, 'a', ['b', 'c']),
      ex(12000, 'c', ['a', 'b', 'c', 'd']),
      ex(7, 'd', ['a', 'b']),
    ]
    const r = computeSettlement(messy, members)
    // 합계 불변식
    expect(r.totalSpent).toBe(messy.reduce((s, e) => s + e.amount, 0))
    expect(r.perMember.reduce((s, m) => s + m.net, 0)).toBe(0)
    // 이체 총액 = 채권 총액
    const credit = r.perMember.reduce((s, m) => s + Math.max(0, m.net), 0)
    expect(r.transfers.reduce((s, t) => s + t.amount, 0)).toBe(credit)
    // 최소 이체 상한: 참여 멤버 수 - 1
    expect(r.transfers.length).toBeLessThanOrEqual(r.perMember.filter((m) => m.net !== 0).length - 1 || 0)
    assertTransfersZeroOut(r.perMember, r.transfers)
  })
})

describe('minTransfers · transferKey', () => {
  it('결정적 순서(net 큰 순, 동률 id 순)', () => {
    const bal: MemberBalance[] = [
      { userId: 'a', paid: 0, owed: 5000, net: -5000 },
      { userId: 'b', paid: 3000, owed: 0, net: 3000 },
      { userId: 'c', paid: 2000, owed: 0, net: 2000 },
    ]
    expect(minTransfers(bal)).toEqual([
      { from: 'a', to: 'b', amount: 3000 },
      { from: 'a', to: 'c', amount: 2000 },
    ])
  })
  it('transferKey', () => {
    expect(transferKey({ from: 'x', to: 'y' })).toBe('x>y')
  })
})

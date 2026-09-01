import type { Expense } from './types'

// ─────────────────────────────────────────────────────────────
// 정산 — 순수 함수. 이 제품의 존재 이유(주연)이고, 1원이라도 틀리면
// 신뢰가 깨진다(BD kill K2). 부동소수점을 쓰지 않고 정수(원)로만 계산한다.
//
// 규칙(오픈이슈 A 확정):
//  - 각 비용을 participants에 1/N 균등 분담.
//  - 정수 반올림: base = floor(amount/n), 나머지 r = amount - base*n 원을
//    participants 배열 순서로 앞에서부터 1원씩 배분(결정적).
//  - paidBy는 +amount, 각 참여자는 -자기몫.
//  - net = 낸 돈 - 쓸 몫. 부채자→채권자 그리디 두 포인터로 최소 이체 산출.
//
// 불변식(테스트로 고정):
//  - 각 비용의 분담 합 = amount (원 단위 보존).
//  - 모든 멤버 net의 합 = 0.
//  - 이체 합 = 채권 총액, 이체 적용 후 모든 잔액이 정확히 0으로 수렴.
// ─────────────────────────────────────────────────────────────

export interface MemberBalance {
  userId: string
  paid: number // 총 결제액
  owed: number // 총 부담액(자기 몫 합)
  net: number  // paid - owed  (>0 받을 사람, <0 갚을 사람)
}

export interface Transfer {
  from: string // 갚을 사람 (net < 0)
  to: string   // 받을 사람 (net > 0)
  amount: number
}

export interface SettlementResult {
  totalSpent: number
  perMember: MemberBalance[]
  transfers: Transfer[]
}

/** 이체 하나를 식별하는 키. "정산됨" 상태를 이 키로 영속한다. */
export function transferKey(t: { from: string; to: string }): string {
  return `${t.from}>${t.to}`
}

/**
 * 한 비용을 participants에 1/N 균등 분담한 정수(원) 배열을 돌려준다.
 * 반환 배열의 합은 정확히 amount와 같다. participants 순서에 대응.
 */
export function splitEqual(amount: number, participantCount: number): number[] {
  const n = participantCount
  if (n <= 0) return []
  const a = Math.max(0, Math.round(amount))
  const base = Math.floor(a / n)
  const remainder = a - base * n // 0..n-1
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0))
}

/**
 * 한 비용의 참여자별 부담액(원)을 돌려준다.
 *  - splitMode === 'custom' 이고 shares 합이 amount와 정확히 같으면 그 값을 쓴다(불균등).
 *  - 그 외에는 participants 1/N 균등(splitEqual). custom인데 합이 안 맞는
 *    비정상 레코드는 균등으로 폴백해 합계 불변식(owed 합 = amount)을 지킨다.
 * 반환 맵의 합은 항상 정확히 amount와 같다.
 */
export function expenseOwed(e: Expense): Map<string, number> {
  const amount = Math.max(0, Math.round(e.amount))
  const parts = e.participants
  const out = new Map<string, number>()
  if (parts.length === 0) return out

  if (e.splitMode === 'custom' && e.shares) {
    let sum = 0
    for (const p of parts) {
      const v = Math.max(0, Math.round(e.shares[p] ?? 0))
      out.set(p, v)
      sum += v
    }
    if (sum === amount) return out
    out.clear() // 합 불일치 → 균등 폴백
  }

  const eq = splitEqual(amount, parts.length)
  parts.forEach((p, i) => out.set(p, eq[i]))
  return out
}

/**
 * 비용 목록과 멤버 목록으로 정산 결과를 계산한다.
 * memberIds에 없더라도 비용에 등장하는 userId(나간 멤버 등)는 잔액에 포함해
 * 합계 불변식(sum net = 0)을 지킨다. perMember는 memberIds 우선으로 정렬한다.
 */
export function computeSettlement(expenses: Expense[], memberIds: string[]): SettlementResult {
  const paid = new Map<string, number>()
  const owed = new Map<string, number>()
  const seen = new Set<string>(memberIds)

  const bump = (m: Map<string, number>, id: string, v: number) => {
    m.set(id, (m.get(id) ?? 0) + v)
    seen.add(id)
  }

  let totalSpent = 0
  for (const e of expenses) {
    const amount = Math.max(0, Math.round(e.amount))
    const parts = e.participants
    if (parts.length === 0) continue // 참여자 없는 비용은 정산에서 제외(합계 불변식 보존)
    totalSpent += amount
    bump(paid, e.paidBy, amount)
    expenseOwed(e).forEach((v, p) => bump(owed, p, v))
  }

  // 결정적 순서: memberIds 우선(입력 순), 그 밖의 등장 유저는 정렬해 뒤에
  const extras = [...seen].filter((id) => !memberIds.includes(id)).sort()
  const order = [...memberIds.filter((id) => seen.has(id)), ...extras]

  const perMember: MemberBalance[] = order.map((userId) => {
    const p = paid.get(userId) ?? 0
    const o = owed.get(userId) ?? 0
    return { userId, paid: p, owed: o, net: p - o }
  })

  const transfers = minTransfers(perMember)
  return { totalSpent, perMember, transfers }
}

/**
 * 부채자→채권자 그리디 두 포인터 최소 이체.
 * 결정적: 채권/부채 각각을 (net 큰 순, 동률이면 userId 순)으로 정렬.
 */
export function minTransfers(balances: MemberBalance[]): Transfer[] {
  const creditors = balances
    .filter((b) => b.net > 0)
    .map((b) => ({ id: b.userId, rem: b.net }))
    .sort((a, b) => b.rem - a.rem || (a.id < b.id ? -1 : 1))
  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ id: b.userId, rem: -b.net }))
    .sort((a, b) => b.rem - a.rem || (a.id < b.id ? -1 : 1))

  const transfers: Transfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]
    const c = creditors[j]
    const amt = Math.min(d.rem, c.rem)
    if (amt > 0) transfers.push({ from: d.id, to: c.id, amount: amt })
    d.rem -= amt
    c.rem -= amt
    if (d.rem === 0) i++
    if (c.rem === 0) j++
  }
  return transfers
}

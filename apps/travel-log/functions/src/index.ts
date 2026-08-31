import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { logger } from 'firebase-functions'
import {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentWritten,
} from 'firebase-functions/v2/firestore'

// ─────────────────────────────────────────────────────────────
// 간직.log — FCM 웹푸시 3종 (PRD §6-2).
//   (a) trips.memberIds 증가 → 기존 멤버에게 "합류"
//   (b) schedules 변경(생성/수정/삭제) → 본인 제외 멤버에게 "일정 변경"
//   (c) settlement_requested 알림 생성 → 여행 멤버에게 "정산 요청"
// 대상 멤버의 users/{uid}.fcmTokens 로 전송한다. 실패 토큰은 정리(만료 대응).
// 인앱 알림(notifications 컬렉션)은 클라이언트가 이미 만든다 — 이 함수는 '푸시'만.
// ─────────────────────────────────────────────────────────────

initializeApp()
const db = getFirestore()

async function tokensFor(userIds: string[]): Promise<{ token: string; userId: string }[]> {
  const out: { token: string; userId: string }[] = []
  await Promise.all(
    [...new Set(userIds)].map(async (id) => {
      const snap = await db.doc(`users/${id}`).get()
      const tokens = (snap.data()?.fcmTokens as string[] | undefined) ?? []
      for (const token of tokens) out.push({ token, userId: id })
    }),
  )
  return out
}

async function push(
  targets: { token: string; userId: string }[],
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<void> {
  if (targets.length === 0) return
  const res = await getMessaging().sendEachForMulticast({
    tokens: targets.map((t) => t.token),
    notification: { title, body },
    data,
  })
  logger.info('push', { title, success: res.successCount, failure: res.failureCount })

  // 만료/무효 토큰 정리(다중 기기·토큰 만료 엣지, PRD §9)
  const stale = new Map<string, string[]>()
  res.responses.forEach((r, i) => {
    const code = r.error?.code
    if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-argument') {
      const { token, userId } = targets[i]
      stale.set(userId, [...(stale.get(userId) ?? []), token])
    }
  })
  const { FieldValue } = await import('firebase-admin/firestore')
  await Promise.all(
    [...stale].map(([userId, tokens]) =>
      db.doc(`users/${userId}`).update({ fcmTokens: FieldValue.arrayRemove(...tokens) }).catch(() => undefined),
    ),
  )
}

// (a) 합류 — memberIds가 늘면 기존 멤버에게
export const onTripMemberJoined = onDocumentUpdated('trips/{tripId}', async (event) => {
  const before = event.data?.before.data()
  const after = event.data?.after.data()
  if (!before || !after) return
  const beforeIds: string[] = before.memberIds ?? []
  const afterIds: string[] = after.memberIds ?? []
  const added = afterIds.filter((id) => !beforeIds.includes(id))
  if (added.length === 0) return
  const targets = await tokensFor(beforeIds) // 기존 멤버에게 알림
  await push(targets, '새 친구가 합류했어요', `‘${after.title ?? '여행'}’에 새 멤버가 들어왔어요.`, {
    tripId: event.params.tripId,
    type: 'member_joined',
  })
})

// (b) 일정 변경 — 생성/수정/삭제, 본인 제외
export const onScheduleChanged = onDocumentWritten('schedules/{id}', async (event) => {
  const after = event.data?.after.data()
  const before = event.data?.before.data()
  const docData = after ?? before
  if (!docData) return
  const tripId = docData.tripId as string
  const tripSnap = await db.doc(`trips/${tripId}`).get()
  const members: string[] = tripSnap.data()?.memberIds ?? []
  const actor = after?.createdBy as string | undefined
  const recipients = members.filter((id) => id !== actor)
  const targets = await tokensFor(recipients)
  await push(targets, '일정이 바뀌었어요', `‘${tripSnap.data()?.title ?? '여행'}’ 일정이 업데이트됐어요.`, {
    tripId,
    type: 'schedule_changed',
  })
})

// (c) 정산 요청 — settlement_requested 알림 생성 시
export const onSettlementRequested = onDocumentCreated('notifications/{id}', async (event) => {
  const n = event.data?.data()
  if (!n || n.type !== 'settlement_requested') return
  const tripId = n.tripId as string
  const tripSnap = await db.doc(`trips/${tripId}`).get()
  const members: string[] = tripSnap.data()?.memberIds ?? []
  const targets = await tokensFor(members)
  await push(targets, '정산 요청', (n.message as string) ?? '정산을 확인해 주세요.', {
    tripId,
    type: 'settlement_requested',
  })
})

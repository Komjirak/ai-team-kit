import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { fbAuth } from './firebase'
import { toLocalYmd } from '../data/schedule'
import type { ScheduleItem, Trip } from '../data/types'

// ─────────────────────────────────────────────────────────────
// Google Calendar 미러링 (M5 Should · 옵셔널). 인앱 일정이 정본이고,
// 사용자가 원할 때 이 여행의 일정을 본인 구글 캘린더로 "내보낸다".
//
// 앱 자체 OAuth로 처리한다(별도 커넥터 아님): 로그인에 쓰는 Google 계정에
// calendar.events 스코프를 그 순간 추가 동의받아 액세스 토큰을 얻고,
// Calendar REST API로 이벤트를 만든다. googleEventId로 중복을 막는다.
// 전제: GCP 프로젝트에서 "Google Calendar API" 사용 설정 + OAuth 동의화면에
// calendar.events 스코프 등록. 미동의/미설정 시 인앱 일정만 동작(무해).
// ─────────────────────────────────────────────────────────────

const CAL_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
const TZ = 'Asia/Seoul'

/** 캘린더 권한을 그 순간 동의받아 액세스 토큰을 반환한다. */
export async function connectCalendar(): Promise<string> {
  const provider = new GoogleAuthProvider()
  provider.addScope(CAL_SCOPE)
  const result = await signInWithPopup(fbAuth(), provider)
  const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken
  if (!token) throw new Error('calendar.no_token')
  return token
}

function eventBody(trip: Trip, it: ScheduleItem) {
  const summary = it.title
  const description = [it.memo, `— ${trip.title} (간직.log)`].filter(Boolean).join('\n')
  if (it.time) {
    const startDT = `${it.date}T${it.time}:00`
    // 종료는 +1시간(캘린더 표시용 기본값)
    const [h, m] = it.time.split(':').map(Number)
    const end = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const endDT = `${it.date}T${end}:00`
    return {
      summary,
      description,
      start: { dateTime: startDT, timeZone: TZ },
      end: { dateTime: endDT, timeZone: TZ },
    }
  }
  // 종일 이벤트: end.date 는 배타적이라 +1일 (로컬 기준, TZ 밀림 방지)
  const next = new Date(it.date + 'T00:00:00')
  next.setDate(next.getDate() + 1)
  const endDate = toLocalYmd(next)
  return { summary, description, start: { date: it.date }, end: { date: endDate } }
}

/**
 * 일정을 구글 캘린더로 내보낸다(있으면 갱신, 없으면 생성).
 * 생성된 이벤트 id는 onEventId로 돌려줘 저장(중복 방지)하게 한다.
 * 성공/실패 건수를 반환한다.
 */
export async function pushScheduleToCalendar(
  token: string,
  trip: Trip,
  items: ScheduleItem[],
  onEventId: (itemId: string, eventId: string) => Promise<void>,
): Promise<{ ok: number; failed: number }> {
  let ok = 0
  let failed = 0
  for (const it of items) {
    if (!it.date) continue
    const existing = it.googleEventId
    const url = existing ? `${API}/${existing}` : API
    const method = existing ? 'PATCH' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(eventBody(trip, it)),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      if (!existing && data.id) await onEventId(it.id, data.id)
      ok++
    } catch {
      failed++
    }
  }
  return { ok, failed }
}

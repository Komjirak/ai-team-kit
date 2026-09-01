import { useState } from 'react'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'
import { Button } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { useToast } from '../../components/ui/Toast'
import { isDemo } from '../../lib/env'
import { connectCalendar, pushScheduleToCalendar } from '../../lib/googleCalendar'

/**
 * 구글 캘린더로 내보내기 (M5 Should · 옵셔널 미러링).
 * 인앱 일정이 정본. 버튼을 누르면 calendar.events 권한을 그 순간 동의받아
 * 이 여행의 일정을 본인 구글 캘린더에 넣는다(중복은 googleEventId로 방지).
 */
export function CalendarExport() {
  const { activeTrip, schedule } = useTrip()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const dated = schedule.filter((s) => s.date)

  async function exportToCalendar() {
    if (!activeTrip) return
    setBusy(true)
    try {
      const token = await connectCalendar()
      const { ok, failed } = await pushScheduleToCalendar(token, activeTrip, dated, (itemId, eventId) =>
        backend.updateScheduleItem(itemId, { googleEventId: eventId }),
      )
      toast.show(
        failed > 0
          ? `${ok}개 넣었어요. ${failed}개는 실패했어요.`
          : `${ok}개 일정을 구글 캘린더에 넣었어요.`,
      )
    } catch {
      toast.show('구글 캘린더 연동을 취소했거나 권한이 없어요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="dl-card p-5">
      <p className="dl-mono text-xs font-bold tracking-wider text-muted">구글 캘린더</p>
      <p className="mt-1 text-sm text-muted">
        이 여행의 일정을 내 구글 캘린더에도 넣어둘 수 있어요. 인앱 일정이 기준이고, 캘린더는 사본이에요.
      </p>
      {isDemo ? (
        <p className="mt-3 rounded-xl bg-surface-container px-4 py-3 text-sm text-muted">
          실제 Google 로그인 상태에서 사용할 수 있어요. (데모 모드에서는 비활성)
        </p>
      ) : (
        <Button
          className="mt-3"
          variant="soft"
          icon="calendar_month"
          loading={busy}
          disabled={dated.length === 0}
          onClick={exportToCalendar}
        >
          {dated.length === 0 ? '내보낼 일정이 없어요' : `일정 ${dated.length}개 구글 캘린더로 내보내기`}
        </Button>
      )}
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-soft">
        <Icon name="info" size={13} /> 처음 누르면 캘린더 권한 동의창이 떠요. 거부해도 인앱 일정은 그대로예요.
      </p>
    </section>
  )
}

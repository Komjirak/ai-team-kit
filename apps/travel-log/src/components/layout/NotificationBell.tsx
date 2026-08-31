import { useState } from 'react'
import { Icon } from '../ui/Icon'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'

const typeIcon: Record<string, string> = {
  member_joined: 'group_add',
  place_added: 'add_location_alt',
  memory_added: 'photo_camera',
  schedule_changed: 'event',
  settlement_requested: 'wallet',
}

export function NotificationBell() {
  const { notifications, unreadCount, activeTrip } = useTrip()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className="dl-focus relative grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-container"
        aria-label={`알림 ${unreadCount}개`}
        onClick={() => {
          setOpen((o) => !o)
          if (!open && activeTrip) backend.markNotificationsRead(activeTrip.id).catch(() => {})
        }}
      >
        <Icon name="notifications" size={22} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="dl-card absolute right-0 z-20 mt-2 w-72 p-2">
            <p className="px-2 py-1.5 font-display text-sm font-bold text-ink">알림</p>
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted">아직 알림이 없어요.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-2 rounded-xl px-2 py-2 hover:bg-surface-container">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                      <Icon name={typeIcon[n.type] ?? 'notifications'} size={16} />
                    </span>
                    <span className="text-sm text-ink">{n.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

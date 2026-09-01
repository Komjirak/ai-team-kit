import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { TABS } from './nav'

/** Mobile bottom tab bar (hidden on md+). The active tab gets a yellow "tab" blob. */
export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-variant/60 bg-surface-warm/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="주요 탭"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-1 pb-2 pt-2 text-[11px] font-semibold ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-9 w-12 place-items-center rounded-full transition-colors ${
                      isActive ? 'bg-tape-yellow/70' : ''
                    }`}
                  >
                    <Icon name={t.icon} size={22} fill={isActive} />
                  </span>
                  <span className="whitespace-nowrap">{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

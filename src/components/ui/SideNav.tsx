import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'

export interface SideNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface SideNavGroup {
  label?: string
  items: SideNavItem[]
}

interface SideNavProps {
  groups: SideNavGroup[]
  ariaLabel: string
  density?: 'comfortable' | 'compact'
  onNavigate?: () => void
}

/** Grouped sidebar (reference 04 structure, dark). Active = rust bar + bold + aria-current. */
export function SideNav({ groups, ariaLabel, density = 'comfortable', onNavigate }: SideNavProps) {
  const row = density === 'compact' ? 'min-h-10 text-sm' : 'min-h-11 text-[0.95rem]'
  return (
    <nav aria-label={ariaLabel} className="space-y-5">
      {groups.map((g, gi) => (
        <div key={g.label ?? gi}>
          {g.label && <p className="eyebrow mb-1.5 px-3 text-muted">{g.label}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-md px-3 no-underline transition-colors ${row} ${
                      isActive
                        ? 'bg-ink font-semibold text-paper before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-full before:bg-rust'
                        : 'text-paper/85 hover:bg-ink/60 hover:text-paper'
                    }`
                  }
                >
                  <it.icon aria-hidden="true" className="size-[1.1rem] shrink-0" />
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

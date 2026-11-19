import { useState } from 'react'
import { Link, Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router'
import {
  CalendarClock,
  Drum,
  Home,
  Menu,
  Package,
  RadioTower,
  RotateCcw,
  Ticket,
  UserRound,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { SideNav, type SideNavGroup } from '../../components/ui/SideNav'
import { NoiseOverlay, TapeLabel, TornEdge } from '../../components/grunge'
import { resetDemoData } from '../resetDemo'
import { useCurrentCustomer } from '../../services/accounts'
import { signOut } from '../../services/session'

const groups: SideNavGroup[] = [
  { items: [{ to: '/portal', label: 'Dashboard', icon: Home, end: true }] },
  {
    label: 'Book',
    items: [
      { to: '/portal/book/rehearsal', label: 'Rehearsal room', icon: CalendarClock },
      { to: '/portal/book/lesson', label: 'Lesson', icon: Drum },
      { to: '/portal/live-streaming', label: 'Live gig streaming', icon: RadioTower },
    ],
  },
  {
    label: 'My stuff',
    items: [
      { to: '/portal/reservations', label: 'Reservations', icon: Ticket },
      { to: '/portal/orders', label: 'Shop inquiries', icon: Package },
      { to: '/portal/profile', label: 'Profile', icon: UserRound },
    ],
  },
]

/** Customer portal: low grunge — torn edge only on the top banner; clean content area. */
export function PortalLayout() {
  const location = useLocation()
  const me = useCurrentCustomer()
  const [drawerOn, setDrawerOn] = useState<string | null>(null)
  const drawerOpen = drawerOn === location.pathname

  const sidebar = (
    <>
      <SideNav groups={groups} ariaLabel="Customer portal" onNavigate={() => setDrawerOn(null)} />
      <div className="mt-8 space-y-3 border-t border-slate px-3 pt-5">
        <Link to="/" className="flex items-center gap-2 text-sm text-paper/85 hover:text-paper">
          <ExternalLink aria-hidden="true" className="size-4" /> Public site
        </Link>
        <button type="button" onClick={resetDemoData} className="flex items-center gap-2 text-sm text-paper/85 hover:text-paper">
          <RotateCcw aria-hidden="true" className="size-4" /> Reset demo data
        </button>
        <button type="button" onClick={signOut} className="flex items-center gap-2 text-sm text-paper/85 hover:text-paper">
          <LogOut aria-hidden="true" className="size-4" /> Sign out
        </button>
      </div>
    </>
  )

  // Customer area requires sign-in (demo, client-side only).
  if (!me) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden border-r border-slate bg-surface lg:sticky lg:top-0 lg:block lg:h-dvh lg:overflow-y-auto">
        <div className="px-5 pt-5 pb-6">
          <Logo size="sm" to="/portal" />
        </div>
        <div className="px-2 pb-8">{sidebar}</div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center justify-between border-b border-slate bg-surface px-4 lg:hidden">
          <Logo size="sm" to="/portal" />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center border border-slate"
            aria-expanded={drawerOpen}
            aria-controls="portal-drawer"
            aria-label={drawerOpen ? 'Close portal menu' : 'Open portal menu'}
            onClick={() => setDrawerOn(drawerOpen ? null : location.pathname)}
          >
            {drawerOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        <div id="portal-drawer" hidden={!drawerOpen} className="border-b border-slate bg-surface px-2 py-4 lg:hidden">
          {sidebar}
        </div>

        {/* Top banner — the only textured element in the portal */}
        <div className="relative overflow-hidden bg-charcoal">
          <NoiseOverlay opacity={0.18} />
          <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-8">
            <TapeLabel tone="rust" rotate={-2}>Demo mode</TapeLabel>
            <p className="text-sm text-paper">
              Signed in as <strong>{me.name}</strong> — demo sign-in (codes shown on screen, not sent). Bookings and payments here are not real.
            </p>
          </div>
        </div>
        <TornEdge className="text-charcoal" side="bottom" seed={12} height={16} />

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-16 sm:px-8">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}

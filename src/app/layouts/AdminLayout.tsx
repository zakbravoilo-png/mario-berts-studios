import { useState } from 'react'
import { Link, Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router'
import {
  Boxes,
  CalendarRange,
  DoorOpen,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  RadioTower,
  RotateCcw,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react'
import { SideNav, type SideNavGroup } from '../../components/ui/SideNav'
import { TapeLabel } from '../../components/grunge'
import { resetDemoData } from '../resetDemo'
import { signOut, useSession } from '../../services/session'

const groups: SideNavGroup[] = [
  { items: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true }] },
  {
    label: 'Operations',
    items: [
      { to: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
      { to: '/admin/rooms', label: 'Rooms & schedule', icon: DoorOpen },
      { to: '/admin/inventory', label: 'Shared inventory', icon: Boxes },
    ],
  },
  {
    label: 'Lessons & services',
    items: [
      { to: '/admin/lessons', label: 'Lesson requests', icon: GraduationCap },
      { to: '/admin/instructors', label: 'Instructors', icon: Users },
      { to: '/admin/streaming', label: 'Streaming inquiries', icon: RadioTower },
      { to: '/admin/products', label: 'Shop products', icon: ShoppingBag },
    ],
  },
  { label: 'Configure', items: [{ to: '/admin/messages', label: 'Messages (outbox)', icon: Mail }, { to: '/admin/settings', label: 'Business settings', icon: Settings }] },
]

/** Admin: lowest grunge. Plain, dense, readable. Visually distinct from the public site. */
export function AdminLayout() {
  const location = useLocation()
  const session = useSession()
  const [drawerOn, setDrawerOn] = useState<string | null>(null)
  const drawerOpen = drawerOn === location.pathname

  const sidebar = (
    <>
      <SideNav groups={groups} ariaLabel="Admin" density="compact" onNavigate={() => setDrawerOn(null)} />
      <div className="mt-6 space-y-2 border-t border-slate px-3 pt-4 text-sm">
        <Link to="/" className="flex items-center gap-2 text-paper/85 hover:text-paper">
          <ExternalLink aria-hidden="true" className="size-4" /> Public site
        </Link>
        <button type="button" onClick={resetDemoData} className="flex items-center gap-2 text-paper/85 hover:text-paper">
          <RotateCcw aria-hidden="true" className="size-4" /> Reset demo data
        </button>
        <button type="button" onClick={signOut} className="flex items-center gap-2 text-paper/85 hover:text-paper">
          <LogOut aria-hidden="true" className="size-4" /> Sign out
        </button>
      </div>
    </>
  )

  // Admin requires the demo admin sign-in. NOT security — see README.
  if (session?.role !== 'admin') return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-dvh bg-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {/* DEMO ADMIN banner */}
      <div role="note" className="flex flex-wrap items-center justify-center gap-3 border-b-2 border-rust bg-surface px-4 py-2 text-center">
        <TapeLabel tone="rust">Demo admin</TapeLabel>
        <p className="text-xs text-paper sm:text-sm">
          Signed in as {session.email} — demo sign-in runs in the browser and is not real security. All data is mock.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="hidden border-r border-slate bg-surface lg:sticky lg:top-0 lg:block lg:h-dvh lg:overflow-y-auto">
          <div className="flex items-baseline gap-2 px-5 py-4">
            <Link to="/admin" className="inline-flex items-center gap-2 font-display text-xl no-underline">
              <img src="/brand/mbs-mark.svg" alt="" width={636} height={656} className="h-8 w-auto" />
              MBS Admin
            </Link>
          </div>
          <div className="px-2 pb-8">{sidebar}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex h-12 items-center justify-between border-b border-slate bg-surface px-4 lg:hidden">
            <Link to="/admin" className="inline-flex items-center gap-2 font-display text-lg no-underline">
              <img src="/brand/mbs-mark.svg" alt="" width={636} height={656} className="h-7 w-auto" />
              MBS Admin
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center border border-slate"
              aria-expanded={drawerOpen}
              aria-controls="admin-drawer"
              aria-label={drawerOpen ? 'Close admin menu' : 'Open admin menu'}
              onClick={() => setDrawerOn(drawerOpen ? null : location.pathname)}
            >
              {drawerOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
          <div id="admin-drawer" hidden={!drawerOpen} className="border-b border-slate bg-surface px-2 py-3 lg:hidden">
            {sidebar}
          </div>
          <main id="main" tabIndex={-1} className="px-4 py-6 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
      <ScrollRestoration />
    </div>
  )
}

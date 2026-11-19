import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { ArrowRight, Menu, UserRound, X } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { DemoNotice } from '../../components/ui/DemoNotice'
import { TornEdge } from '../../components/grunge'
import { ContactDetails } from '../../components/ui/ContactDetails'
import { useSession } from '../../services/session'

const nav = [
  { to: '/services', label: 'Services' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/rates', label: 'Rates' },
  { to: '/services/lessons', label: 'Lessons' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function navClass({ isActive }: { isActive: boolean }) {
  // Active state uses an underline bar + aria-current, not colour alone.
  return `relative px-1 py-2 font-display text-lg tracking-wide no-underline transition-colors hover:text-rust-light ${
    isActive ? 'text-paper after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:bg-rust' : 'text-paper/85'
  }`
}

export function PublicLayout() {
  const location = useLocation()
  const session = useSession()
  // Menu is open only for the path it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === location.pathname
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((prev) => {
      const cur = prev === location.pathname
      const val = typeof next === 'function' ? next(cur) : next
      return val ? location.pathname : null
    })

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <DemoNotice />
      <header className="sticky top-0 z-40 border-b border-slate bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={navClass} end={n.to === '/services'}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to={session?.role === 'customer' ? '/portal' : '/login'} className="hidden items-center gap-1.5 text-sm font-semibold text-paper/85 hover:text-paper sm:inline-flex">
              <UserRound aria-hidden="true" className="size-4" /> {session?.role === 'customer' ? 'My account' : 'Sign in'}
            </Link>
            <Link to="/book" className="btn btn-primary hidden !min-h-10 !px-4 !py-1.5 !text-base sm:inline-flex">
              Book a room
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center border border-slate text-paper lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div id="mobile-nav" hidden={!open} className="border-t border-slate bg-ink lg:hidden">
          <nav aria-label="Main (mobile)" className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/services'}
                className={({ isActive }) =>
                  `flex min-h-12 items-center justify-between border-b border-slate/60 font-display text-2xl no-underline ${
                    isActive ? 'text-rust-light' : 'text-paper'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && <span className="eyebrow text-muted">Current</span>}
                  </>
                )}
              </NavLink>
            ))}
            <Link to={session?.role === 'customer' ? '/portal' : '/login'} className="flex min-h-12 items-center gap-2 border-b border-slate/60 font-display text-2xl no-underline text-paper">
              <UserRound aria-hidden="true" className="size-5" /> {session?.role === 'customer' ? 'My account' : 'Sign in'}
            </Link>
            <Link to="/book" className="btn btn-primary mt-4 w-full">
              Book a room <ArrowRight aria-hidden="true" className="size-5" />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="relative mt-auto">
        <TornEdge className="text-charcoal" underClassName="text-slate" backClassName="bg-ink" seed={41} height={40} />
        <div className="bg-charcoal">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <Logo size="sm" />
              <p className="mt-4 max-w-xs text-sm text-muted">
                Rehearsal rooms, one-on-one lessons and live gig streaming. Open 9:00 AM – 9:00 PM (Asia/Manila).
              </p>
              <p className="mt-4 text-xs text-muted">
                Prototype website — bookings, accounts and payments are simulated.
              </p>
            </div>
            <nav aria-label="Studio">
              <h2 className="eyebrow text-muted">Studio</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link className="hover:text-rust-light" to="/services/rehearsal">Band rehearsal</Link></li>
                <li><Link className="hover:text-rust-light" to="/services/lessons">Lessons</Link></li>
                <li><Link className="hover:text-rust-light" to="/services/live-streaming">Live gig streaming</Link></li>
                <li><Link className="hover:text-rust-light" to="/rooms">Rooms</Link></li>
                <li><Link className="hover:text-rust-light" to="/rates">Rates</Link></li>
                <li><Link className="hover:text-rust-light" to="/shop">Shop: strings &amp; sticks</Link></li>
              </ul>
            </nav>
            <nav aria-label="Bookings">
              <h2 className="eyebrow text-muted">Bookings</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link className="hover:text-rust-light" to="/my-booking">Find my booking</Link></li>
                <li><Link className="hover:text-rust-light" to="/login">Customer sign-in</Link></li>
                <li><Link className="hover:text-rust-light" to="/portal/reservations">My reservations</Link></li>
                <li><Link className="hover:text-rust-light" to="/admin/login">Studio admin</Link></li>
              </ul>
            </nav>
            <div>
              <h2 className="eyebrow text-muted">Find us</h2>
              <ContactDetails compact />
            </div>
          </div>
          <div className="border-t border-slate">
            <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted sm:px-6">
              © {new Date().getFullYear()} Mario Bert&apos;s Studios. Prototype with demo data. <Link className="underline hover:text-paper" to="/privacy">Privacy notice (draft)</Link>
            </p>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}

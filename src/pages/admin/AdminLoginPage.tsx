import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react'
import {
  ADMIN_EMAILS,
  ADMIN_LOCK_AFTER,
  ADMIN_LOCK_MS,
  DEMO_ADMIN_PASSWORD,
  checkAdminCredentials,
  signInAdmin,
  useSession,
} from '../../services/session'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { TextField } from '../../components/ui/Field'
import { TapeLabel } from '../../components/grunge'

/** Studio staff sign-in: email + password (demo). Standalone page outside the guarded admin layout. */
export function AdminLoginPage() {
  useTitle('Admin sign-in')
  const session = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fails, setFails] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)

  if (session?.role === 'admin') return <Navigate to="/admin" replace />

  function submit(e: FormEvent) {
    e.preventDefault()
    const now = Date.now()
    if (now < lockedUntil) return setError(`Too many tries. Wait ${Math.ceil((lockedUntil - now) / 1000)} seconds and try again.`)
    if (!email.trim() || !password) return setError('Enter the studio email and password.')
    const r = checkAdminCredentials(email, password)
    if (r === 'ok') {
      signInAdmin(email)
      navigate('/admin', { replace: true })
      return
    }
    const n = fails + 1
    setFails(n)
    if (n >= ADMIN_LOCK_AFTER) {
      setFails(0)
      setLockedUntil(now + ADMIN_LOCK_MS)
      return setError('Too many tries. Wait 30 seconds and try again.')
    }
    // Same message for a wrong email or password, so it doesn't reveal which accounts exist.
    setError('That email or password is not right.')
  }

  return (
    <div className="min-h-dvh bg-ink">
      <div role="note" className="flex flex-wrap items-center justify-center gap-3 border-b-2 border-rust bg-surface px-4 py-2 text-center">
        <TapeLabel tone="rust">Demo admin</TapeLabel>
        <p className="text-xs text-paper sm:text-sm">Prototype sign-in — not real security.</p>
      </div>
      <main id="main" className="mx-auto max-w-md px-4 py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-paper/85 hover:text-paper">
          <ArrowLeft aria-hidden="true" className="size-4" /> Public site
        </Link>
        <h1 className="display mt-6 text-display-3">Studio admin sign-in</h1>

        <form noValidate onSubmit={submit} className="mt-8 space-y-5">
          <TextField label="Email" type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null) }} />
          <div>
            <TextField
              label="Password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
            />
            <button type="button" className="link mt-2 inline-flex items-center gap-1.5 text-sm" aria-pressed={show} onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
              {show ? 'Hide password' : 'Show password'}
            </button>
          </div>
          {error && <Callout tone="error" title={error} />}
          <button type="submit" className="btn btn-primary">
            <LogIn aria-hidden="true" className="size-5" /> Sign in
          </button>
        </form>

        <Callout tone="demo" title="Demo login" className="mt-10">
          Email: <strong className="font-mono">{ADMIN_EMAILS[0]}</strong>
          <br />
          Password: <strong className="font-mono">{DEMO_ADMIN_PASSWORD}</strong>
          <br />
          <span className="mt-2 block text-muted">
            This check runs in the browser, so the password is public on purpose — don&apos;t use a real one here. For a real launch, protect the admin with a server-side sign-in (for example Cloudflare Access).
          </span>
        </Callout>
      </main>
    </div>
  )
}

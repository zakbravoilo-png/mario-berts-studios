import { Link, Navigate, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { ADMIN_EMAILS, signInAdmin, useSession } from '../../services/session'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { TapeLabel } from '../../components/grunge'
import { CodeSignIn } from '../../features/auth/CodeSignIn'

/** Studio staff sign-in (demo). Standalone page outside the guarded admin layout. */
export function AdminLoginPage() {
  useTitle('Admin sign-in')
  const session = useSession()
  const navigate = useNavigate()
  if (session?.role === 'admin') return <Navigate to="/admin" replace />

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
        <p className="mt-2 text-sm text-muted">Sign in with the studio email. A one-time code is used instead of a password.</p>
        <div className="mt-8">
          <CodeSignIn
            kind="email"
            label="Studio email"
            sendVia="email"
            hint={ADMIN_EMAILS[0] ? <>Admin email: <strong>{ADMIN_EMAILS[0]}</strong></> : undefined}
            validate={(v) => (ADMIN_EMAILS.includes(v.trim().toLowerCase()) ? null : 'This email is not set up as a studio admin.')}
            onVerified={(email) => {
              signInAdmin(email)
              navigate('/admin', { replace: true })
            }}
          />
        </div>
        <Callout tone="demo" title="Before going live" className="mt-10">
          This check runs in the browser, so it does not protect the admin pages. For a real launch, put the admin behind a server-side sign-in (for example Cloudflare Access on the studio&apos;s account).
        </Callout>
      </main>
    </div>
  )
}

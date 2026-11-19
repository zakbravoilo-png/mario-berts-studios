import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useDemoState } from '../../services/demoStore'
import { createCustomer } from '../../services/actions'
import { findCustomerByPhone, useCurrentCustomer } from '../../services/accounts'
import { signInCustomer } from '../../services/session'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { TextField } from '../../components/ui/Field'
import { CodeSignIn } from '../../features/auth/CodeSignIn'
import { validateCustomer, type CustomerErrors } from '../../features/booking/customerSchema'

/** Only allow in-app paths as the post-sign-in destination. */
function safeNext(next: string | null): string {
  return next && next.startsWith('/portal') ? next : '/portal'
}

export function CustomerLoginPage() {
  useTitle('Sign in')
  const s = useDemoState()
  const me = useCurrentCustomer()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [newPhone, setNewPhone] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', bandName: '' })
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [createError, setCreateError] = useState<string | null>(null)

  if (me && !newPhone) return <Navigate to={next} replace />

  function verified(phone: string) {
    const existing = findCustomerByPhone(s.customers, phone)
    if (existing) {
      signInCustomer(existing.id)
      navigate(next, { replace: true })
    } else {
      setNewPhone(phone)
    }
  }

  function create(e: FormEvent) {
    e.preventDefault()
    if (!newPhone) return
    const details = { name: form.name, phone: newPhone, email: form.email, bandName: form.bandName, notes: '' }
    const errs = validateCustomer(details)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const r = createCustomer({ name: details.name.trim(), phone: newPhone.trim(), email: details.email.trim(), bandName: details.bandName.trim() || undefined })
    if (!r.ok) return setCreateError(r.errors.join(' '))
    signInCustomer(r.value.id)
    navigate(next, { replace: true })
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:py-16">
      <div>
        <p className="eyebrow text-muted">Customer account</p>
        <h1 className="display mt-2 text-display-2">{newPhone ? 'Create your account' : 'Sign in'}</h1>
        {!newPhone ? (
          <>
            <p className="mt-3 max-w-md text-paper/90">Sign in with your contact number. New here? The same steps create your account.</p>
            <div className="mt-8">
              <CodeSignIn
                kind="phone"
                label="Contact number"
                sendVia="SMS"
                hint={<>Demo account: <strong>0900 000 0000</strong></>}
                onVerified={verified}
              />
            </div>
          </>
        ) : (
          <form noValidate onSubmit={create} className="mt-6 max-w-md space-y-5">
            <p className="text-paper/90">Number verified: <strong>{newPhone}</strong>. Just a name to finish.</p>
            <TextField label="Name or nickname" autoComplete="nickname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <TextField label="Email" type="email" autoComplete="email" optional value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <TextField label="Band name" optional value={form.bandName} onChange={(e) => setForm({ ...form, bandName: e.target.value })} />
            {createError && <Callout tone="error" title={createError} />}
            <button type="submit" className="btn btn-primary">Create account</button>
          </form>
        )}
      </div>
      <aside className="space-y-5">
        <Callout tone="info" title="No account? No problem.">
          You can <Link to="/book" className="underline">book a room</Link> or <Link to="/book/lesson" className="underline">request a lesson</Link> as a guest, and{' '}
          <Link to="/my-booking" className="underline">find your booking</Link> later with its reference. Bookings you made as a guest show up in your account when you sign in with the same number.
        </Callout>
        <Callout tone="demo" title="Demo sign-in — not secure">
          This prototype has no server, so codes are shown on screen and accounts live only in this browser. A real launch needs a proper sign-in service.
        </Callout>
      </aside>
    </div>
  )
}

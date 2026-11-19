import { useState, type FormEvent, type ReactNode } from 'react'
import { KeyRound } from 'lucide-react'
import { TextField } from '../../components/ui/Field'
import { Callout } from '../../components/ui/Callout'
import { normalizeTarget, requestCode, verifyCode, type CheckResult } from '../../services/session'

const MESSAGES: Record<Exclude<CheckResult, 'ok'>, string> = {
  wrong: 'That code is not right. Check it and try again.',
  expired: 'That code has expired. Send a new one.',
  locked: 'Too many tries. Send a new code.',
  mismatch: 'Send a code first.',
}

/**
 * Two-step passwordless sign-in: identifier → one-time code.
 * DEMO: the code is shown on screen instead of being sent by SMS/email.
 */
export function CodeSignIn({
  kind,
  label,
  hint,
  sendVia,
  validate,
  onVerified,
  footer,
}: {
  kind: 'phone' | 'email'
  label: string
  hint?: ReactNode
  /** "SMS" or "email" — wording only. */
  sendVia: string
  /** Extra check before sending a code (e.g. admin email allow-list). Return an error or null. */
  validate?: (value: string) => string | null
  onVerified: (value: string) => void
  footer?: ReactNode
}) {
  const [value, setValue] = useState('')
  const [sent, setSent] = useState<{ target: string; code: string; shownTo: string } | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function send(e: FormEvent) {
    e.preventDefault()
    const v = value.trim()
    const digits = v.replace(/\D/g, '')
    if (kind === 'phone' && (digits.length < 7 || digits.length > 15)) return setError('Enter a valid contact number.')
    if (kind === 'email' && !/^\S+@\S+\.\S+$/.test(v)) return setError('Enter a valid email address.')
    const extra = validate?.(v)
    if (extra) return setError(extra)
    const target = normalizeTarget(kind, v)
    const ch = requestCode(target)
    setSent({ target, code: ch.code, shownTo: v })
    setCode('')
    setError(null)
  }

  function verify(e: FormEvent) {
    e.preventDefault()
    if (!sent) return
    const r = verifyCode(sent.target, code)
    if (r === 'ok') return onVerified(sent.shownTo)
    setError(MESSAGES[r])
  }

  return (
    <div className="max-w-md">
      {!sent ? (
        <form noValidate onSubmit={send} className="space-y-5">
          <TextField
            label={label}
            type={kind === 'phone' ? 'tel' : 'email'}
            inputMode={kind === 'phone' ? 'tel' : 'email'}
            autoComplete={kind === 'phone' ? 'tel' : 'email'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            hint={hint}
            error={error}
          />
          <button type="submit" className="btn btn-primary">Send code</button>
        </form>
      ) : (
        <form noValidate onSubmit={verify} className="space-y-5">
          <Callout tone="demo" title={`Demo code: ${sent.code}`}>
            In the real system this 6-digit code would be sent by {sendVia} to <strong>{sent.shownTo}</strong>. Nothing is sent in this prototype.
          </Callout>
          <TextField
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={error}
            hint="The code expires in 5 minutes."
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary">
              <KeyRound aria-hidden="true" className="size-5" /> Sign in
            </button>
            <button type="button" className="link text-sm" onClick={() => { setSent(null); setError(null) }}>
              Use a different {kind === 'phone' ? 'number' : 'email'}
            </button>
          </div>
        </form>
      )}
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  )
}

import { FlaskConical } from 'lucide-react'

/** Site-wide prototype disclosure. Required: never imply bookings or payments are real. */
export function DemoNotice({ className = '' }: { className?: string }) {
  return (
    <div role="note" className={`border-b border-slate bg-surface text-paper ${className}`}>
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs sm:text-sm">
        <FlaskConical aria-hidden="true" className="size-4 shrink-0 text-rust-light" />
        <span>
          <strong className="font-semibold">Prototype.</strong> Demo data only — no real bookings, accounts
          or GCash payments.
        </span>
      </p>
    </div>
  )
}

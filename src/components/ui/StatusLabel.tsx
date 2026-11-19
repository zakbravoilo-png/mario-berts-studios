import {
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  Hourglass,
  MessageSquare,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { InquiryStatus, LessonStatus, PaymentStatus, RehearsalStatus } from '../../types/domain'

type AnyStatus = RehearsalStatus | LessonStatus | InquiryStatus | PaymentStatus

const META: Record<AnyStatus, { label: string; icon: LucideIcon; tone: 'paper' | 'rust' | 'dim' }> = {
  awaiting_payment: { label: 'Awaiting payment', icon: Clock, tone: 'paper' },
  awaiting_verification: { label: 'Awaiting verification', icon: Hourglass, tone: 'paper' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, tone: 'rust' },
  completed: { label: 'Completed', icon: CheckCircle2, tone: 'dim' },
  cancelled: { label: 'Cancelled', icon: Ban, tone: 'dim' },
  rejected: { label: 'Rejected (demo)', icon: XCircle, tone: 'dim' },
  requested: { label: 'Requested', icon: Hourglass, tone: 'paper' },
  declined: { label: 'Declined (demo)', icon: XCircle, tone: 'dim' },
  pending: { label: 'Pending', icon: Hourglass, tone: 'paper' },
  responded: { label: 'Responded', icon: MessageSquare, tone: 'rust' },
  closed: { label: 'Closed', icon: Ban, tone: 'dim' },
  not_submitted: { label: 'Not submitted', icon: CircleDashed, tone: 'paper' },
  submitted: { label: 'Submitted', icon: Hourglass, tone: 'paper' },
  verified: { label: 'Verified', icon: ShieldCheck, tone: 'rust' },
}

/**
 * Status printed on tape: icon + words, so status never relies on colour alone.
 * `variant="plain"` is the admin's denser, texture-free version.
 */
export function StatusLabel({ status, variant = 'tape', className = '' }: { status: AnyStatus; variant?: 'tape' | 'plain'; className?: string }) {
  const m = META[status]
  if (variant === 'plain') {
    return (
      <span className={`inline-flex items-center gap-1.5 border border-slate px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${m.tone === 'dim' ? 'text-muted' : m.tone === 'rust' ? 'text-rust-light' : 'text-paper'} ${className}`}>
        <m.icon aria-hidden="true" className="size-3.5" />
        {m.label}
      </span>
    )
  }
  const tone = m.tone === 'rust' ? 'tape-label tape-label--rust' : m.tone === 'dim' ? 'tape-label opacity-80' : 'tape-label'
  return (
    <span className={`${tone} whitespace-nowrap ${className}`}>
      <m.icon aria-hidden="true" className="size-3.5" />
      {m.label}
    </span>
  )
}

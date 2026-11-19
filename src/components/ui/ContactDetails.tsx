import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { studioContact } from '../../data/services'

const Tbd = () => <span className="tbd-chip text-muted">To be provided by studio</span>

/** Studio contact details from data/services.ts. Missing values render as "to be provided". */
export function ContactDetails({ compact = false }: { compact?: boolean }) {
  const c = studioContact
  const row = compact ? 'flex gap-2.5 text-sm' : 'flex gap-3'
  const icon = compact ? 'mt-0.5 size-4 shrink-0 text-muted' : 'mt-1 size-5 shrink-0 text-rust-light'
  return (
    <dl className={compact ? 'mt-3 space-y-3' : 'mt-6 space-y-5'}>
      <div className={row}>
        <MapPin aria-hidden="true" className={icon} />
        <div>
          <dt className={compact ? 'sr-only' : 'text-sm text-muted'}>Address</dt>
          <dd className="m-0">
            {c.address ?? <Tbd />}
            {c.address && c.mapUrl && (
              <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="link mt-1 flex w-fit items-center gap-1 text-sm">
                View on map <ExternalLink aria-hidden="true" className="size-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </dd>
        </div>
      </div>
      <div className={row}>
        <MessageCircle aria-hidden="true" className={icon} />
        <div>
          <dt className={compact ? 'sr-only' : 'text-sm text-muted'}>Message us</dt>
          <dd className="m-0">
            {c.messenger.url ? (
              <a href={c.messenger.url} target="_blank" rel="noopener noreferrer" className="link">{c.messenger.label}</a>
            ) : (
              <>
                {c.messenger.label}
                <span className="block text-xs text-muted">Page link to be provided by studio</span>
              </>
            )}
          </dd>
        </div>
      </div>
      <div className={row}>
        <Mail aria-hidden="true" className={icon} />
        <div>
          <dt className={compact ? 'sr-only' : 'text-sm text-muted'}>Email</dt>
          <dd className="m-0 break-all">{c.email ? <a href={`mailto:${c.email}`} className="link">{c.email}</a> : <Tbd />}</dd>
        </div>
      </div>
      <div className={row}>
        <Phone aria-hidden="true" className={icon} />
        <div>
          <dt className={compact ? 'sr-only' : 'text-sm text-muted'}>Phone</dt>
          <dd className="m-0">{c.phone ? (c.phoneHref ? <a href={c.phoneHref} className="link">{c.phone}</a> : c.phone) : <Tbd />}</dd>
        </div>
      </div>
    </dl>
  )
}

import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Package } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { createShopInquiry } from '../../services/actions'
import { ownsRecord, useCurrentCustomer } from '../../services/accounts'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { TextArea } from '../../components/ui/Field'
import { QtyStepper } from '../../components/ui/QtyStepper'
import { CustomerFields } from '../../features/booking/CustomerFields'
import { emptyCustomer, validateCustomer, type CustomerErrors, type CustomerForm } from '../../features/booking/customerSchema'
import { shopCategories } from '../../data/services'
import { formatDate } from '../../utils/time'
import { formatPHP } from '../../utils/money'

/** Shop inquiry form. `guest` = no account: asks for contact details and saves as a guest inquiry. */
export function OrdersPage({ guest = false }: { guest?: boolean }) {
  const s = useDemoState()
  const me = useCurrentCustomer()
  const asGuest = guest || !me
  const [params] = useSearchParams()
  const pre = params.get('product')
  const [qty, setQty] = useState<Record<string, number>>(() => (pre ? { [pre]: 1 } : {}))
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState<CustomerForm>(emptyCustomer)
  const [contactErrors, setContactErrors] = useState<CustomerErrors>({})
  const [errors, setErrors] = useState<string[]>([])
  const [done, setDone] = useState<string | null>(null)
  const mine = me && !guest ? s.shopInquiries.filter((x) => ownsRecord(me, x)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []
  const pname = (id: string) => s.products.find((p) => p.id === id)?.name ?? id

  function submit(e: FormEvent) {
    e.preventDefault()
    const items = Object.entries(qty)
      .filter(([id, q]) => q > 0 && !s.products.find((x) => x.id === id)?.outOfStock)
      .map(([productId, quantity]) => ({ productId, quantity }))
    let customer = me ? { name: me.name, email: me.email, phone: me.phone } : null
    if (asGuest) {
      const ce = validateCustomer(contact)
      setContactErrors(ce)
      if (Object.keys(ce).length) return setErrors(['Please fix your contact details.'])
      customer = { name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone.trim() }
    }
    const r = createShopInquiry({ items, message: message.trim(), customer: customer!, customerId: asGuest ? 'guest' : me!.id })
    if (!r.ok) return setErrors(r.errors)
    setErrors([])
    setDone(r.value.reference)
    setQty({})
    setMessage('')
  }

  return (
    <>
      <PortalHeader
        title={asGuest ? 'Ask about strings & sticks' : 'Shop inquiries'}
        eyebrow={asGuest ? 'Shop inquiry · no account needed' : 'Customer portal · demo'}
        description="Inquiry only — no online checkout or payment. Stock and pickup/delivery to be confirmed by the studio."
      />
      <div className={`grid gap-10 ${asGuest ? 'max-w-3xl' : 'xl:grid-cols-[1.2fr_1fr]'}`}>
        <form noValidate onSubmit={submit} aria-labelledby="ask-title">
          <h2 id="ask-title" className="font-display text-2xl tracking-wide">What would you like?</h2>
          {shopCategories.map((c) => (
            <fieldset key={c.id} className="mt-5">
              <legend className="text-sm font-semibold text-muted">{c.label}</legend>
              <ul className="mt-2 divide-y divide-slate border-y border-slate">
                {s.products.filter((p) => p.active && p.category === c.id).map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block font-semibold">{p.name}{p.isDemo && <span className="demo-chip ml-1">Demo</span>}</span>
                      <span className="text-sm text-muted">{p.brand ? `${p.brand} · ` : ''}{p.price === null ? 'Price TBD' : formatPHP(p.price)} · {p.outOfStock ? <strong className="text-paper">Out of stock</strong> : <>Stock {p.stock ?? 'TBD'}</>}</span>
                    </span>
                    <QtyStepper label={p.name} value={p.outOfStock ? 0 : qty[p.id] ?? 0} max={p.outOfStock ? 0 : p.stock ?? 20} onChange={(n) => setQty({ ...qty, [p.id]: n })} />
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
          <TextArea className="mt-6" label="Message" optional value={message} onChange={(e) => setMessage(e.target.value)} hint="E.g. preferred gauge or stick size." />
          {asGuest && (
            <div className="mt-8">
              <h2 className="mb-4 font-display text-xl tracking-wide">Your contact details</h2>
              <CustomerFields value={contact} errors={contactErrors} onChange={setContact} showBand={false} notesLabel="Anything else" />
            </div>
          )}
          {errors.length > 0 && <Callout tone="error" title="Can't send yet" className="mt-4">{errors.join(' ')}</Callout>}
          {done && <Callout tone="success" title={`Inquiry ${done} sent (demo)`} className="mt-4">The studio will reply{asGuest ? ' using your contact number' : ''} — in this prototype, the demo admin can mark it as responded.</Callout>}
          <button type="submit" className="btn btn-primary mt-6">Send inquiry</button>
        </form>

        {!asGuest && (
          <section aria-labelledby="mine-title">
            <h2 id="mine-title" className="font-display text-2xl tracking-wide">Your inquiries</h2>
            <div className="mt-4 space-y-3">
              {mine.length === 0 ? (
                <EmptyState icon={Package} title="No inquiries yet" />
              ) : (
                mine.map((x) => (
                  <article key={x.id} className="card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono font-bold">{x.reference}</p>
                      <StatusLabel status={x.status} variant="plain" />
                    </div>
                    <ul className="mt-2 text-sm">
                      {x.items.map((i) => <li key={i.productId}>{i.quantity} × {pname(i.productId)}</li>)}
                    </ul>
                    {x.message && <p className="mt-2 text-sm text-muted">“{x.message}”</p>}
                    <p className="mt-2 text-xs text-muted">Sent {formatDate(x.createdAt)}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

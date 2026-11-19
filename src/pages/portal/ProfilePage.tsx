import { useState, type FormEvent } from 'react'
import { useCurrentCustomer } from '../../services/accounts'
import { updateCustomerProfile } from '../../services/actions'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { CustomerFields } from '../../features/booking/CustomerFields'
import { validateCustomer, type CustomerErrors, type CustomerForm } from '../../features/booking/customerSchema'

export function ProfilePage() {
  const me = useCurrentCustomer()!
  const [form, setForm] = useState<CustomerForm>({ name: me.name, email: me.email, phone: me.phone, bandName: me.bandName ?? '', notes: me.notes ?? '' })
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [saved, setSaved] = useState(false)

  function save(e: FormEvent) {
    e.preventDefault()
    const errs = validateCustomer(form)
    setErrors(errs)
    if (Object.keys(errs).length) return setSaved(false)
    const r = updateCustomerProfile(me.id, form)
    if (!r.ok) {
      setErrors({ phone: r.errors[0] })
      return setSaved(false)
    }
    setSaved(true)
  }

  return (
    <>
      <PortalHeader title="Profile" eyebrow="Customer portal · demo" description="Used to pre-fill your bookings. Your contact number is how you sign in (demo one-time code)." />
      <form noValidate onSubmit={save} className="max-w-2xl">
        <CustomerFields value={form} errors={errors} onChange={(v) => { setForm(v); setSaved(false) }} notesLabel="About your band" />
        <button type="submit" className="btn btn-primary mt-6">Save profile</button>
        {saved && <Callout tone="success" title="Saved in this browser (demo)" className="mt-4" />}
      </form>
    </>
  )
}

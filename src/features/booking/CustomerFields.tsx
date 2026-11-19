import { TextArea, TextField } from '../../components/ui/Field'
import type { CustomerErrors, CustomerForm } from './customerSchema'

/** Shared contact fields for bookings, lessons and inquiries (guest-friendly). */
export function CustomerFields({
  value,
  errors,
  onChange,
  bandLabel = 'Band name',
  notesLabel = 'Notes for the studio',
  showBand = true,
}: {
  value: CustomerForm
  errors: CustomerErrors
  onChange: (v: CustomerForm) => void
  bandLabel?: string
  notesLabel?: string
  showBand?: boolean
}) {
  const set = (k: keyof CustomerForm) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value })
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField label="Name or nickname" autoComplete="nickname" value={value.name} onChange={set('name')} error={errors.name} />
      <TextField
        label="Contact number"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        value={value.phone}
        onChange={set('phone')}
        error={errors.phone}
        hint="The studio uses this to reach you. You'll also need it to look up your booking."
      />
      <TextField className="sm:col-span-2" label="Email" type="email" autoComplete="email" optional value={value.email} onChange={set('email')} error={errors.email} />
      {showBand && <TextField className="sm:col-span-2" label={bandLabel} optional value={value.bandName ?? ''} onChange={set('bandName')} error={errors.bandName} />}
      <TextArea className="sm:col-span-2" label={notesLabel} optional value={value.notes ?? ''} onChange={set('notes')} error={errors.notes} />
      <p className="text-sm text-muted sm:col-span-2">
        Demo: details stay in this browser only. Privacy notice to be provided by the studio. Don&apos;t enter real personal data.
      </p>
    </div>
  )
}

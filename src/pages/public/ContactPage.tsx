import { Link } from 'react-router'
import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { PageHeader, SectionTitle } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { TextArea, TextField } from '../../components/ui/Field'
import { Callout } from '../../components/ui/Callout'
import { ContactDetails } from '../../components/ui/ContactDetails'

const schema = z
  .object({
    name: z.string().trim().min(1, 'Please enter your name.'),
    email: z.string().trim().email('Enter a valid email address.').or(z.literal('')),
    phone: z.string().trim(),
    message: z.string().trim().min(5, 'Please write a short message.'),
  })
  .refine((v) => v.email !== '' || v.phone !== '', { message: 'Give an email or a phone number so the studio can reply.', path: ['email'] })

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>

export function ContactPage() {
  useTitle('Contact')
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    const r = schema.safeParse(form)
    if (!r.success) {
      const next: Errors = {}
      for (const issue of r.error.issues) next[issue.path[0] as keyof Errors] ??= issue.message
      setErrors(next)
      return
    }
    setErrors({})
    setSent(true)
  }

  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch." photo="liveBw" />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Studio details">Find us</SectionTitle>
          <ContactDetails />
          <dl className="mt-5 space-y-5 pl-8">
            <div>
              <dt className="text-sm text-muted">Hours</dt>
              <dd className="m-0 mt-1">Daily 9:00 AM – 9:00 PM (Asia/Manila)</dd>
            </div>
          </dl>
          <p className="mt-6 text-paper/90">The quickest way to reach the studio is Facebook Messenger.</p>
          <Callout tone="info" title="Privacy notice" className="mt-8">
            A <Link className="link" to="/privacy">draft privacy notice</Link> is ready for the studio to review before real customer details are collected (Data Privacy Act of 2012, RA 10173).
          </Callout>
        </div>

        <div>
          <SectionTitle eyebrow="Inquiry form">Send a message</SectionTitle>
          {sent ? (
            <Callout tone="demo" title="Demo: message not sent" className="mt-6">
              This prototype has no email or messaging backend, so nothing was sent. To reach the studio for real, use Facebook Messenger or email.
            </Callout>
          ) : (
            <form noValidate onSubmit={submit} className="mt-6 space-y-5">
              <TextField label="Name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} hint="Email or phone — at least one." />
              <TextField label="Phone" type="tel" autoComplete="tel" optional value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
              <TextArea label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={errors.message} />
              <p className="text-sm text-muted">Demo form — messages are not delivered. Use Messenger or email to reach the studio.</p>
              <button type="submit" className="btn btn-primary">Send message</button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}

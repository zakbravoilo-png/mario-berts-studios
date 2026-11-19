import type { ReactNode } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { studioContact } from '../../data/services'

/**
 * DRAFT privacy notice (Data Privacy Act of 2012, RA 10173), written 2026-11-19 at the
 * user's request. Not legal advice: the studio should review it (ideally with a lawyer)
 * before real customer details are collected. Items marked "Proposed" are suggestions
 * the studio has not confirmed yet.
 */
export function PrivacyPage() {
  useTitle('Privacy notice')
  const c = studioContact
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy notice." photo="room3">
        How Manoy Bart&apos;s Studio collects, uses and protects your personal information.
      </PageHeader>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Callout tone="warning" title="Draft — not yet in force">
          This notice is a draft for the studio to review before the site collects real customer details. Items marked
          “Proposed” have not been confirmed by the studio. In this prototype, details you enter stay in your own browser
          and are not sent to the studio.
        </Callout>

        <div className="mt-10 space-y-10 text-paper/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:tracking-wide [&_h2]:text-paper [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-rust-light">
          <Section title="1. Who we are">
            <p>
              Manoy Bart&apos;s Studio (“the studio”, “we”) runs rehearsal rooms, music lessons, live gig streaming and a
              small shop at {c.address}. We decide how your personal information is used, so we are responsible for it
              under the Data Privacy Act of 2012 (Republic Act No. 10173) and its rules.
            </p>
          </Section>

          <Section title="2. What we collect">
            <ul>
              <li><strong>Contact details:</strong> your name or nickname, contact number and, if you give it, your email address.</li>
              <li><strong>Booking details:</strong> band name and notes (optional), the room, date, time, extra gear, lesson instrument and level, and streaming or shop requests.</li>
              <li><strong>Payment details:</strong> your GCash reference number and, if you upload one, a screenshot of your GCash receipt. We never ask for your GCash PIN, MPIN or one-time codes.</li>
              <li><strong>Account details</strong> (if you sign in): your contact number and the booking history linked to it.</li>
              <li><strong>Messages:</strong> what you send us through the website, Facebook Messenger, SMS or email.</li>
            </ul>
            <p>We don&apos;t need sensitive personal information (such as health, religion or government ID numbers), so please don&apos;t send it.</p>
          </Section>

          <Section title="3. Why we use it">
            <ul>
              <li>To take, confirm, change or cancel your booking, lesson or request.</li>
              <li>To check your GCash downpayment, collect the balance and return refunds.</li>
              <li>To send you booking updates by SMS and email.</li>
              <li>To answer your questions and keep simple records of what was booked and paid.</li>
            </ul>
            <p>
              We use your information because you asked us for a service (the booking) and because we must keep proper
              payment records. We won&apos;t send you promotions unless you separately agree to receive them.
            </p>
          </Section>

          <Section title="4. Who we share it with">
            <p>We don&apos;t sell your information. We only share what is needed with:</p>
            <ul>
              <li>The instructor teaching your lesson (your name, contact number, instrument and level).</li>
              <li>Service providers that help us run the website and send messages, such as web hosting, SMS and email providers. They may only use it to provide that service to us.</li>
              <li>Government authorities, if the law requires it.</li>
            </ul>
            <p>Some of these providers may store data outside the Philippines. We choose providers that protect it properly.</p>
          </Section>

          <Section title="5. How long we keep it">
            <ul>
              <li><strong>Proposed:</strong> booking and payment records are kept for as long as needed for tax and accounting rules, then deleted.</li>
              <li><strong>Proposed:</strong> GCash receipt screenshots are deleted 90 days after the booking date.</li>
              <li><strong>Proposed:</strong> accounts with no booking for 2 years are deleted.</li>
            </ul>
          </Section>

          <Section title="6. How we protect it">
            <p>
              Only the studio owner and staff who handle bookings can see your details. The admin area is password
              protected, and we use secure (HTTPS) connections. If a breach puts you at risk, we will tell you and the
              National Privacy Commission as the law requires.
            </p>
          </Section>

          <Section title="7. Your rights">
            <p>Under the Data Privacy Act you can:</p>
            <ul>
              <li>be told how your information is used (this notice);</li>
              <li>ask for a copy of your information;</li>
              <li>ask us to correct anything that is wrong;</li>
              <li>object to its use, or ask us to delete it, when we no longer need it;</li>
              <li>get your information in a format you can take elsewhere;</li>
              <li>claim damages if it is misused; and</li>
              <li>complain to the National Privacy Commission (privacy.gov.ph).</li>
            </ul>
            <p>We may need to keep some records (for example, payments) when the law requires it.</p>
          </Section>

          <Section title="8. Contact us">
            <p>
              For privacy questions or requests, contact the studio owner, who acts as our data protection officer:
            </p>
            <ul>
              {c.email && <li>Email: <a className="link" href={`mailto:${c.email}`}>{c.email}</a></li>}
              {c.phone && <li>Phone: <a className="link" href={c.phoneHref ?? undefined}>{c.phone}</a></li>}
              {c.address && <li>Address: {c.address}</li>}
            </ul>
            <p className="text-sm text-muted">Last updated: draft of 19 November 2026.</p>
          </Section>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

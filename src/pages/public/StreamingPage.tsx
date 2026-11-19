import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { PageHeader, SectionTitle } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { defaultSettings } from '../../data/settings'
import { formatPHP } from '../../utils/money'

export function StreamingPage() {
  useTitle('Live gig streaming')
  return (
    <>
      <PageHeader eyebrow="Services / Live gig streaming" title={<>Stream the gig. {formatPHP(defaultSettings.streamingRatePerHour)} an hour.</>} photo="liveBw">
        Tell the studio about your event and it will get back to you.
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="How it works">Inquiry first</SectionTitle>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-paper/90 marker:font-mono marker:text-rust-light">
            <li>Send the event date, how long you&apos;ll play, the venue and a short description.</li>
            <li>You&apos;ll see an estimate: hours × {formatPHP(defaultSettings.streamingRatePerHour)}.</li>
            <li>The studio replies to confirm what&apos;s possible. Nothing is booked until then.</li>
          </ol>
          <Link to="/book/streaming" className="btn btn-primary mt-8">
            Send an inquiry <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
        <Callout tone="info" title="To be confirmed by the studio">
          Streaming packages, equipment, camera setup, supported platforms, minimum hours and technical requirements have not
          been announced yet. This page will be updated once they are.
        </Callout>
      </section>
    </>
  )
}

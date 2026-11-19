import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { DuotoneImage, Tape, TapeLabel } from '../../components/grunge'

export function AboutPage() {
  useTitle('About')
  return (
    <>
      <PageHeader eyebrow="About" title="About the studio." photo="rehearsalFisheye" />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <TapeLabel rotate={-2}>Placeholder — to be written by studio</TapeLabel>
          <div className="mt-6 space-y-4 text-lg text-paper/90">
            <p>
              Mario Bert&apos;s Studios offers rehearsal rooms, one-on-one music lessons and live gig streaming. The
              studio&apos;s story, history and people will be written here by the studio.
            </p>
            <p className="text-muted">
              This prototype does not invent a history, founders or awards. Everything on this page apart from the
              services is a placeholder.
            </p>
          </div>
        </div>
        <div className="relative rotate-2 drop-shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
          <DuotoneImage photo="liveBlue" torn={88} className="aspect-[3/2] w-full" />
          <Tape className="-top-3 left-8" rotate={-8} />
        </div>
      </section>
    </>
  )
}

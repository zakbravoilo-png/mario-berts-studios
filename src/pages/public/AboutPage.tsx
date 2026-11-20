import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { DuotoneImage, Tape } from '../../components/grunge'

export function AboutPage() {
  useTitle('About')
  return (
    <>
      <PageHeader eyebrow="About" title="About the studio." photo="rehearsalFisheye" />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Studio story supplied by the user, 2026-11-20. */}
        <div className="space-y-5 text-lg text-paper/90">
          <p>
            Since 2012, <strong className="text-paper">Manoy Bart&rsquo;s Studio</strong> has been making space for Iloilo&rsquo;s music and art
            scene. It has become a place for local musicians looking for a stage, and people who believe the local music
            and arts scene deserve to be seen and heard!
          </p>
          <p>
            What started around music, has grown into more than just a rehearsal space. Over the years, Manoy Bart&rsquo;s
            Studio has organized monthly gigs, events, and collaborations with both local and national brands.
          </p>
          <p>
            Through these efforts, the studio has helped put local musicians and artists in the spotlight, creating an
            outlet for them to share their craft and connect with more people who appreciate what they do.
          </p>
          <p>
            We believe Iloilo&rsquo;s local music and arts scene deserves stages, spaces and people who give a damn.
            That&rsquo;s what Manoy Bart&rsquo;s Studio is all about!
          </p>
          <p className="display text-3xl text-paper">
            <strong>Manoy Padayon!</strong>
          </p>
        </div>
        <div className="relative rotate-2 drop-shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
          <DuotoneImage photo="aboutMixingDesk" torn={88} tone="natural" halftone={false} className="aspect-[3/2] w-full" />
          <Tape className="-top-3 left-8" rotate={-8} />
        </div>
      </section>
    </>
  )
}

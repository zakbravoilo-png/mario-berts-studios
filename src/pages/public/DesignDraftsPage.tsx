import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CalendarDays, Check, Clock, GraduationCap, Music, Radio } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { DuotoneImage, Highlight, Tape } from '../../components/grunge'

/**
 * Design drafts (user request, 2026-11-20): alternative homepage directions shown next to the
 * final look. The original early drafts weren't saved, and the user asked for drafts 1 and 2 to
 * be clearly different from the final design, so they are ILLUSTRATIVE directions rebuilt for
 * this page (a bright booking app and a risograph zine), not copies of saved files.
 * Draft 1 borrows the purple-black of palette v1 (#0E0426) and draft 2 the navy of palette v2
 * (#1C2040); the final is palette v3, the current site.
 * The mock-ups are pictures of a design, not working pages, so they are hidden from screen
 * readers and described in their captions instead. Prices shown are the confirmed ones.
 */

interface Swatch {
  name: string
  hex: string
}

interface Draft {
  id: string
  label: string
  title: string
  idea: string
  palette: Swatch[]
  good: string[]
  movedOn?: string[]
  chosen?: string[]
  caption: string
  mock: ReactNode
}

/** A browser window around each mock-up so it reads as "a website", not part of this page. */
function BrowserFrame({ children, bar }: { children: ReactNode; bar: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate shadow-[10px_12px_0_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: bar }}>
        <span className="size-2.5 rounded-full bg-muted" />
        <span className="size-2.5 rounded-full bg-muted" />
        <span className="size-2.5 rounded-full bg-muted" />
      </div>
      {children}
    </div>
  )
}

/* ---------- Draft 1: Bright booking app ---------- */

function BookingAppMock() {
  const v = { bg: '#F6F5FB', card: '#FFFFFF', ink: '#0E0426', soft: '#55506B', primary: '#5B3FD9', lavender: '#E9E5FA', coral: '#FF7A59', line: '#DDD9EC' }
  const font: CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none', letterSpacing: 0 }
  return (
    <BrowserFrame bar="#E4E1EF">
      <div style={{ background: v.bg, color: v.ink, ...font }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: v.card, borderBottom: `1px solid ${v.line}` }}>
          <span className="flex items-center gap-2 text-base font-bold">
            <span className="grid size-7 place-items-center rounded-lg" style={{ background: v.primary, color: '#fff' }}>
              <Music className="size-4" />
            </span>
            Manoy Bart&rsquo;s
          </span>
          <span className="hidden gap-5 text-sm font-medium sm:flex" style={{ color: v.soft }}>
            <span>Rooms</span><span>Lessons</span><span>Pricing</span>
          </span>
          <span className="rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: v.lavender, color: v.primary }}>Sign in</span>
        </div>

        <div className="grid gap-6 px-5 py-8 sm:grid-cols-[1fr_1.05fr] sm:items-center">
          <div>
            <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: v.lavender, color: v.primary }}>
              Rehearsal rooms in Jaro, Iloilo
            </span>
            <p className="mt-4 text-[2rem] leading-tight font-bold">Book a rehearsal room in under a minute.</p>
            <p className="mt-3 text-sm" style={{ color: v.soft }}>Pick a time, choose a room, pay the downpayment by GCash. Done.</p>
            <ul className="mt-4 space-y-1.5 text-sm font-medium">
              {['₱250 per hour, per room', 'Drums, amps and mics included', 'Open 9 AM – 9 PM'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full" style={{ background: v.primary, color: '#fff' }}><Check className="size-3" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-5 shadow-[0_12px_32px_rgba(14,4,38,0.12)]" style={{ background: v.card }}>
            <p className="text-sm font-bold">Find an open room</p>
            <div className="mt-3 flex gap-2 text-xs font-semibold">
              {['Today', 'Tomorrow', 'Sat'].map((d, i) => (
                <span key={d} className="rounded-full px-3 py-1.5" style={i === 0 ? { background: v.primary, color: '#fff' } : { border: `1px solid ${v.line}`, color: v.soft }}>
                  {d}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-xl px-3 py-2.5" style={{ border: `1px solid ${v.line}` }}><CalendarDays className="size-4" style={{ color: v.primary }} /> Sat, Nov 21</span>
              <span className="flex items-center gap-1.5 rounded-xl px-3 py-2.5" style={{ border: `1px solid ${v.line}` }}><Clock className="size-4" style={{ color: v.primary }} /> 5:00 PM · 2 hrs</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              {[['Room 1', 'Open'], ['Room 2', 'Taken'], ['Room 3', 'Open']].map(([r, s]) => (
                <div key={r} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: v.bg }}>
                  <span className="font-semibold">{r}</span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: s === 'Open' ? v.primary : v.soft }}>
                    {s === 'Open' ? <Check className="size-3.5" /> : <span aria-hidden="true">–</span>} {s}
                  </span>
                </div>
              ))}
            </div>
            <span className="mt-4 block rounded-xl py-3 text-center text-sm font-bold" style={{ background: v.primary, color: '#fff' }}>Check availability</span>
          </div>
        </div>

        <div className="grid gap-3 px-5 pb-6 sm:grid-cols-3">
          {[
            [Music, 'Rehearsal', '₱250 / hour'],
            [GraduationCap, 'Lessons', 'From ₱500'],
            [Radio, 'Live streaming', 'Packages TBD'],
          ].map(([Icon, t, p]) => {
            const I = Icon as typeof Music
            return (
              <div key={t as string} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: v.card }}>
                <span className="grid size-9 place-items-center rounded-xl" style={{ background: v.coral, color: v.ink }}><I className="size-4" /></span>
                <span>
                  <span className="block text-sm font-bold">{t as string}</span>
                  <span className="block text-xs" style={{ color: v.soft }}>{p as string}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </BrowserFrame>
  )
}

/* ---------- Draft 2: Risograph zine ---------- */

function RisoZineMock() {
  const v = { paper: '#F3EEE3', blue: '#2340A8', navy: '#1C2040', pink: '#FF4FA3', yellow: '#FFD23F' }
  const dots: CSSProperties = {
    backgroundImage: `radial-gradient(${v.blue} 1.6px, transparent 1.8px)`,
    backgroundSize: '9px 9px',
  }
  const mono: CSSProperties = { fontFamily: "'Space Mono', 'Courier New', monospace", textTransform: 'none' }
  return (
    <BrowserFrame bar="#D9D2C4">
      <div className="relative overflow-hidden" style={{ background: v.paper, color: v.navy }}>
        <div className="flex items-center justify-between px-5 py-2 text-xs font-bold" style={{ ...mono, borderBottom: `3px solid ${v.navy}` }}>
          <span>MANOY BART&rsquo;S STUDIO</span>
          <span className="hidden sm:inline">ISSUE #01 · JARO, ILOILO</span>
          <span>FREE</span>
        </div>

        <div className="relative px-5 pt-6 pb-8">
          {/* Overlapping print shapes, slightly off-register like a riso print */}
          <div aria-hidden="true" className="absolute top-4 -right-12 size-36 rounded-full opacity-90 mix-blend-multiply sm:top-6 sm:right-4 sm:size-56" style={{ background: v.pink }} />
          <div aria-hidden="true" className="absolute top-20 right-20 hidden size-36 rounded-full mix-blend-multiply sm:block sm:size-44" style={{ ...dots }} />
          <div
            aria-hidden="true"
            className="absolute right-24 bottom-6 hidden size-24 mix-blend-multiply sm:block"
            style={{ background: v.yellow, clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }}
          />

          <p className="relative text-xs font-bold" style={mono}>→ a zine about where bands get loud</p>
          <p
            className="relative mt-2 font-bold leading-[0.85]"
            style={{ ...mono, fontSize: 'clamp(3.4rem, 9vw, 5.5rem)', color: v.blue, textShadow: `5px 4px 0 ${v.pink}` }}
          >
            JAM<br />HERE.
          </p>
          <p className="marker relative mt-4 max-w-56 -rotate-2 text-lg" style={{ color: v.navy }}>
            3 rooms. drums, amps &amp; mics already set up!
          </p>

          <div className="relative mt-5 inline-block -rotate-1 border-2 border-dashed px-4 py-3" style={{ borderColor: v.navy, background: v.paper }}>
            <p className="text-xs font-bold" style={mono}>✂ CLIP &amp; BRING YOUR BAND</p>
            <p className="text-3xl font-bold" style={{ ...mono, color: v.blue }}>₱250/HR</p>
            <p className="text-xs" style={mono}>per room · 9 AM – 9 PM</p>
          </div>
        </div>

        <div className="grid grid-cols-3 text-center text-xs font-bold" style={{ ...mono, borderTop: `3px solid ${v.navy}` }}>
          <span className="py-3" style={{ background: v.yellow }}>REHEARSE</span>
          <span className="py-3" style={{ background: v.pink, borderInline: `3px solid ${v.navy}` }}>LEARN</span>
          <span className="py-3" style={{ background: v.blue, color: '#fff' }}>STREAM</span>
        </div>
      </div>
    </BrowserFrame>
  )
}

/* ---------- Final: Taped to the wall (palette v3, the current site) ---------- */

function TapedWallMock() {
  return (
    <BrowserFrame bar="#1E1F24">
      <div className="bg-ink text-paper">
        <div className="flex items-center justify-between border-b border-slate px-5 py-3">
          <span className="font-display text-lg">Manoy Bart&rsquo;s Studio</span>
          <span className="btn btn-primary min-h-0 px-3 py-1 text-sm">Book a room</span>
        </div>
        <div className="grid gap-8 px-5 pt-8 pb-12 sm:grid-cols-[1.1fr_1fr] sm:items-center">
          <div>
            <p className="eyebrow text-muted">Rehearsal studio / 3 rooms</p>
            <p className="display mt-3 text-5xl leading-[0.95]">Got a band?<br />Play it <Highlight className="font-dirt">loud.</Highlight></p>
            <p className="mt-4 max-w-sm text-sm">Three rehearsal rooms. The backline&rsquo;s ready — all you need to bring is your band.</p>
            <div className="mt-5 flex gap-3">
              <span className="btn btn-primary text-sm">Book your jam</span>
            </div>
          </div>
          <div className="relative rotate-2">
            <DuotoneImage photo="bandRehearsalStudio" alt="" torn={11} tone="natural" halftone={false} className="aspect-[4/3] w-full" />
            <Tape className="-top-3 left-6" rotate={-20} />
          </div>
        </div>
        <div className="bg-band px-5 py-4 text-ink">
          <p className="font-display text-xl">3 rooms · ₱250 / hour / room · Standard gear included</p>
        </div>
      </div>
    </BrowserFrame>
  )
}

const drafts: Draft[] = [
  {
    id: 'booking-app',
    label: 'Draft 1 · bright booking app',
    title: 'Clean, bright booking app',
    idea: 'Design it like a modern booking app instead of a band site: a light background, rounded cards, friendly sentence-case type, and the room search right in the hero so you can book without scrolling.',
    palette: [
      { name: 'Ink', hex: '#0E0426' },
      { name: 'Violet', hex: '#5B3FD9' },
      { name: 'Lavender', hex: '#E9E5FA' },
      { name: 'Coral', hex: '#FF7A59' },
      { name: 'Mist', hex: '#F6F5FB' },
    ],
    good: [
      'The fastest path to a booking: date, time and open rooms are visible the moment the page loads.',
      'Familiar app patterns (chips, cards, one big button) need no explaining, even for first-time visitors.',
      'Bright and welcoming, which suits parents booking lessons for their kids, not only bands.',
    ],
    movedOn: [
      'It could be any booking app: nothing says rehearsal studio or the local band scene.',
      'Clean white screens fight the studio’s real photos, which are dark, sweaty and loud.',
      'Bands are the main customers, and this felt more like a dentist’s booking page than a place to play.',
    ],
    caption: 'Mock-up of draft 1: a light, app-style homepage with a violet logo, the headline “Book a rehearsal room in under a minute.”, a rounded booking card with date chips and open or taken rooms, and three small service cards.',
    mock: <BookingAppMock />,
  },
  {
    id: 'riso-zine',
    label: 'Draft 2 · risograph zine',
    title: 'Risograph gig zine',
    idea: 'Make the site feel like a photocopied zine from the local scene: warm paper, two-colour blue and pink print that’s slightly off-register, a typewriter font, handwritten notes, and a clip-out coupon for the price.',
    palette: [
      { name: 'Paper', hex: '#F3EEE3' },
      { name: 'Riso blue', hex: '#2340A8' },
      { name: 'Fluoro pink', hex: '#FF4FA3' },
      { name: 'Sunflower', hex: '#FFD23F' },
      { name: 'Navy', hex: '#1C2040' },
    ],
    good: [
      'Memorable and joyful: it stands out from every other dark “rock” website.',
      'Ties the studio to DIY gig flyers and zines, which fits its monthly gigs and local events.',
      'Playful details (the coupon, the handwriting) make the price feel friendly, not salesy.',
    ],
    movedOn: [
      'The bright pink and yellow feel cute, which clashes with heavy rehearsals and loud sets.',
      'Strong colours compete with the real photos of the rooms, which bands want to see.',
      'Off-register print effects and pink and yellow fills can’t be used for text, so forms and prices would need a separate, plainer style anyway.',
    ],
    caption: 'Mock-up of draft 2: a cream paper homepage styled like a printed zine, with “JAM HERE.” in big blue typewriter letters with a pink offset shadow, overlapping pink, dotted-blue and yellow star shapes, a handwritten note, a dashed clip-out coupon reading ₱250 per hour, and a three-colour strip for rehearse, learn and stream.',
    mock: <RisoZineMock />,
  },
  {
    id: 'taped-wall',
    label: 'Final · palette v3',
    title: 'Taped to the rehearsal-room wall',
    idea: 'Like a flyer taped up in the studio: neutral greys, warm off-white paper, torn edges and tape, real photos of the rooms, and mixed-case type with only the loud words in capitals.',
    palette: [
      { name: 'Ink', hex: '#141519' },
      { name: 'Charcoal', hex: '#1E1F24' },
      { name: 'Surface', hex: '#272A33' },
      { name: 'Slate', hex: '#64656B' },
      { name: 'Rust', hex: '#A63726' },
      { name: 'Paper', hex: '#ECE7DE' },
      { name: 'Band', hex: '#C6BFB2' },
    ],
    good: [],
    chosen: [
      'Takes the best of both drafts: the clear booking path of draft 1 and the local-scene character of draft 2.',
      'Neutral greys let the real photos and the rust buttons do the talking.',
      'Torn paper and tape feel like the local scene, and the texture fades out on forms, prices and the admin.',
      'Every colour pair has a measured contrast, and status always has a word or icon, not just a colour.',
    ],
    caption: 'Mock-up of the current design: a grey homepage with “Got a band? Play it LOUD.”, a taped, torn-edge photo of a band rehearsing, a torn-paper button, and a light band of key facts.',
    mock: <TapedWallMock />,
  },
]

function Swatches({ palette }: { palette: Swatch[] }) {
  return (
    <ul className="flex flex-wrap gap-3" aria-label="Colour palette">
      {palette.map((s) => (
        <li key={s.hex} className="w-20">
          <span aria-hidden="true" className="block h-10 rounded-md border border-slate" style={{ background: s.hex }} />
          <span className="mt-1 block text-xs font-semibold text-paper">{s.name}</span>
          <span className="block font-mono text-xs text-muted">{s.hex}</span>
        </li>
      ))}
    </ul>
  )
}

function Points({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-paper">{title}</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-paper/90 marker:text-rust-light">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  )
}

export function DesignDraftsPage() {
  useTitle('Design drafts')
  return (
    <>
      <PageHeader eyebrow="Behind the site" title="Design drafts." photo="roomBwWide">
        Three very different directions for the homepage, and why the one you see now won.
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Callout tone="info" title="Rebuilt for this page">
          The original early drafts weren&rsquo;t saved. Drafts 1 and 2 are rebuilt as clearly different directions, to show
          the range of looks a studio site could take; their layouts, colours and wording are illustrations. The final
          design is the one on this site.
        </Callout>

        <div className="mt-14 space-y-20">
          {drafts.map((d) => (
            <section key={d.id} id={d.id} aria-labelledby={`${d.id}-title`} className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
              <figure>
                <div aria-hidden="true">{d.mock}</div>
                <figcaption className="mt-4 text-sm text-muted">{d.caption}</figcaption>
              </figure>
              <div className="space-y-6">
                <div>
                  <p className="eyebrow text-rust-light">{d.label}</p>
                  <h2 id={`${d.id}-title`} className="display mt-2 text-4xl text-paper">{d.title}</h2>
                  <p className="mt-3 text-paper/90">{d.idea}</p>
                </div>
                <Swatches palette={d.palette} />
                {d.good.length > 0 && <Points title="Why it’s good" items={d.good} />}
                {d.movedOn && <Points title="Why we moved on" items={d.movedOn} />}
                {d.chosen && <Points title="Why we chose it" items={d.chosen} />}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-4 border-t border-slate pt-10">
          <p className="text-paper">Seen enough drafts? The real thing is ready.</p>
          <Link to="/book" className="btn btn-primary">
            Book your jam <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </div>
    </>
  )
}

import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { DuotoneImage, Highlight, Tape } from '../../components/grunge'

/**
 * Design drafts (user request, 2026-11-20): the homepage looks we tried before settling on
 * the current design. The original drafts weren't saved, so these are RECREATED from the
 * build notes: palette v1 (#0E0426 / #1A1740), palette v2 (#181B26 / #1C2040), all-caps type
 * and drawn instrument pictures, then palette v3 (the current look).
 * The mock-ups are pictures of a design, not working pages, so they are hidden from screen
 * readers and described in their captions instead.
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

/* ---------- Drawn instrument pictures (drafts used these before real photos) ---------- */

function GuitarDrawing({ body, line, className = '' }: { body: string; line: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-hidden="true">
      <rect x="49" y="2" width="22" height="22" rx="4" fill={line} />
      <rect x="55" y="20" width="10" height="100" fill={line} />
      <circle cx="60" cy="118" r="30" fill={body} stroke={line} strokeWidth="4" />
      <circle cx="60" cy="168" r="42" fill={body} stroke={line} strokeWidth="4" />
      <circle cx="60" cy="128" r="11" fill={line} />
      <rect x="44" y="176" width="32" height="7" rx="2" fill={line} />
      {[56, 59, 62, 65].map((x) => (
        <line key={x} x1={x} y1="22" x2={x} y2="180" stroke={body} strokeWidth="1" opacity="0.7" />
      ))}
    </svg>
  )
}

function DrumDrawing({ shell, line, className = '' }: { shell: string; line: string; className?: string }) {
  return (
    <svg viewBox="0 0 220 190" className={className} aria-hidden="true">
      <line x1="40" y1="20" x2="105" y2="75" stroke={line} strokeWidth="6" strokeLinecap="round" />
      <line x1="180" y1="20" x2="120" y2="75" stroke={line} strokeWidth="6" strokeLinecap="round" />
      <rect x="30" y="90" width="160" height="70" fill={shell} stroke={line} strokeWidth="4" />
      <ellipse cx="110" cy="160" rx="80" ry="18" fill={shell} stroke={line} strokeWidth="4" />
      <ellipse cx="110" cy="90" rx="80" ry="18" fill={line} />
      {[50, 80, 110, 140, 170].map((x) => (
        <line key={x} x1={x} y1="104" x2={x} y2="172" stroke={line} strokeWidth="3" />
      ))}
    </svg>
  )
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

/* ---------- Draft 1: Midnight gig poster (palette v1) ---------- */

function MidnightPosterMock() {
  const v = { ink: '#0E0426', surface: '#1A1740', rust: '#A63726', paper: '#ECE7DE', light: '#EE7360' }
  return (
    <BrowserFrame bar={v.surface}>
      <div style={{ background: v.ink, color: v.paper }} className="font-display uppercase">
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `2px solid ${v.surface}` }}>
          <span className="text-lg tracking-wider">Manoy Bart&rsquo;s Studio</span>
          <span className="hidden gap-4 text-sm tracking-widest sm:flex">
            <span>Rooms</span><span>Rates</span><span>Lessons</span><span>Shop</span>
          </span>
        </div>
        <div className="relative overflow-hidden px-5 pt-8 pb-10 text-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{ background: `radial-gradient(circle at 50% 30%, ${v.surface} 0%, transparent 60%)` }}
          />
          <p className="relative text-sm tracking-[0.3em]" style={{ color: v.light }}>★ Live every night ★ 3 rooms ★</p>
          <p className="relative mt-3 text-5xl leading-[0.9] sm:text-6xl">Book a room.</p>
          <p className="relative text-5xl leading-[0.9] sm:text-6xl" style={{ color: v.light }}>Play it loud.</p>
          <div className="relative mx-auto mt-6 grid size-40 place-items-center rounded-full" style={{ background: v.rust }}>
            <GuitarDrawing body={v.ink} line={v.paper} className="h-32 -rotate-12" />
          </div>
          <div className="relative mt-6 flex justify-center gap-3 text-base tracking-widest">
            <span className="px-5 py-2" style={{ background: v.rust, color: v.paper }}>Book now</span>
            <span className="px-5 py-2" style={{ border: `2px solid ${v.paper}` }}>See rates</span>
          </div>
        </div>
        <div className="grid grid-cols-3 text-center text-sm tracking-widest" style={{ background: v.surface }}>
          <span className="py-3">₱250 / hour</span>
          <span className="py-3" style={{ borderInline: `2px solid ${v.ink}` }}>9 AM – 9 PM</span>
          <span className="py-3">Gear included</span>
        </div>
      </div>
    </BrowserFrame>
  )
}

/* ---------- Draft 2: Stage blue, structured (palette v2) ---------- */

function StageBlueMock() {
  const v = { ink: '#181B26', surface: '#1C2040', slate: '#64656B', rust: '#A63726', paper: '#ECE7DE', light: '#EE7360', muted: '#A3A29D' }
  const dots: CSSProperties = {
    backgroundImage: `radial-gradient(${v.slate} 1.5px, transparent 1.6px)`,
    backgroundSize: '10px 10px',
  }
  return (
    <BrowserFrame bar={v.surface}>
      <div style={{ background: v.ink, color: v.paper }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${v.slate}` }}>
          <span className="font-display text-lg uppercase tracking-wider">Manoy Bart&rsquo;s Studio</span>
          <span className="hidden gap-4 font-mono text-xs uppercase sm:flex" style={{ color: v.muted }}>
            <span>01 Rooms</span><span>02 Rates</span><span>03 Lessons</span>
          </span>
        </div>
        <div className="grid gap-6 px-5 py-8 sm:grid-cols-[1.2fr_1fr] sm:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: v.muted }}>Rehearsal studio / 3 rooms / 9 AM – 9 PM</p>
            <p className="mt-3 font-display text-5xl uppercase leading-[0.95]">Book a room.<br />Bring the band.</p>
            <p className="mt-4 max-w-sm text-sm" style={{ color: v.muted }}>Drums, amps and mics in every room. ₱250 per hour, per room.</p>
            <div className="mt-5 flex gap-3 text-sm font-semibold">
              <span className="px-4 py-2" style={{ background: v.rust, color: v.paper }}>Book a room →</span>
              <span className="px-4 py-2" style={{ border: `1px solid ${v.slate}` }}>See rates</span>
            </div>
          </div>
          <div className="relative grid aspect-square place-items-center" style={{ background: v.surface, ...dots }}>
            <DrumDrawing shell={v.surface} line={v.paper} className="w-3/4" />
          </div>
        </div>
        <div className="grid gap-px sm:grid-cols-3" style={{ background: v.slate }}>
          {[
            ['Rehearsal', '₱250 / hour'],
            ['Lessons', 'From ₱500'],
            ['Streaming', 'Packages TBD'],
          ].map(([t, p]) => (
            <div key={t} className="px-5 py-4" style={{ background: v.ink }}>
              <p className="font-display text-xl uppercase">{t}</p>
              <p className="font-mono text-xs" style={{ color: v.muted }}>{p}</p>
            </div>
          ))}
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
    id: 'midnight-poster',
    label: 'Draft 1 · palette v1',
    title: 'Midnight gig poster',
    idea: 'Treat the homepage like a poster for a night show: deep purple-black, everything centred, all-caps type, and a drawn guitar in a red circle where a photo would go.',
    palette: [
      { name: 'Ink', hex: '#0E0426' },
      { name: 'Surface', hex: '#1A1740' },
      { name: 'Rust', hex: '#A63726' },
      { name: 'Paper', hex: '#ECE7DE' },
    ],
    good: [
      'Says “live music at night” in a second. The mood is unmistakable.',
      'A centred poster layout has one clear message and one button to press.',
      'Drawn instruments let us design before the studio had photos ready, with no photo-rights questions.',
    ],
    movedOn: [
      'The purple read more like a nightclub than a rehearsal studio.',
      'All-caps text is tiring to read beyond a headline.',
      'Rust text on the purple measured only about 2.6:1, too low to read, so rust became a fill colour only.',
    ],
    caption: 'Recreated mock-up of draft 1: a deep purple homepage with a centred all-caps headline, “Book a room. Play it loud.”, a drawn guitar in a red circle, and a strip with the price, hours and included gear.',
    mock: <MidnightPosterMock />,
  },
  {
    id: 'stage-blue',
    label: 'Draft 2 · palette v2',
    title: 'Stage blue, built on a grid',
    idea: 'Calm it down: a cooler blue-black like a room under stage lights, a left-aligned grid, numbered typewriter labels, and halftone dots behind a drawn drum kit.',
    palette: [
      { name: 'Ink', hex: '#181B26' },
      { name: 'Surface', hex: '#1C2040' },
      { name: 'Slate', hex: '#64656B' },
      { name: 'Rust', hex: '#A63726' },
      { name: 'Paper', hex: '#ECE7DE' },
    ],
    good: [
      'Easier on the eyes for longer visits: the booking flow and prices read clearly.',
      'The grid and numbered labels make it obvious where everything is.',
      'Rust used only on the main button, so “Book a room” stands out on every screen.',
    ],
    movedOn: [
      'Still tinted blue; the studio wanted honest greys and a warm off-white.',
      'Tidy, but it lost the scrappy, hand-made feel of the local band scene.',
      'Drawn pictures can’t show the real rooms, which is what bands want to see.',
    ],
    caption: 'Recreated mock-up of draft 2: a blue-black homepage with an all-caps headline, “Book a room. Bring the band.”, a drawn drum kit on a halftone dot panel, and three service boxes for rehearsal, lessons and streaming.',
    mock: <StageBlueMock />,
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
      'Neutral greys let the real photos and the rust buttons do the talking.',
      'Mixed-case text is easy to read; capitals are kept for the words that should shout.',
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
        The homepage looks we tried before landing on the one you see now, and what each one taught us.
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Callout tone="info" title="Recreated from our notes">
          The original drafts weren&rsquo;t saved, so these mock-ups were rebuilt from the build notes: the colours are the
          exact ones we used, while the layouts and wording are close recreations. The studio name is shown as it is today.
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

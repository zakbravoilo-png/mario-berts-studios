import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import '@fontsource/shrikhand/latin-400.css'
import '@fontsource/rubik-spray-paint/latin-400.css'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { DuotoneImage, Highlight, Tape } from '../../components/grunge'

/**
 * Design drafts (user request, 2026-11-20): alternative homepage directions shown next to the
 * final look. The original early drafts weren't saved, and the user asked for drafts that are
 * clearly different from the final design, so drafts 1 and 2 are ILLUSTRATIVE directions built
 * for this page: a sunny 70s "groovy" look and a skate-punk graffiti look.
 * Their display fonts (Shrikhand, Rubik Spray Paint) are imported here only.
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

/* ---------- Draft 1: Sunshine groove ---------- */

function Daisy({ petal, center, className = '' }: { petal: string; center: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="50" cy="24" rx="12" ry="22" fill={petal} transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="15" fill={center} />
    </svg>
  )
}

function WavyStripes({ colors }: { colors: string[] }) {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="block h-12 w-full" aria-hidden="true">
      {colors.map((c, i) => (
        <path key={c} d={`M0 ${12 + i * 14} Q50 ${i * 14} 100 ${12 + i * 14} T200 ${12 + i * 14} T300 ${12 + i * 14} T400 ${12 + i * 14} V60 H0Z`} fill={c} />
      ))}
    </svg>
  )
}

function SunshineGrooveMock() {
  const v = { cream: '#FFF4DC', glow: '#FFE29A', sun: '#FFC93C', tangerine: '#F7882F', rust: '#D2541F', brown: '#4A2511', avocado: '#7C8C2E', blush: '#F4A6A0' }
  const groovy: CSSProperties = { fontFamily: "'Shrikhand', 'Cooper Black', Georgia, serif", textTransform: 'none', letterSpacing: 0 }
  const sans: CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none' }
  return (
    <BrowserFrame bar="#F3E3BC">
      <div style={{ background: v.cream, color: v.brown, ...sans }}>
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xl" style={groovy}>Manoy Bart&rsquo;s</span>
          <span className="hidden gap-4 text-sm font-semibold sm:flex">
            <span>Rooms</span><span>Lessons</span><span>Good times</span>
          </span>
          <span className="rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: v.brown, color: v.cream }}>Book a jam</span>
        </div>

        <div
          className="relative overflow-hidden px-5 pt-8 pb-36 text-center"
          style={{ background: `repeating-conic-gradient(from 0deg at 50% 100%, ${v.glow} 0deg 6deg, ${v.cream} 6deg 12deg)` }}
        >
          {/* Rainbow arch rising like the sun */}
          <div aria-hidden="true" className="absolute -bottom-40 left-1/2 size-80 -translate-x-1/2 rounded-full" style={{ background: v.brown }} />
          <div aria-hidden="true" className="absolute -bottom-32 left-1/2 size-64 -translate-x-1/2 rounded-full" style={{ background: v.rust }} />
          <div aria-hidden="true" className="absolute -bottom-24 left-1/2 size-48 -translate-x-1/2 rounded-full" style={{ background: v.tangerine }} />
          <div aria-hidden="true" className="absolute -bottom-16 left-1/2 size-32 -translate-x-1/2 rounded-full" style={{ background: v.sun }} />
          <Daisy petal="#FFFFFF" center={v.sun} className="absolute -top-3 -left-3 size-12 rotate-12 sm:top-4 sm:left-3 sm:size-14" />
          <Daisy petal={v.blush} center={v.tangerine} className="absolute right-4 bottom-16 size-16 -rotate-12" />

          <p className="relative text-sm font-bold tracking-wide">☀ 3 rehearsal rooms · Jaro, Iloilo ☀</p>
          <p className="relative mt-3 text-5xl leading-[1.05] sm:text-6xl" style={{ ...groovy, textShadow: `3px 3px 0 ${v.tangerine}` }}>
            Good vibes,<br />loud jams.
          </p>
          <p className="relative mx-auto mt-4 max-w-xs text-sm font-medium">
            The gear&rsquo;s all set up. Just bring your band and your best grooves.
          </p>
          <div className="relative mt-5 flex justify-center gap-3">
            <span className="rounded-full px-5 py-2 text-sm font-bold" style={{ background: v.brown, color: v.cream }}>Book your jam ✿</span>
            <span className="rounded-full border-2 px-5 py-2 text-sm font-bold" style={{ borderColor: v.brown, background: v.cream }}>See rates</span>
          </div>
          <div
            className="absolute bottom-4 left-3 grid size-20 rotate-12 place-items-center rounded-full text-center leading-tight sm:top-24 sm:right-8 sm:bottom-auto sm:left-auto sm:size-24"
            style={{ background: v.avocado, color: v.cream, ...groovy }}
          >
            <span className="text-lg sm:text-xl">₱250<br /><span className="text-xs" style={sans}>per hour</span></span>
          </div>
        </div>

        <WavyStripes colors={[v.sun, v.tangerine, v.rust, v.brown]} />
        <div className="grid grid-cols-3 gap-2 px-4 py-4 text-center text-xs font-bold sm:text-sm" style={{ background: v.brown, color: v.cream }}>
          <span>✿ Rehearse</span><span>✿ Learn</span><span>✿ Stream</span>
        </div>
      </div>
    </BrowserFrame>
  )
}

/* ---------- Draft 2: Skate-punk graffiti ---------- */

function PaintDrips({ color, className = '' }: { color: string; className?: string }) {
  const drips: [number, number][] = [[18, 26], [44, 14], [70, 34], [112, 20], [150, 40], [196, 16], [232, 30], [268, 22]]
  return (
    <svg viewBox="0 0 300 50" className={className} aria-hidden="true">
      <rect x="6" y="0" width="288" height="8" rx="4" fill={color} />
      {drips.map(([x, h]) => (
        <g key={x}>
          <rect x={x - 2.5} y="4" width="5" height={h} fill={color} />
          <circle cx={x} cy={4 + h} r="4" fill={color} />
        </g>
      ))}
    </svg>
  )
}

function SkateDeck({ deck, line, className = '' }: { deck: string; line: string; className?: string }) {
  return (
    <svg viewBox="0 0 90 260" className={className} aria-hidden="true">
      <rect x="10" y="4" width="70" height="252" rx="35" fill={deck} stroke={line} strokeWidth="5" />
      <path d="M22 110 L68 150 M68 110 L22 150" stroke={line} strokeWidth="9" strokeLinecap="round" />
      {[52, 208].map((y) => (
        <g key={y}>
          <rect x="22" y={y - 5} width="46" height="10" rx="3" fill={line} />
          <circle cx="16" cy={y} r="9" fill={line} />
          <circle cx="74" cy={y} r="9" fill={line} />
        </g>
      ))}
    </svg>
  )
}

function SkatePunkMock() {
  const v = { concrete: '#CFCCC6', black: '#111111', lime: '#B8F400', magenta: '#E6007E', cyan: '#00B8D9', white: '#FAFAF7' }
  const spray: CSSProperties = { fontFamily: "'Rubik Spray Paint', 'Permanent Marker', Impact, sans-serif", textTransform: 'none' }
  const stencil: CSSProperties = { fontFamily: "'Space Mono', 'Courier New', monospace", fontWeight: 700, textTransform: 'uppercase' }
  const wall: CSSProperties = {
    backgroundColor: v.concrete,
    backgroundImage: `radial-gradient(rgba(17,17,17,0.18) 1px, transparent 1.4px), radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1.4px)`,
    backgroundSize: '7px 7px, 11px 11px',
    backgroundPosition: '0 0, 3px 5px',
  }
  return (
    <BrowserFrame bar="#2A2A2A">
      <div style={{ color: v.black }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: v.black }}>
          <span className="text-sm" style={{ ...stencil, color: v.lime }}>Manoy Bart&rsquo;s //</span>
          <span className="hidden gap-4 text-xs sm:flex" style={{ ...stencil, color: v.white }}>
            <span>Rooms</span><span>Rates</span><span>Gigs</span>
          </span>
          <span className="rotate-2 border-2 px-3 py-1 text-xs" style={{ ...stencil, background: v.magenta, color: v.white, borderColor: v.white }}>Book now</span>
        </div>

        <div className="relative overflow-hidden px-5 pt-6 pb-8" style={wall}>
          <div className="relative grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-center">
            <div className="relative">
              <p
                className="relative -rotate-3 text-6xl leading-none sm:text-7xl"
                style={{ ...spray, color: v.lime, WebkitTextStroke: `2px ${v.black}`, textShadow: `4px 4px 0 ${v.magenta}` }}
              >
                Manoy<br />Bart&rsquo;s
              </p>
              <PaintDrips color={v.lime} className="relative -mt-1 w-56 -rotate-3" />
              <p className="mt-3 inline-block -rotate-2 px-3 py-1.5 text-sm" style={{ ...stencil, background: v.black, color: v.white }}>
                No rules. Just riffs.
              </p>
              <p className="marker mt-3 max-w-60 rotate-1 text-base" style={{ color: v.black }}>
                3 rooms · drums, amps &amp; mics ready to shred
              </p>
            </div>

            <div className="relative mx-auto h-56 w-44 sm:h-64">
              <SkateDeck deck={v.magenta} line={v.black} className="absolute top-0 left-6 h-full rotate-[18deg]" />
              <span
                className="absolute top-6 -left-2 grid size-20 -rotate-12 place-items-center rounded-full border-4 text-center text-sm leading-tight"
                style={{ ...stencil, background: v.cyan, color: v.black, borderColor: v.black }}
              >
                ₱250<br />/hr
              </span>
              <span className="absolute right-0 bottom-6 rotate-6 border-4 px-2 py-1 text-xs" style={{ ...stencil, background: v.white, borderColor: v.black }}>
                Loud zone
              </span>
              <span className="absolute -right-2 top-2 text-3xl" style={{ ...spray, color: v.black }} aria-hidden="true">★</span>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-6"
          style={{ backgroundImage: `repeating-conic-gradient(${v.black} 0 25%, ${v.white} 0 50%)`, backgroundSize: '24px 24px' }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ background: v.black }}>
          <span className="text-xs" style={{ ...stencil, color: v.white }}>Open 9 AM – 9 PM · Jaro, Iloilo</span>
          <span className="-rotate-2 border-4 px-4 py-1.5 text-sm shadow-[4px_4px_0_#E6007E]" style={{ ...stencil, background: v.lime, borderColor: v.white, color: v.black }}>
            Book a room →
          </span>
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
    id: 'sunshine-groove',
    label: 'Draft 1 · sunshine groove',
    title: 'Sunshine and good vibes',
    idea: 'A warm, sunny 70s look: cream and sunflower colours, a sunburst behind the headline, a rainbow arch rising like the sun, daisies, wavy stripes and a big rounded groovy font. It feels like a laid-back jam on a summer afternoon.',
    palette: [
      { name: 'Cream', hex: '#FFF4DC' },
      { name: 'Sunflower', hex: '#FFC93C' },
      { name: 'Tangerine', hex: '#F7882F' },
      { name: 'Burnt orange', hex: '#D2541F' },
      { name: 'Avocado', hex: '#7C8C2E' },
      { name: 'Cocoa', hex: '#4A2511' },
    ],
    good: [
      'Warm and welcoming: friendly to beginners, kids taking lessons and their parents, not only seasoned bands.',
      'Instantly different from the usual dark, heavy rehearsal-studio websites.',
      'Dark brown text on cream is very easy to read, so prices and the booking form stay clear.',
    ],
    movedOn: [
      'Too mellow for the studio’s loud side: punk and metal bands might not see themselves here.',
      'The retro groovy style is a strong trend that can date quickly.',
      'Sunny yellows and oranges clash with the real photos of the dark rehearsal rooms.',
    ],
    caption: 'Mock-up of draft 1: a cream and sunflower homepage with a striped sunburst, a brown, orange and yellow rainbow arch rising from the bottom, daisies, the groovy headline “Good vibes, loud jams.” with an orange shadow, rounded brown buttons, a green ₱250 per hour badge, and wavy stripes above a strip for rehearse, learn and stream.',
    mock: <SunshineGrooveMock />,
  },
  {
    id: 'skate-punk',
    label: 'Draft 2 · skate-punk graffiti',
    title: 'Skate-punk and spray paint',
    idea: 'The studio as a graffiti wall at the skate park: speckled concrete, a spray-painted tag with paint drips, a skateboard deck, sticker-bombed prices, a checkerboard strip and stencil lettering, in acid lime and hot magenta.',
    palette: [
      { name: 'Concrete', hex: '#CFCCC6' },
      { name: 'Black', hex: '#111111' },
      { name: 'Acid lime', hex: '#B8F400' },
      { name: 'Magenta', hex: '#E6007E' },
      { name: 'Cyan', hex: '#00B8D9' },
      { name: 'White', hex: '#FAFAF7' },
    ],
    good: [
      'Loud, rebellious energy that speaks straight to young punk and rock bands.',
      'Stickers and tags make the price and facts feel like part of the scene, not an advert.',
      'Very shareable: it looks like a gig poster people would screenshot and send to their band chat.',
    ],
    movedOn: [
      'Graffiti lettering is hard to read, so it only works for a word or two.',
      'Acid lime and magenta shout over everything, including the booking button.',
      'It narrows the audience: lesson students and older bands might feel it isn’t for them.',
    ],
    caption: 'Mock-up of draft 2: a speckled concrete wall with “Manoy Bart’s” spray-painted in lime with a black outline, magenta shadow and dripping paint, a black stencil label “No rules. Just riffs.”, a magenta skateboard deck with a cyan ₱250 per hour sticker and a “Loud zone” sticker, a black and white checkerboard strip, and a lime “Book a room” sticker button.',
    mock: <SkatePunkMock />,
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
      'Sits between the two: the easy reading and welcome of draft 1 with the raw, local-scene energy of draft 2.',
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

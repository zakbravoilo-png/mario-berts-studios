import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import '@fontsource/shrikhand/latin-400.css'
import '@fontsource/rubik-spray-paint/latin-400.css'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { Highlight, Tape, TornEdge } from '../../components/grunge'
import { tornClipPath } from '../../components/grunge/torn'

/**
 * Design drafts (user request, 2026-11-20): alternative homepage directions shown next to the
 * final look. The original early drafts weren't saved, and the user asked for drafts that are
 * clearly different from the final design, so drafts 1 and 2 are ILLUSTRATIVE directions built
 * for this page: a 70s groovy record-shop look and a skate-punk graffiti look. All instruments
 * are simple SVG drawings made for this page.
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

/* ---------- Shared music illustrations (simple flat SVG drawings) ---------- */

function ElectricGuitar({ body, line, neck, className = '' }: { body: string; line: string; neck: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 320" className={className} aria-hidden="true">
      <path d="M52 8 L72 2 L74 42 L54 46 Z" fill={line} />
      <rect x="56" y="42" width="13" height="152" fill={neck} stroke={line} strokeWidth="3" />
      {[62, 80, 98, 116, 134, 152, 170].map((y) => (
        <line key={y} x1="56" y1={y} x2="69" y2={y} stroke={line} strokeWidth="1.5" />
      ))}
      <path
        d="M40 186 C18 180 8 206 18 228 C26 246 16 262 26 284 C38 308 86 312 100 290 C110 274 100 258 104 242 C110 222 116 196 98 186 C88 182 80 192 74 198 L52 198 C48 192 50 188 40 186 Z"
        fill={body}
        stroke={line}
        strokeWidth="4"
      />
      <rect x="48" y="214" width="30" height="8" rx="2" fill={line} />
      <rect x="48" y="236" width="30" height="8" rx="2" fill={line} />
      <rect x="50" y="262" width="26" height="6" rx="2" fill={line} />
      <circle cx="88" cy="270" r="4.5" fill={line} />
      <circle cx="92" cy="284" r="4.5" fill={line} />
      {[59, 61.5, 64, 66.5].map((x) => (
        <line key={x} x1={x} y1="44" x2={x} y2="264" stroke={neck} strokeWidth="0.8" />
      ))}
    </svg>
  )
}

function VinylRecord({ disc, label, className = '' }: { disc: string; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill={disc} />
      {[42, 36, 30, 24].map((r) => (
        <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      ))}
      <circle cx="50" cy="50" r="15" fill={label} />
      <circle cx="50" cy="50" r="2.5" fill={disc} />
    </svg>
  )
}

function Cassette({ shell, label, line, className = '' }: { shell: string; label: string; line: string; className?: string }) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden="true">
      <rect x="2" y="2" width="156" height="96" rx="8" fill={shell} stroke={line} strokeWidth="3" />
      <rect x="14" y="12" width="132" height="50" rx="4" fill={label} />
      <line x1="24" y1="24" x2="136" y2="24" stroke={line} strokeWidth="2" opacity="0.5" />
      <rect x="40" y="34" width="80" height="22" rx="11" fill={line} />
      <circle cx="54" cy="45" r="7" fill={label} />
      <circle cx="106" cy="45" r="7" fill={label} />
      <path d="M36 98 L46 74 L114 74 L124 98" fill="none" stroke={line} strokeWidth="3" />
    </svg>
  )
}

function Microphone({ head, line, className = '' }: { head: string; line: string; className?: string }) {
  return (
    <svg viewBox="0 0 60 150" className={className} aria-hidden="true">
      <rect x="12" y="4" width="36" height="48" rx="18" fill={head} stroke={line} strokeWidth="3" />
      {[16, 26, 36].map((y) => (
        <line key={y} x1="14" y1={y} x2="46" y2={y} stroke={line} strokeWidth="2" />
      ))}
      <path d="M20 52 L24 140 Q30 146 36 140 L40 52 Z" fill={line} />
    </svg>
  )
}

function MusicNote({ color, className = '' }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 40 60" className={className} aria-hidden="true">
      <ellipse cx="13" cy="48" rx="11" ry="8" fill={color} transform="rotate(-20 13 48)" />
      <rect x="20" y="6" width="4" height="42" fill={color} />
      <path d="M24 6 C36 12 38 24 31 32 C33 23 29 17 24 17 Z" fill={color} />
    </svg>
  )
}

function AmpStack({ cab, line, className = '' }: { cab: string; line: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true">
      <rect x="4" y="4" width="112" height="32" rx="3" fill={cab} stroke={line} strokeWidth="3" />
      {[24, 40, 56, 72, 88].map((x) => <circle key={x} cx={x} cy="20" r="4" fill={line} />)}
      <rect x="4" y="42" width="112" height="104" rx="3" fill={cab} stroke={line} strokeWidth="3" />
      {[[34, 70], [86, 70], [34, 118], [86, 118]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="20" fill="none" stroke={line} strokeWidth="3" />
      ))}
    </svg>
  )
}

function Bolt({ color, className = '' }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 40 80" className={className} aria-hidden="true">
      <path d="M24 0 L4 44 L18 44 L12 80 L36 30 L22 30 Z" fill={color} />
    </svg>
  )
}

/** A drum kit drawn in loose pencil lines (each shape drawn twice, slightly offset). */
function DrumKitSketch({ line, className = '' }: { line: string; className?: string }) {
  const shapes = (
    <g fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {/* cymbals and stands */}
      <ellipse cx="62" cy="52" rx="42" ry="7" transform="rotate(-10 62 52)" />
      <path d="M62 58 L62 212 M62 212 L44 216 M62 212 L80 216" />
      <ellipse cx="262" cy="40" rx="40" ry="7" transform="rotate(12 262 40)" />
      <path d="M262 46 L268 212 M268 212 L250 216 M268 212 L286 216" />
      {/* rack toms */}
      <ellipse cx="128" cy="84" rx="28" ry="10" />
      <path d="M100 84 L102 112 Q128 124 154 112 L156 84" />
      <ellipse cx="196" cy="84" rx="28" ry="10" />
      <path d="M168 84 L170 112 Q196 124 222 112 L224 84" />
      {/* bass drum */}
      <circle cx="162" cy="158" r="56" />
      <circle cx="162" cy="158" r="40" strokeDasharray="5 6" />
      <path d="M126 210 L118 218 M198 210 L206 218" />
      {/* snare */}
      <ellipse cx="78" cy="146" rx="34" ry="10" />
      <path d="M44 146 L46 166 Q78 178 110 166 L112 146" />
      <path d="M78 176 L78 212 M78 212 L62 216 M78 212 L94 216" />
      {/* floor tom */}
      <ellipse cx="256" cy="144" rx="34" ry="11" />
      <path d="M222 144 L224 192 Q256 204 288 192 L290 144" />
      <path d="M230 196 L226 216 M282 196 L286 216" />
      {/* sticks */}
      <path d="M96 30 L132 70 M112 24 L140 66" />
    </g>
  )
  return (
    <svg viewBox="0 0 320 224" className={className} aria-hidden="true">
      {shapes}
      <g transform="translate(2.2 1.6)" opacity="0.4">{shapes}</g>
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

/* ---------- Draft 1: Groovy record-shop poster ---------- */

function GroovyRecordsMock() {
  const v = { cream: '#EADBC0', paper: '#F4EAD6', mustard: '#D29E3A', orange: '#C0592B', teal: '#2D6B66', coffee: '#3B2418' }
  const groovy: CSSProperties = { fontFamily: "'Shrikhand', 'Cooper Black', Georgia, serif", textTransform: 'none', letterSpacing: 0 }
  const sans: CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none' }
  return (
    <BrowserFrame bar="#D9C7A4">
      <div style={{ background: v.teal, color: v.coffee, ...sans }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: v.cream }}>
          <span className="text-xl" style={groovy}>Manoy Bart&rsquo;s</span>
          <span className="hidden gap-4 text-sm font-semibold sm:flex">
            <span>Rooms</span><span>Lessons</span><span>Records</span>
          </span>
          <span className="rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: v.coffee, color: v.cream }}>Book a jam</span>
        </div>
        <div style={{ color: v.cream, background: v.teal }}>
          <TornEdge className="" side="bottom" seed={23} height={18} />
        </div>

        <div className="relative overflow-hidden px-5 pt-6 pb-4">
          <div className="relative grid gap-4 sm:grid-cols-[1.15fr_1fr] sm:items-center">
            {/* Headline on a torn paper scrap */}
            <div className="relative -rotate-2 px-6 py-6" style={{ background: v.paper, clipPath: tornClipPath(31, 2.2, 18) }}>
              <p className="text-xs font-bold tracking-wide">♪ 3 rehearsal rooms · Jaro, Iloilo</p>
              <p className="mt-2 text-4xl leading-[1.05] sm:text-5xl" style={{ ...groovy, textShadow: `3px 3px 0 ${v.mustard}` }}>
                Good vibes,<br />loud jams.
              </p>
              <p className="mt-3 max-w-xs text-sm font-medium">The gear&rsquo;s all set up. Just bring your band and your best grooves.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: v.coffee, color: v.cream }}>Book your jam</span>
                <span className="rounded-full border-2 px-4 py-2 text-sm font-bold" style={{ borderColor: v.coffee }}>See rates</span>
              </div>
            </div>

            {/* A pile of music gear */}
            <div className="relative mx-auto h-64 w-64">
              <VinylRecord disc={v.coffee} label={v.orange} className="absolute top-2 right-0 size-40" />
              <ElectricGuitar body={v.orange} line={v.coffee} neck={v.cream} className="absolute -top-2 left-10 h-64 -rotate-[24deg]" />
              <Cassette shell={v.mustard} label={v.cream} line={v.coffee} className="absolute bottom-4 left-0 w-28 rotate-[-8deg]" />
              <Microphone head={v.cream} line={v.coffee} className="absolute right-6 bottom-0 h-24 rotate-12" />
              <MusicNote color={v.cream} className="absolute top-0 left-0 h-10" />
              <MusicNote color={v.mustard} className="absolute top-24 -right-2 h-8 rotate-12" />
              <div
                className="absolute bottom-0 left-28 grid size-20 rotate-6 place-items-center text-center leading-tight"
                style={{ background: v.mustard, clipPath: tornClipPath(47, 4, 10), ...groovy }}
              >
                <span className="text-lg">₱250<br /><span className="text-xs" style={sans}>per hour</span></span>
              </div>
            </div>
          </div>
        </div>

        <WavyStripes colors={[v.mustard, v.orange, v.coffee]} />
        <div className="flex justify-around gap-2 px-4 py-4 text-xs font-bold sm:text-sm" style={{ background: v.coffee, color: v.cream }}>
          {['Rehearse', 'Learn', 'Stream'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <MusicNote color={v.mustard} className="h-4" /> {t}
            </span>
          ))}
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

function SkatePunkMock() {
  const v = { concrete: '#CFCCC6', black: '#111111', lime: '#B8F400', magenta: '#E6007E', cyan: '#00B8D9', white: '#FAFAF7' }
  const spray: CSSProperties = { fontFamily: "'Rubik Spray Paint', 'Permanent Marker', Impact, sans-serif", textTransform: 'none' }
  const stencil: CSSProperties = { fontFamily: "'Space Mono', 'Courier New', monospace", fontWeight: 700, textTransform: 'uppercase' }
  /* Cinder-block wall: mortar lines over concrete grey. */
  const wall: CSSProperties = {
    backgroundColor: v.concrete,
    backgroundImage: 'linear-gradient(rgba(17,17,17,0.13) 2px, transparent 2px), linear-gradient(90deg, rgba(17,17,17,0.13) 2px, transparent 2px)',
    backgroundSize: '72px 36px',
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
          {/* Faded band mural painted on the wall, kept behind and away from the text */}
          <div aria-hidden="true" className="absolute inset-0 opacity-30">
            <DrumKitSketch line={v.black} className="absolute right-2 bottom-2 w-72" />
            <AmpStack cab={v.cyan} line={v.black} className="absolute top-4 right-40 hidden w-20 sm:block" />
            <Microphone head={v.magenta} line={v.black} className="absolute top-6 right-4 h-28 -rotate-12" />
            <Bolt color={v.magenta} className="absolute bottom-24 left-1/2 h-16 rotate-12" />
            <Bolt color={v.cyan} className="absolute top-2 right-28 h-12 -rotate-12" />
            <MusicNote color={v.black} className="absolute right-56 bottom-4 hidden h-10 sm:block" />
          </div>

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
              <p className="mt-3 inline-block rotate-1 px-2 py-1 text-sm" style={{ background: v.white, color: v.black, fontFamily: "'Permanent Marker', cursive" }}>
                3 rooms · drums, amps &amp; mics ready to shred
              </p>
            </div>

            <div className="relative mx-auto h-64 w-44">
              <ElectricGuitar body={v.magenta} line={v.black} neck={v.white} className="absolute -top-2 left-6 h-full rotate-[20deg]" />
              <span
                className="absolute top-8 -left-2 grid size-20 -rotate-12 place-items-center rounded-full border-4 text-center text-sm leading-tight"
                style={{ ...stencil, background: v.cyan, color: v.black, borderColor: v.black }}
              >
                ₱250<br />/hr
              </span>
              <span className="absolute right-0 bottom-6 rotate-6 border-4 px-2 py-1 text-xs" style={{ ...stencil, background: v.white, borderColor: v.black }}>
                Loud zone
              </span>
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
            {/* A pencil sketch of a drum kit on a torn sheet, taped up */}
            <div className="grid aspect-[4/3] w-full place-items-center bg-paper p-6" style={{ clipPath: tornClipPath(11, 2.2, 22) }}>
              <DrumKitSketch line="#141519" className="w-full" />
            </div>
            <Tape className="-top-3 left-6" rotate={-20} />
          </div>
        </div>
        <TornEdge className="text-band" underClassName="text-slate" backClassName="bg-ink" seed={9} height={22} />
        <div className="bg-band px-5 py-4 text-ink">
          <p className="font-display text-xl">3 rooms · ₱250 / hour / room · Standard gear included</p>
        </div>
      </div>
    </BrowserFrame>
  )
}

const drafts: Draft[] = [
  {
    id: 'groovy-records',
    label: 'Draft 1 · groovy record shop',
    title: 'Groovy record-shop poster',
    idea: 'A 70s record-shop look: teal, mustard, burnt orange and cream, a groovy rounded headline on a torn paper scrap, and a pile of drawn music gear around it (an electric guitar, a vinyl record, a mixtape, a mic and floating notes), finished with wavy stripes and torn paper edges.',
    palette: [
      { name: 'Cream', hex: '#EADBC0' },
      { name: 'Paper', hex: '#F4EAD6' },
      { name: 'Mustard', hex: '#D29E3A' },
      { name: 'Burnt orange', hex: '#C0592B' },
      { name: 'Teal', hex: '#2D6B66' },
      { name: 'Coffee', hex: '#3B2418' },
    ],
    good: [
      'Warm and welcoming: friendly to beginners, kids taking lessons and their parents, not only seasoned bands.',
      'The drawn guitar, record and mixtape say “music studio” before you read a word.',
      'Dark brown text on paper scraps is easy to read, so prices and buttons stay clear.',
    ],
    movedOn: [
      'Too mellow and retro for the studio’s loud side: punk and metal bands might not see themselves here.',
      'The 70s groovy style is a strong trend that can date quickly.',
      'Drawn gear can’t show the real rooms, which is what bands want to see before booking.',
    ],
    caption: 'Mock-up of draft 1: a teal homepage with a torn cream paper scrap holding the groovy headline “Good vibes, loud jams.”, brown rounded buttons, a torn mustard ₱250 per hour scrap, and drawings of an orange electric guitar, a vinyl record, a mixtape, a microphone and music notes, above mustard, orange and brown wavy stripes and a strip for rehearse, learn and stream.',
    mock: <GroovyRecordsMock />,
  },
  {
    id: 'skate-punk',
    label: 'Draft 2 · skate-punk graffiti',
    title: 'Skate-punk and spray paint',
    idea: 'The studio as a graffiti wall at the skate park: a cinder-block wall with a faded band mural (drum kit, amp stack, mic and lightning bolts), a spray-painted tag with paint drips, an electric guitar, sticker-bombed prices, a checkerboard strip and stencil lettering, in acid lime and hot magenta.',
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
    caption: 'Mock-up of draft 2: a grey cinder-block wall with a faded mural of a drum kit, amp stack, microphone and lightning bolts, “Manoy Bart’s” spray-painted in lime with a black outline, magenta shadow and dripping paint, a black stencil label “No rules. Just riffs.”, a magenta electric guitar with a cyan ₱250 per hour sticker and a “Loud zone” sticker, a black and white checkerboard strip, and a lime “Book a room” sticker button.',
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
    caption: 'Mock-up of the current design: a grey homepage with “Got a band? Play it LOUD.”, a pencil sketch of a drum kit on a torn, taped sheet of paper, a torn-paper button, and a light paper strip of key facts with a torn top edge.',
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

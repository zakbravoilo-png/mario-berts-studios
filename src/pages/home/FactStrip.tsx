import { Asterisk } from 'lucide-react'
import { Grain } from '../../components/grunge'
import { defaultSettings } from '../../data/settings'
import { formatPHP } from '../../utils/money'

/** Charcoal band of confirmed facts. Rust appears only on the small asterisk marks. */
export function FactStrip() {
  const facts = [
    '3 rooms',
    `${formatPHP(defaultSettings.roomRatePerHour)} / hour / room`,
    'Open 9 AM – 9 PM',
    'Standard gear included',
    '50% GCash downpayment',
  ]
  return (
    <div className="relative overflow-hidden bg-charcoal py-5 text-paper">
      <Grain fine={0.18} coarse={0.3} />
      <ul className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4" aria-label="Studio at a glance">
        {facts.map((f, i) => (
          <li key={f} className="flex items-center gap-5">
            {i > 0 && <Asterisk aria-hidden="true" className="size-5 shrink-0 text-rust-light" />}
            <span className="display text-xl xl:text-2xl">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

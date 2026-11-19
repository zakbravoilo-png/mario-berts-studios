import { Minus, Plus } from 'lucide-react'

/** Accessible −/+ quantity control with an announced value. */
export function QtyStepper({ value, min = 0, max, onChange, label }: { value: number; min?: number; max: number; onChange: (n: number) => void; label: string }) {
  const btn = 'grid size-11 place-items-center border border-slate bg-ink text-paper hover:border-paper disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <div className="flex items-center" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Remove one ${label}`}>
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <output className="grid h-11 w-12 place-items-center border-y border-slate font-mono text-lg font-bold" aria-live="polite" aria-label={`${label} quantity`}>
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Add one ${label}`}>
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

import { Check } from 'lucide-react'

/** Visible progress indicator for multi-step flows. Current step uses aria-current="step". */
export function Stepper({ steps, current, onStepClick }: { steps: string[]; current: number; onStepClick?: (index: number) => void }) {
  return (
    <nav aria-label="Booking progress">
      <p className="mb-2 text-sm text-muted sm:hidden">
        Step {current + 1} of {steps.length}: <span className="font-semibold text-paper">{steps[current]}</span>
      </p>
      <ol className="flex gap-1.5 sm:gap-2">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          const clickable = done && onStepClick
          const content = (
            <>
              <span className="flex h-1.5 w-full sm:hidden" aria-hidden="true">
                <span className={`h-full w-full ${done || active ? 'bg-paper' : 'bg-slate'}`} />
              </span>
              <span className="hidden items-center gap-2 sm:flex">
                <span
                  className={`grid size-7 shrink-0 place-items-center border-2 font-mono text-xs font-bold ${
                    active ? 'border-paper bg-paper text-ink' : done ? 'border-paper text-paper' : 'border-slate text-muted'
                  }`}
                  aria-hidden="true"
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={`text-left text-xs leading-tight lg:text-sm ${active ? 'font-semibold text-paper' : done ? 'text-paper' : 'text-muted'}`}>{label}</span>
              </span>
              <span className="sr-only">
                {done ? ' (completed)' : active ? ' (current step)' : ' (not started)'}
              </span>
            </>
          )
          return (
            <li key={label} className="min-w-0 flex-1" aria-current={active ? 'step' : undefined}>
              {clickable ? (
                <button type="button" onClick={() => onStepClick(i)} className="w-full" aria-label={`Go back to step ${i + 1}: ${label}`}>
                  {content}
                </button>
              ) : (
                <div aria-label={`Step ${i + 1}: ${label}`}>{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

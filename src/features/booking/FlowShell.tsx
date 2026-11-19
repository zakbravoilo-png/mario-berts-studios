import { useEffect, useRef, type ReactNode } from 'react'
import { Grain } from '../../components/grunge'
import { Stepper } from '../../components/ui/Stepper'

/**
 * Booking flow frame — medium grunge: textured header with the progress bar,
 * clean step body. Moves focus to the step heading when the step changes.
 */
export function FlowShell({
  title,
  eyebrow,
  steps,
  step,
  onStepClick,
  stepTitle,
  children,
  aside,
}: {
  title: string
  eyebrow: string
  steps: string[]
  step: number
  onStepClick?: (i: number) => void
  stepTitle: string
  children: ReactNode
  aside?: ReactNode
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)
  useEffect(() => {
    document.title = `${title} — Mario Bert's Studios (prototype)`
  }, [title])
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  return (
    <div>
      <div className="relative overflow-hidden border border-slate bg-charcoal">
        <Grain fine={0.2} coarse={0.32} />
        <div className="relative px-4 py-5 sm:px-6">
          <p className="eyebrow text-muted">{eyebrow}</p>
          <h1 className="display mt-1 text-display-3 text-paper">{title}</h1>
          <div className="mt-5">
            <Stepper steps={steps} current={step} onStepClick={onStepClick} />
          </div>
        </div>
      </div>
      <div className={`mt-6 grid gap-8 ${aside ? 'lg:grid-cols-[1fr_20rem]' : ''}`}>
        <section aria-labelledby="step-title" className="min-w-0">
          <h2 id="step-title" ref={headingRef} tabIndex={-1} className="font-display text-2xl tracking-wide text-paper outline-none">
            <span className="sr-only">Step {step + 1} of {steps.length}: </span>
            {stepTitle}
          </h2>
          <div className="mt-4">{children}</div>
        </section>
        {aside && <aside aria-label="Booking summary" className="lg:sticky lg:top-6 lg:self-start">{aside}</aside>}
      </div>
    </div>
  )
}

/** Back / Next row. */
export function FlowNav({ onBack, next, backLabel = 'Back' }: { onBack?: () => void; next?: ReactNode; backLabel?: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate pt-6">
      {onBack ? (
        <button type="button" onClick={onBack} className="btn btn-ghost">
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      {next}
    </div>
  )
}

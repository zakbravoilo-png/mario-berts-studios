import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'

/** Plain, texture-free form controls (handoff §8: never texture behind forms). */
const control =
  'w-full min-h-12 border border-slate bg-ink px-3 py-2.5 text-base text-paper placeholder:text-muted focus-visible:border-rust-light aria-[invalid=true]:border-rust-light disabled:opacity-60'

interface BaseProps {
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  optional?: boolean
  className?: string
}

function Wrapper({ id, label, hint, error, optional, className = '', children }: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-paper">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-rust-light" role="alert">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, hint?: ReactNode, error?: string | null) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined
}

export function TextField({ label, hint, error, optional, className, ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input id={id} className={control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
    </Wrapper>
  )
}

export function TextArea({ label, hint, error, optional, className, ...rest }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea id={id} rows={4} className={control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
    </Wrapper>
  )
}

export function SelectField({ label, hint, error, optional, className, children, ...rest }: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <select id={id} className={control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...rest}>
        {children}
      </select>
    </Wrapper>
  )
}

export function Checkbox({ label, error, className = '', ...rest }: { label: ReactNode; error?: string | null; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-paper">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-[var(--color-rust)]"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 pl-8 text-sm text-rust-light" role="alert">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

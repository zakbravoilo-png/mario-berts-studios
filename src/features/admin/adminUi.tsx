import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'

/** Dense, texture-free admin table primitives. */
export function Table({ caption, children, minWidth = '48rem' }: { caption: string; children: ReactNode; minWidth?: string }) {
  return (
    <div className="overflow-x-auto border border-slate">
      <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className = '', ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={`border-b border-slate bg-surface px-3 py-2 text-xs font-semibold whitespace-nowrap text-muted ${className}`} {...rest}>
      {children}
    </th>
  )
}

export function Td({ children, className = '', ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`border-b border-slate px-3 py-2 align-top ${className}`} {...rest}>
      {children}
    </td>
  )
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col border border-slate bg-surface p-3 sm:p-4">
      <p className="text-xs leading-snug text-muted">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold sm:text-2xl">{value}</p>
      {hint && <p className="mt-auto pt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

/** Small admin button (plain box — admin is the lowest-grunge area). */
export function AdminButton({ children, tone = 'default', className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'primary' }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-9 items-center gap-1.5 border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
        tone === 'primary' ? 'border-rust bg-rust text-paper hover:brightness-110' : 'border-slate bg-ink text-paper hover:border-paper'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export const adminInput = 'min-h-9 border border-slate bg-ink px-2 py-1 text-sm text-paper focus-visible:border-rust-light'

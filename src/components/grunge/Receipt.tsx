import type { ReactNode } from 'react'
import { formatPHP } from '../../utils/money'
import { Barcode } from './Barcode'

export interface ReceiptLine {
  label: ReactNode
  detail?: ReactNode
  amount: number | null
}

interface ReceiptProps {
  title?: string
  lines: ReceiptLine[]
  total: number
  /** Optional emphasised rows after the total (downpayment / balance). */
  after?: { label: ReactNode; amount: number; emphasis?: boolean }[]
  footer?: ReactNode
  barcodeValue?: string
  className?: string
}

/**
 * Price summary styled as a printed receipt. Plain paper — no texture behind prices.
 * Amounts in Space Mono, right-aligned, ink on paper (14.8:1).
 */
export function Receipt({ title = 'Receipt', lines, total, after = [], footer, barcodeValue, className = '' }: ReceiptProps) {
  return (
    <div className={`receipt ${className}`}>
      <p className="text-center text-xs font-bold tracking-[0.25em]">Mario Bert&apos;s Studios</p>
      <p className="mt-1 text-center text-xs tracking-[0.2em]">{title}</p>
      <div className="receipt-rule my-3" />
      <table className="w-full text-sm">
        <caption className="sr-only">{title}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className="align-top">
              <th scope="row" className="py-1 pr-2 text-left font-normal">
                <span className="block">{l.label}</span>
                {l.detail && <span className="block text-xs opacity-80">{l.detail}</span>}
              </th>
              <td className="py-1 text-right whitespace-nowrap">{l.amount === null ? 'TBD' : formatPHP(l.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="receipt-rule my-3" />
      <div className="flex items-baseline justify-between text-base font-bold">
        <span>Total</span>
        <span>{formatPHP(total)}</span>
      </div>
      {after.length > 0 && (
        <dl className="mt-2 space-y-1 text-sm">
          {after.map((a, i) => (
            <div key={i} className={`flex items-baseline justify-between ${a.emphasis ? 'bg-ink px-2 py-1 font-bold text-paper' : ''}`}>
              <dt>{a.label}</dt>
              <dd className="m-0">{formatPHP(a.amount)}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer && (
        <>
          <div className="receipt-rule my-3" />
          <div className="text-xs leading-relaxed">{footer}</div>
        </>
      )}
      {barcodeValue && <Barcode value={barcodeValue} className="mx-auto mt-4 w-40 text-ink" height={36} />}
    </div>
  )
}

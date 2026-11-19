import { useMemo } from 'react'

interface BarcodeProps {
  value: string
  height?: number
  className?: string
  /** Show the value under the bars in mono. */
  showValue?: boolean
}

/**
 * Decorative barcode derived from a string. NOT a scannable symbology —
 * it's ornament for ticket stubs and receipts. Hidden from assistive tech;
 * the reference is always printed as text elsewhere.
 */
export function Barcode({ value, height = 44, className = '', showValue = false }: BarcodeProps) {
  const bars = useMemo(() => {
    const widths: number[] = [2, 1, 2]
    for (const ch of value) {
      const c = ch.charCodeAt(0)
      widths.push((c % 3) + 1, ((c >> 2) % 2) + 1, ((c >> 3) % 3) + 1, (c % 2) + 1)
    }
    widths.push(2, 1, 2)
    return widths
  }, [value])
  const total = bars.reduce((a, b) => a + b, 0)
  let x = 0
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox={`0 0 ${total} 10`} preserveAspectRatio="none" style={{ height, width: '100%', display: 'block' }}>
        {bars.map((w, i) => {
          const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={10} fill="currentColor" /> : null
          x += w
          return rect
        })}
      </svg>
      {showValue && <div className="mt-1 text-center font-mono text-[0.65rem] tracking-[0.3em]">{value}</div>}
    </div>
  )
}

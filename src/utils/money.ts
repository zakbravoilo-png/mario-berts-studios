const php = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Format whole pesos as "₱1,250". */
export function formatPHP(amount: number): string {
  return php.format(amount)
}

/** "₱500", or "price to be confirmed" when the studio hasn't set one. */
export function formatPHPOrTbd(amount: number | null): string {
  return amount === null ? 'price to be confirmed' : formatPHP(amount)
}

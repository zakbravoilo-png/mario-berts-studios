/** "30 minutes", "1 hour", "1 hour 30 minutes", "2 hours". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const parts: string[] = []
  if (h) parts.push(`${h} hour${h === 1 ? '' : 's'}`)
  if (m || !h) parts.push(`${m} minute${m === 1 ? '' : 's'}`)
  return parts.join(' ')
}

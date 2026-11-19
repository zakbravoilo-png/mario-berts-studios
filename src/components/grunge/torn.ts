/** Small deterministic PRNG so torn shapes render identically on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * CSS clip-path polygon with ragged, torn edges on all four sides.
 * `depth` is the max tear depth in % of the box.
 */
export function tornClipPath(seed: number, depth = 2.4, perSide = 22): string {
  const rand = mulberry32(seed)
  const jitter = () => (rand() * depth + (rand() > 0.85 ? rand() * depth : 0)).toFixed(2)
  const pts: string[] = []
  for (let i = 0; i <= perSide; i++) pts.push(`${((i / perSide) * 100).toFixed(2)}% ${jitter()}%`)
  for (let i = 1; i <= perSide; i++) pts.push(`${(100 - Number(jitter())).toFixed(2)}% ${((i / perSide) * 100).toFixed(2)}%`)
  for (let i = perSide - 1; i >= 0; i--) pts.push(`${((i / perSide) * 100).toFixed(2)}% ${(100 - Number(jitter())).toFixed(2)}%`)
  for (let i = perSide - 1; i >= 1; i--) pts.push(`${jitter()}% ${((i / perSide) * 100).toFixed(2)}%`)
  return `polygon(${pts.join(', ')})`
}

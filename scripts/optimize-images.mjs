// Resize source photos to web sizes and encode as WebP.
// Usage: node scripts/optimize-images.mjs  (reads photo-sources/, writes public/images/)
import { readdir, mkdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const SRC = 'photo-sources'
const OUT = 'public/images'
// Widths generated per photo. The hero background gets a wider version.
const WIDTHS = { 'room-bw-wide': [960, 1920] }
const DEFAULT_WIDTHS = [640, 1200]

await mkdir(OUT, { recursive: true })
for (const file of await readdir(SRC)) {
  if (!/\.(jpe?g|png|webp)$/i.test(file)) continue
  const { name } = parse(file)
  for (const w of WIDTHS[name] ?? DEFAULT_WIDTHS) {
    const out = join(OUT, `${name}-${w}.webp`)
    const info = await sharp(join(SRC, file))
      .rotate() // respect EXIF orientation
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 74 })
      .toFile(out)
    console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`)
  }
}

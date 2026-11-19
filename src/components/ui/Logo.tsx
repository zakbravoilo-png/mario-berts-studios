import { Link } from 'react-router'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md'
  suffix?: string
}

/**
 * Official Manoy Bart's Studio logo (supplied 2026-11-19, originals in photo-sources/logo/SVG/):
 * the icon (Bart-logo-icon.svg) plus the "Manoy Bart's / Studio" lettering from the dark lockup
 * (Dark 1.svg). The lettering is Haettenschweiler converted to outlines, so it looks the same on
 * every device without loading the font. Both files are white artwork for dark backgrounds.
 */
export function Logo({ to = '/', size = 'md', suffix }: LogoProps) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2 no-underline" aria-label={`Manoy Bart's Studio${suffix ? ` ${suffix}` : ''} — home`}>
      <img
        src="/brand/mbs-mark.svg"
        alt=""
        width={267}
        height={271}
        className={`${size === 'md' ? 'relative z-10 -my-4 h-[4.75rem] translate-y-3' : 'h-9'} w-auto shrink-0 transition-transform group-hover:-rotate-6`}
      />
      <img
        src="/brand/mbs-wordmark.svg"
        alt=""
        width={508}
        height={196}
        className={`${size === 'md' ? 'h-11' : 'h-9'} w-auto shrink-0`}
      />
      {suffix && <span className="tape-label ml-2 self-center text-[0.65rem]">{suffix}</span>}
    </Link>
  )
}

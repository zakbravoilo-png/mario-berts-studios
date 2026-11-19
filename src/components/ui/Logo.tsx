import { Link } from 'react-router'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md'
  suffix?: string
}

/**
 * Studio logo: the mascot mark (from the studio's logo file, photo-sources/logo/mbs-logo.svg)
 * plus the name set in the site's display type. The logo file's own lettering uses a desktop
 * font (Haettenschweiler) that browsers can't rely on, so the name is live text instead.
 */
export function Logo({ to = '/', size = 'md', suffix }: LogoProps) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2 no-underline" aria-label={`Mario Bert's Studios${suffix ? ` ${suffix}` : ''} — home`}>
      <img
        src="/brand/mbs-mark.svg"
        alt=""
        width={594}
        height={610}
        className={`${size === 'md' ? 'h-11' : 'h-9'} w-auto shrink-0 transition-transform group-hover:-rotate-6`}
      />
      <span className="inline-flex items-end gap-1.5 whitespace-nowrap">
        <span className={`display leading-none text-paper ${size === 'md' ? 'text-[1.9rem]' : 'text-2xl'}`}>
          Mario Bert&apos;s
        </span>
        <span className={`marker -rotate-6 leading-none text-rust-light ${size === 'md' ? 'text-lg' : 'text-base'}`}>studios</span>
      </span>
      {suffix && <span className="tape-label ml-2 self-center text-[0.65rem]">{suffix}</span>}
    </Link>
  )
}

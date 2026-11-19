import { Link } from 'react-router'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md'
  suffix?: string
}

/**
 * Studio logo: the mascot mark (from the studio's against-dark logo file, photo-sources/logo/mbs-logo-against-dark.svg;
 * the light-background version is public/brand/mbs-mark-light.svg)
 * plus the name set in the site's display type. The logo file's own lettering uses a desktop
 * font (Haettenschweiler) that browsers can't rely on, so the name is live text instead.
 */
export function Logo({ to = '/', size = 'md', suffix }: LogoProps) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2 no-underline" aria-label={`Manoy Bart's Studio${suffix ? ` ${suffix}` : ''} — home`}>
      <img
        src="/brand/mbs-mark.svg"
        alt=""
        width={636}
        height={656}
        className={`${size === 'md' ? 'relative z-10 -my-4 h-[4.75rem] translate-y-3' : 'h-9'} w-auto shrink-0 transition-transform group-hover:-rotate-6`}
      />
      <span className="inline-flex items-end gap-1.5 whitespace-nowrap">
        <span className={`display leading-none text-paper ${size === 'md' ? 'text-[1.9rem]' : 'text-2xl'}`}>
          Manoy Bart&apos;s
        </span>
        <span className={`marker -rotate-6 leading-none text-rust-light ${size === 'md' ? 'text-lg' : 'text-base'}`}>studio</span>
      </span>
      {suffix && <span className="tape-label ml-2 self-center text-[0.65rem]">{suffix}</span>}
    </Link>
  )
}

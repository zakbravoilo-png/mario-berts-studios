import { Link } from 'react-router'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md'
  suffix?: string
}

/** Wordmark: condensed name + marker "studios". Text only — no invented logo artwork. */
export function Logo({ to = '/', size = 'md', suffix }: LogoProps) {
  return (
    <Link to={to} className="group inline-flex items-end gap-1.5 no-underline" aria-label={`Mario Bert's Studios${suffix ? ` ${suffix}` : ''} — home`}>
      <span className={`display leading-none text-paper ${size === 'md' ? 'text-[1.9rem]' : 'text-2xl'}`}>
        Mario Bert&apos;s
      </span>
      <span className={`marker -rotate-6 leading-none text-rust-light ${size === 'md' ? 'text-lg' : 'text-base'}`}>studios</span>
      {suffix && <span className="tape-label ml-2 self-center text-[0.65rem]">{suffix}</span>}
    </Link>
  )
}

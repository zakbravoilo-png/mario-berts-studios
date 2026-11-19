import type { ReactNode } from 'react'
import { DuotoneImage, Grain, TornEdge } from '../grunge'
import type { PhotoKey } from '../../data/photos'

/**
 * Public page header — high grunge: photo background, grain, torn bottom edge.
 * `next` is the colour class of the block that follows (for the rip).
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  photo = 'roomBwWide',
  next = 'text-ink',
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  photo?: PhotoKey
  next?: string
}) {
  return (
    <header className="relative isolate overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10">
        <DuotoneImage photo={photo} alt="" halftone="coarse" sizes="100vw" priority className="h-full w-full opacity-50" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-ink)_0%,rgb(20_21_25/0.88)_50%,rgb(20_21_25/0.6)_100%)]" />
        <Grain fine={0.25} coarse={0.45} />
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 lg:pt-20 lg:pb-24">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h1 className="display mt-3 max-w-4xl text-display-1 text-paper">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-lg text-paper">{children}</div>}
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <TornEdge className={next} underClassName="text-slate" seed={typeof title === "string" ? title.length : 9} height={40} />
      </div>
    </header>
  )
}

/** Section heading used inside pages. */
export function SectionTitle({ eyebrow, children, id, className = '' }: { eyebrow?: string; children: ReactNode; id?: string; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow text-muted">{eyebrow}</p>}
      <h2 id={id} className="display mt-1 text-display-3 text-paper">
        {children}
      </h2>
    </div>
  )
}

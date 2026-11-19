import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Accessible confirmation prompt built on the native <dialog> element:
 * focus is trapped while open, Escape closes it, and focus returns to the
 * button that opened it. Plain surface — no texture behind the text.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Go back',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      opener.current = document.activeElement
      el.showModal()
    } else if (!open && el.open) {
      el.close()
      if (opener.current instanceof HTMLElement) opener.current.focus()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] border-2 border-paper bg-charcoal p-0 text-paper backdrop:bg-ink/80"
    >
      <div className="p-5 sm:p-6">
        <h2 id="confirm-title" className="font-display text-2xl tracking-wide">{title}</h2>
        <div className="mt-4 text-sm">{children}</div>
        <div className="mt-6 flex flex-wrap-reverse justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="btn btn-primary" onClick={onConfirm} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  )
}

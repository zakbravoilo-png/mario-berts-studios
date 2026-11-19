import { z } from 'zod'

/**
 * Contact details for bookings (user, 2026-11-16): name or nickname and a contact
 * number are required; email is optional. Works for guests — no account needed.
 */
export const customerSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name or nickname.').max(80, 'Keep it under 80 characters.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Please enter a contact number.')
    .regex(/^[+()\d\s-]+$/, 'Use digits, spaces, +, ( ) or - only.')
    .refine((v) => {
      const digits = v.replace(/\D/g, '')
      return digits.length >= 7 && digits.length <= 15
    }, 'That number looks too short or too long.'),
  email: z.string().trim().email('Enter a valid email address, or leave it blank.').or(z.literal('')),
  bandName: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(500, 'Keep notes under 500 characters.').optional(),
})

export type CustomerForm = z.infer<typeof customerSchema>
export type CustomerErrors = Partial<Record<keyof CustomerForm, string>>

export function validateCustomer(v: CustomerForm): CustomerErrors {
  const r = customerSchema.safeParse(v)
  if (r.success) return {}
  const out: CustomerErrors = {}
  for (const i of r.error.issues) out[i.path[0] as keyof CustomerForm] ??= i.message
  return out
}

/** Digits only — used to match a guest's contact number when looking up a booking. */
export function normalizePhone(v: string): string {
  const d = v.replace(/\D/g, '')
  // Treat +63 9XX… and 09XX… as the same Philippine mobile number.
  return d.startsWith('63') && d.length === 12 ? `0${d.slice(2)}` : d
}

export const emptyCustomer = (): CustomerForm => ({ name: '', phone: '', email: '', bandName: '', notes: '' })

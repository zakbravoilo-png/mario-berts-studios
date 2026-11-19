/** Customer accounts + "which records belong to this customer" (demo). */
import { useDemoState } from './demoStore'
import { useSession } from './session'
import { normalizePhone } from '../features/booking/customerSchema'
import type { Customer, CustomerDetails } from '../types/domain'

/** The signed-in customer, or null. */
export function useCurrentCustomer(): Customer | null {
  const s = useDemoState()
  const session = useSession()
  if (session?.role !== 'customer') return null
  return s.customers.find((c) => c.id === session.customerId) ?? null
}

/**
 * A record belongs to a customer if it was made in their account, or made as a
 * guest with the same contact number (so guest bookings appear after signing up).
 */
export function ownsRecord(me: Customer, rec: { customerId: string; customer: CustomerDetails }): boolean {
  if (rec.customerId === me.id) return true
  return rec.customerId === 'guest' && !!me.phone && normalizePhone(rec.customer.phone) === normalizePhone(me.phone)
}

export function findCustomerByPhone(customers: Customer[], phone: string): Customer | undefined {
  const p = normalizePhone(phone)
  return customers.find((c) => normalizePhone(c.phone) === p)
}

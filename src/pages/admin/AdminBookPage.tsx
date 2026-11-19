import { RehearsalBookingFlow } from '../../features/booking/RehearsalBookingFlow'

/** Admin books a rehearsal room on behalf of a customer (walk-in, phone or Messenger). */
export function AdminBookPage() {
  return <RehearsalBookingFlow mode="admin" />
}

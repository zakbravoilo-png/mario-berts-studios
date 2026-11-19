import { Link } from 'react-router'
import { RehearsalBookingFlow } from '../../features/booking/RehearsalBookingFlow'
import { LessonBookingFlow } from '../../features/lessons/LessonBookingFlow'
import { StreamingInquiryPage } from '../../features/streaming/StreamingInquiryPage'
import { OrdersPage } from '../portal/OrdersPage'

function GuestNote() {
  return (
    <p className="mb-5 text-sm text-muted">
      No account needed — just your name or nickname and a contact number.{' '}
      <Link to="/my-booking" className="link">Find my booking</Link>
    </p>
  )
}

/** Public, no-sign-in booking (user request): same flow, saved as a guest booking. */
export function GuestRehearsalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <GuestNote />
      <RehearsalBookingFlow mode="guest" />
    </div>
  )
}

export function GuestLessonPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <GuestNote />
      <LessonBookingFlow mode="guest" />
    </div>
  )
}

export function GuestStreamingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <StreamingInquiryPage guest />
    </div>
  )
}

export function GuestShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <OrdersPage guest />
    </div>
  )
}

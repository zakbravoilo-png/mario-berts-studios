/**
 * Booking confirmations by SMS and email — SIMULATED.
 * The prototype has no server, so messages are written to a demo outbox in the
 * store instead of being sent. A real build would send these from a server
 * (e.g. a Cloudflare Worker) through an SMS provider and an email provider; the
 * studio has to choose and pay for those. See README "Notifications".
 */
import type { LessonRequest, Notification, NotificationEvent, RehearsalBooking } from '../types/domain'
import { roomName } from '../data/rooms'
import { getRental } from '../data/rentalEquipment'
import { lessonLabel, levelLabel, studioContact } from '../data/services'
import { formatPHP } from '../utils/money'
import { formatDate, formatRange } from '../utils/time'

const STUDIO = "Mario Bert's Studios"

function when(startAt: string, endAt: string) {
  return `${formatDate(startAt)}, ${formatRange(startAt, endAt)}`
}

function footer() {
  const bits = [studioContact.phone && `Call/text ${studioContact.phone}`, studioContact.email, 'Facebook Messenger'].filter(Boolean)
  return bits.join(' · ')
}

function rehearsalText(event: NotificationEvent, b: RehearsalBooking): { sms: string; subject: string; email: string } {
  const head = `${b.reference} · ${roomName(b.roomId)} · ${when(b.startAt, b.endAt)}`
  const money = `Total ${formatPHP(b.total)}; 50% downpayment ${formatPHP(b.downpaymentRequired)} via GCash (non-refundable); balance ${formatPHP(b.balance)}.`
  const policy = 'You may cancel only before the day of the booking.'
  const gear = b.selectedEquipment.length ? `Extra gear: ${b.selectedEquipment.map((e) => `${e.quantity}× ${getRental(e.itemId).shortName}`).join(', ')}.` : 'No extra gear.'
  switch (event) {
    case 'booking_received':
      return {
        sms: `${STUDIO}: Booking ${head} saved, NOT yet held. Send the ${formatPHP(b.downpaymentRequired)} GCash downpayment reference to secure it.`,
        subject: `Booking ${b.reference} saved — downpayment needed`,
        email: `Hi ${b.customer.name},\n\nYour booking request ${head} is saved but NOT confirmed, and the room is not held yet.\n\n${money}\n${gear}\n\nSend your GCash downpayment reference from your booking page to hold the room.\n${policy}`,
      }
    case 'payment_submitted':
      return {
        sms: `${STUDIO}: We got your GCash reference for ${head}. Awaiting verification — not confirmed yet. ${formatPHP(b.downpaymentRequired)} downpayment is non-refundable.`,
        subject: `Booking ${b.reference} received — awaiting payment verification`,
        email: `Hi ${b.customer.name},\n\nThanks! We received your booking ${head} and your GCash reference ${b.payment.reference ?? ''}.\nStatus: awaiting payment verification. We'll confirm once the downpayment is verified.\n\n${money}\n${gear}\n${policy}`,
      }
    case 'booking_confirmed':
      return {
        sms: `${STUDIO}: CONFIRMED ${head}. Downpayment verified. Balance ${formatPHP(b.balance)}. ${policy}`,
        subject: `Booking ${b.reference} confirmed`,
        email: `Hi ${b.customer.name},\n\nYour booking is CONFIRMED: ${head}.\nDownpayment ${formatPHP(b.downpaymentRequired)} verified. Remaining balance ${formatPHP(b.balance)} (how and when it's collected: to be confirmed by the studio).\n\n${gear}\n${policy}`,
      }
    case 'booking_cancelled':
      return {
        sms: `${STUDIO}: Booking ${b.reference} (${when(b.startAt, b.endAt)}) is cancelled. The downpayment is non-refundable.`,
        subject: `Booking ${b.reference} cancelled`,
        email: `Hi ${b.customer.name},\n\nYour booking ${head} has been cancelled. As stated when you booked, the downpayment is non-refundable.`,
      }
    case 'booking_rejected':
      return {
        sms: `${STUDIO}: Sorry — booking ${b.reference} could not be accepted.${b.adminNote ? ` Note: ${b.adminNote}` : ''} Please contact us.`,
        subject: `Booking ${b.reference} not accepted`,
        email: `Hi ${b.customer.name},\n\nSorry — your booking ${head} could not be accepted.${b.adminNote ? `\nNote from the studio: ${b.adminNote}` : ''}\nPlease contact us to sort out the next step.`,
      }
    default:
      return { sms: '', subject: '', email: '' }
  }
}

function lessonText(event: NotificationEvent, l: LessonRequest, instructorName: string): { sms: string; subject: string; email: string } {
  const head = `${l.reference} · ${lessonLabel(l.lessonType)} (${levelLabel(l.level)}) · ${when(l.startAt, l.endAt)} · ${roomName(l.roomId)}`
  const price = l.sessionPrice === null ? 'price to be confirmed' : formatPHP(l.sessionPrice)
  switch (event) {
    case 'lesson_requested':
      return {
        sms: `${STUDIO}: Lesson request ${head} received. Awaiting studio confirmation.`,
        subject: `Lesson request ${l.reference} received`,
        email: `Hi ${l.customer.name},\n\nWe received your lesson request: ${head}, with ${instructorName}. Price: ${price} per session.\nWe'll confirm soon. Payment terms for lessons are to be confirmed by the studio.`,
      }
    case 'lesson_confirmed':
      return {
        sms: `${STUDIO}: Lesson CONFIRMED ${head} with ${instructorName}.`,
        subject: `Lesson ${l.reference} confirmed`,
        email: `Hi ${l.customer.name},\n\nYour lesson is CONFIRMED: ${head}, with ${instructorName}. Price: ${price} per session.`,
      }
    case 'lesson_declined':
      return {
        sms: `${STUDIO}: Sorry — lesson request ${l.reference} could not be confirmed. Please contact us for another time.`,
        subject: `Lesson ${l.reference} not confirmed`,
        email: `Hi ${l.customer.name},\n\nSorry — your lesson request ${head} could not be confirmed. Please contact us to find another time.`,
      }
    case 'lesson_cancelled':
      return {
        sms: `${STUDIO}: Lesson ${l.reference} (${when(l.startAt, l.endAt)}) is cancelled.`,
        subject: `Lesson ${l.reference} cancelled`,
        email: `Hi ${l.customer.name},\n\nYour lesson ${head} has been cancelled.`,
      }
    default:
      return { sms: '', subject: '', email: '' }
  }
}

function build(reference: string, phone: string, email: string, event: NotificationEvent, t: { sms: string; subject: string; email: string }, at: string): Notification[] {
  const out: Notification[] = []
  const stamp = Date.now().toString(36)
  if (phone.trim()) out.push({ id: `nt-${stamp}-s-${Math.random().toString(36).slice(2, 6)}`, channel: 'sms', to: phone.trim(), reference, event, subject: null, body: t.sms, createdAt: at, status: 'simulated' })
  if (email.trim()) out.push({ id: `nt-${stamp}-e-${Math.random().toString(36).slice(2, 6)}`, channel: 'email', to: email.trim(), reference, event, subject: `${STUDIO}: ${t.subject}`, body: `${t.email}\n\n— ${STUDIO}\n${footer()}`, createdAt: at, status: 'simulated' })
  return out
}

export function rehearsalNotifications(event: NotificationEvent, b: RehearsalBooking, at: string): Notification[] {
  return build(b.reference, b.customer.phone, b.customer.email, event, rehearsalText(event, b), at)
}

export function lessonNotifications(event: NotificationEvent, l: LessonRequest, instructorName: string, at: string): Notification[] {
  return build(l.reference, l.customer.phone, l.customer.email, event, lessonText(event, l, instructorName), at)
}

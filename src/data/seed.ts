/**
 * DEMO SEED DATA, generated relative to "today" (Asia/Manila) so the conflict
 * scenarios are always visible:
 *  - Tomorrow 11:00–13:00 all 5 extra mic kits are taken across Rooms 1 and 2.
 *  - Tomorrow 11:00–13:00 the only acoustic guitar and the only extra bass amp are booked.
 *  - Tomorrow 14:00–14:30 a beginner lesson blocks Room 3.
 * All names are fictional; nothing here is a real customer.
 */
import type {
  BusinessSettings,
  Customer,
  CustomerDetails,
  InquiryStatus,
  LessonRequest,
  RehearsalBooking,
  RehearsalStatus,
  RentalEquipmentId,
  ShopInquiry,
  StreamingInquiry,
} from '../types/domain'
import { priceRehearsal } from '../features/booking/pricing'
import { getRental, rentalEquipment } from './rentalEquipment'
import { defaultSettings } from './settings'
import { seedInstructors } from './instructors'
import { seedProducts } from './products'
import { addDays, manilaIso, todayManila, toManilaIso } from '../utils/time'
import type { DemoState } from '../services/demoState'

export const DEMO_CUSTOMER: Customer = {
  id: 'cust-demo',
  name: 'Demo Customer',
  email: 'demo.customer@example.com',
  phone: '0900 000 0000',
  bandName: 'The Demo Band',
  isDemo: true,
}

const other = (name: string, band: string): CustomerDetails => ({
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
  phone: `0900 000 00${String(name.length).padStart(2, '0')}`,
  bandName: band,
})

function rehearsal(
  n: number,
  opts: {
    customerId: string
    customer: CustomerDetails
    roomId: string
    date: string
    start: string
    hours: number
    equipment?: [RentalEquipmentId, number][]
    status: RehearsalStatus
    createdAt: string
    yymm: string
  },
): RehearsalBooking {
  const equipment = (opts.equipment ?? []).map(([itemId, quantity]) => ({ itemId, quantity, unitPrice: getRental(itemId).unitPrice }))
  const price = priceRehearsal(opts.hours, equipment)
  const startAt = manilaIso(opts.date, opts.start)
  const startH = Number(opts.start.slice(0, 2))
  const endAt = manilaIso(opts.date, `${String(startH + opts.hours).padStart(2, '0')}:${opts.start.slice(3)}`)
  const id = `bk-seed-${n}`
  const paid = opts.status !== 'awaiting_payment'
  const verified = opts.status === 'confirmed' || opts.status === 'completed'
  return {
    id,
    reference: `MBS-${opts.yymm}-${String(n).padStart(4, '0')}`,
    customerId: opts.customerId,
    customer: opts.customer,
    roomId: opts.roomId,
    startAt,
    endAt,
    durationHours: opts.hours,
    selectedEquipment: equipment,
    roomSubtotal: price.roomSubtotal,
    equipmentSubtotal: price.equipmentSubtotal,
    total: price.total,
    downpaymentRequired: price.downpayment,
    balance: price.balance,
    payment: {
      id: `pay-${id}`,
      bookingId: id,
      method: 'gcash',
      amount: price.downpayment,
      reference: paid ? `DEMO-${100000 + n * 7919}` : null,
      proofFileName: paid ? `demo-receipt-${n}.jpg` : null,
      status: verified ? 'verified' : paid ? 'submitted' : 'not_submitted',
      submittedAt: paid ? opts.createdAt : null,
      verifiedAt: verified ? opts.createdAt : null,
    },
    status: opts.status,
    createdAt: opts.createdAt,
    ...(opts.status === 'cancelled' ? { cancelledAt: opts.createdAt } : {}),
  }
}

export function createSeed(now: number = Date.now(), settings: BusinessSettings = defaultSettings): DemoState {
  const today = todayManila(now)
  const d = (n: number) => addDays(today, n)
  const created = toManilaIso(now - 2 * 86_400_000)
  const yymm = today.slice(2, 4) + today.slice(5, 7)
  const me = DEMO_CUSTOMER

  const bookings: RehearsalBooking[] = [
    rehearsal(1, { customerId: 'cust-a', customer: other('Sample Person A', 'Sample Band A'), roomId: 'room-1', date: d(1), start: '10:00', hours: 3, equipment: [['mic-kit', 3], ['guitar-cable', 2]], status: 'confirmed', createdAt: created, yymm }),
    rehearsal(2, { customerId: 'cust-b', customer: other('Sample Person B', 'Sample Band B'), roomId: 'room-2', date: d(1), start: '11:00', hours: 2, equipment: [['mic-kit', 2], ['acoustic-guitar', 1], ['extra-bass-amp', 1]], status: 'awaiting_verification', createdAt: created, yymm }),
    rehearsal(3, { customerId: me.id, customer: me, roomId: 'room-3', date: d(1), start: '16:00', hours: 2, equipment: [['electric-guitar', 1]], status: 'awaiting_verification', createdAt: created, yymm }),
    rehearsal(4, { customerId: me.id, customer: me, roomId: 'room-3', date: d(2), start: '18:00', hours: 2, equipment: [['keyboard-kit', 1]], status: 'confirmed', createdAt: created, yymm }),
    rehearsal(5, { customerId: me.id, customer: me, roomId: 'room-1', date: d(4), start: '13:00', hours: 3, status: 'awaiting_payment', createdAt: created, yymm }),
    rehearsal(6, { customerId: me.id, customer: me, roomId: 'room-2', date: d(-5), start: '14:00', hours: 2, equipment: [['guitar-cable', 1]], status: 'completed', createdAt: toManilaIso(now - 9 * 86_400_000), yymm }),
    rehearsal(7, { customerId: me.id, customer: me, roomId: 'room-1', date: d(6), start: '19:00', hours: 2, status: 'cancelled', createdAt: created, yymm }),
    rehearsal(8, { customerId: 'cust-c', customer: other('Sample Person C', 'Sample Band C'), roomId: 'room-2', date: d(0), start: '17:00', hours: 3, equipment: [['extra-guitar-amp', 2]], status: 'confirmed', createdAt: created, yymm }),
    rehearsal(9, { customerId: 'cust-d', customer: other('Sample Person D', 'Sample Band D'), roomId: 'room-1', date: d(2), start: '09:00', hours: 4, equipment: [['bass-guitar', 1]], status: 'awaiting_verification', createdAt: created, yymm }),
  ]

  const lesson = (n: number, l: Omit<LessonRequest, 'id' | 'reference' | 'createdAt' | 'startAt' | 'endAt' | 'durationMinutes' | 'sessionPrice'> & { start: string; date: string }): LessonRequest => {
    const durationMinutes = settings.lessonDurationMinutes[l.level]
    const startAt = manilaIso(l.date, l.start)
    const { start: _s, date: _d, ...rest } = l
    void _s
    void _d
    return {
      ...rest,
      id: `ls-seed-${n}`,
      reference: `MBL-${yymm}-${String(n).padStart(4, '0')}`,
      startAt,
      endAt: toManilaIso(Date.parse(startAt) + durationMinutes * 60_000),
      durationMinutes,
      sessionPrice: settings.lessonPrices[l.level],
      createdAt: created,
    }
  }

  const lessons: LessonRequest[] = [
    lesson(1, { customerId: 'cust-e', customer: other('Sample Student E', ''), lessonType: 'drums', level: 'beginner', instructorId: 'inst-1', roomId: 'room-3', date: d(1), start: '14:00', status: 'requested' }),
    lesson(2, { customerId: me.id, customer: me, lessonType: 'piano', level: 'intermediate', instructorId: 'inst-4', roomId: 'room-2', date: d(3), start: '10:00', status: 'confirmed' }),
    lesson(3, { customerId: 'cust-f', customer: other('Sample Student F', ''), lessonType: 'keyboard', level: 'beginner', instructorId: 'inst-4', roomId: 'room-3', date: d(2), start: '11:00', status: 'requested' }),
  ]

  const streaming: StreamingInquiry[] = [
    {
      id: 'st-seed-1',
      reference: `MBG-${yymm}-0001`,
      customerId: 'cust-g',
      customer: other('Sample Organiser G', ''),
      eventDate: d(12),
      estimatedHours: 3,
      eventLocation: 'Sample venue (fictional)',
      description: 'Three-band showcase night. Sample inquiry.',
      estimatedPrice: 3 * settings.streamingRatePerHour,
      status: 'pending' as InquiryStatus,
      createdAt: created,
    },
  ]

  const shopInquiries: ShopInquiry[] = [
    {
      id: 'sh-seed-1',
      reference: `MBO-${yymm}-0001`,
      customerId: me.id,
      customer: me,
      items: [{ productId: 'str-electric', quantity: 2 }],
      message: 'What gauges do you have? (sample inquiry)',
      status: 'pending',
      createdAt: created,
    },
  ]

  return {
    version: 3,
    seededAt: toManilaIso(now),
    settings,
    rentalStock: Object.fromEntries(rentalEquipment.map((r) => [r.id, r.totalQuantity])) as DemoState['rentalStock'],
    customers: [me],
    bookings,
    lessons,
    instructors: seedInstructors,
    streaming,
    shopInquiries,
    products: seedProducts,
    notifications: [],
    counters: { MBS: 9, MBL: 3, MBG: 1, MBO: 1 },
  }
}

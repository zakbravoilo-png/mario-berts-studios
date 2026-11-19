import type {
  BusinessSettings,
  Customer,
  Instructor,
  LessonRequest,
  RehearsalBooking,
  RentalEquipmentId,
  ShopInquiry,
  Notification,
  ShopProduct,
  StreamingInquiry,
} from '../types/domain'

/** The whole mock database. Persisted to localStorage in the browser only. */
export interface DemoState {
  /** Bump when the seed shape/content changes; older saved state is replaced. */
  version: 3
  seededAt: string
  settings: BusinessSettings
  /** Shared rental stock (admin can adjust in demo mode). */
  rentalStock: Record<RentalEquipmentId, number | null>
  /** Customer accounts (demo sign-in by contact number + one-time code). */
  customers: Customer[]
  bookings: RehearsalBooking[]
  lessons: LessonRequest[]
  instructors: Instructor[]
  streaming: StreamingInquiry[]
  shopInquiries: ShopInquiry[]
  products: ShopProduct[]
  /** Demo outbox of SMS/email confirmations (simulated, never sent). */
  notifications: Notification[]
  /** Per-prefix sequence numbers for references (MBS, MBL, MBG, MBO). */
  counters: Record<string, number>
}

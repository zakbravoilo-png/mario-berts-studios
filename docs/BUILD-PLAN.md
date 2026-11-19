# Build Plan — First Draft

Status: **awaiting user approval**. Source of truth: `docs/MANOY-BERTS-CLAUDE-HANDOFF.md`.

## Stack

| Concern | Choice | Note |
|---|---|---|
| Build | Vite + React 19 + TypeScript (strict) | As the handoff specifies |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), tokens in `src/styles/tokens.css` via `@theme` | Palette from handoff §8 |
| Routing | React Router 7 (`createBrowserRouter`) | Three layouts: public, portal, admin |
| Icons | `lucide-react` | |
| Validation | `zod` schemas + plain controlled forms | Lightweight; no form library |
| Fonts | `@fontsource` Anton, Inter, Space Mono, Permanent Marker (Rubik Dirt hero-only) | Self-hosted |
| Tests | Vitest | Pricing, overlap, inventory, hours, cancellation |
| Time | `Intl.DateTimeFormat` with `Asia/Manila` (fixed UTC+8, no DST) | No date library needed |
| Deploy | `wrangler.jsonc` — Workers static assets, SPA fallback | Not deployed by Claude |

## Routes

Public (`PublicLayout`): `/`, `/about`, `/services`, `/services/rehearsal`,
`/services/lessons`, `/services/live-streaming`, `/rooms`, `/rates`, `/shop`,
`/contact`.

Customer portal (`PortalLayout`, dark sidebar, "Demo mode" banner): `/portal`,
`/portal/book/rehearsal`, `/portal/book/lesson`, `/portal/live-streaming`,
`/portal/reservations`, `/portal/reservations/:ref`, `/portal/orders`,
`/portal/profile`.

Admin (`AdminLayout`, separate visual shell, "DEMO ADMIN" tape banner): `/admin`,
`/admin/bookings`, `/admin/bookings/:ref`, `/admin/rooms`, `/admin/inventory`,
`/admin/lessons`, `/admin/instructors`, `/admin/streaming`, `/admin/products`, `/admin/settings`.

Plus a styled 404 page.

## Structure

```text
src/
  app/            router.tsx, layouts (Public, Portal, Admin), DemoStoreProvider
  components/
    ui/           Button, Card, Field, Select, Stepper, Table, StatusLabel, Banner, EmptyState, Dialog
    grunge/       TornEdge, Tape, NoiseOverlay, DuotoneImage, Highlight, TicketStub, Receipt, Barcode
  features/
    booking/      RehearsalBookingFlow + one component per step; pricing.ts; availability.ts; *.test.ts
    inventory/    shared-stock availability helpers + views
    lessons/      LessonRequestForm
    streaming/    StreamingInquiryForm
    shop/         Catalog, ProductCard, ShopInquiryForm
    admin/        BookingTable, PaymentReviewPanel, RoomSchedule, InventoryEditor, ...
  pages/          thin route components composing features
  data/           seed: rooms, rentalEquipment, settings, sampleBookings, products
  services/       typed interfaces + mock implementations (localStorage-backed)
  types/          domain models (handoff §7)
  utils/          money (₱ formatting), time (Asia/Manila), ids (booking refs)
  styles/         tokens.css, grunge.css
```

## Data model highlights

- All money in **whole pesos (integers)**; formatted as `₱1,250`.
- `RentalEquipment` seed (shared stock): guitar cable ₱40 ×5, electric guitar ₱100 ×5,
  bass guitar ₱100 ×3, acoustic guitar ₱100 ×1, mic + cable kit ₱40 ×5,
  synth/keyboard kit ₱100 ×2, extra guitar amp ₱80 ×2, extra bass amp ₱80 ×1.
- `BusinessSettings`: open 09:00, close 21:00, timezone Asia/Manila, slot 60 min (demo),
  min 1 h (demo), max = until close, `inventoryHoldStatuses`
  (default: awaiting_verification, confirmed), `lessonRoomHoldStatuses`
  (default: requested, confirmed),
  `gcashInstructions: null` → shows "GCash details to be provided by studio".
- `RehearsalBooking.status`: awaiting_payment → awaiting_verification → confirmed →
  completed; cancelled; rejected (handoff §6).
- Lessons: drums, guitar, bass, keyboard, piano, voice × beginner / intermediate. Beginner
  ₱500 per session (30 min); intermediate ₱750 per session (1 h) — user, 2026-11-16.
- `Instructor`: display name, instruments, levels, weekly availability, `isDemo`.
  About 6–7 demo instructors ("Demo Instructor 1"…), covering all six lesson types and
  both levels, with one lesson type taught by two of them.
- `LessonRequest` has `level`, `instructorId` and `roomId`. Lessons occupy a room like
  rehearsals do, with statuses requested → confirmed → completed, plus declined and cancelled.
- Booking references: `MBS-YYMM-NNNN` (rehearsal), `MBL-YYMM-NNNN` (lesson).

## Core logic (pure functions, unit-tested)

- `overlaps(a, b)`: `a.start < b.end && b.start < a.end` (adjacent = OK).
- `roomOccupancy(roomId, range, bookings, lessons, settings)`: one source of truth that
  merges held rehearsals **and** held lessons.
- `isRoomFree(...)` and `firstFreeRoom(range, ...)`, used for lesson auto-assignment.
- `availableInstructors(type, level, range, instructors, lessons, settings)`: teaches
  that instrument and level, the session fits their schedule, and no overlapping held lesson.
- `lessonSlotOpen(...)`: true only when an instructor **and** a room are free.
- `availableQty(itemId, range, bookings, settings)` = stock − overlapping held qty.
- `validateRehearsalRequest(...)`: hours window, room conflict, stock limits.
- `priceRehearsal(hours, items)`: room = hours × 250; equipment = Σ qty × price (once);
  total; downpayment = total / 2; balance = total − downpayment.
- `canCustomerCancel(booking, now)`: true only before the booking's calendar day (Manila).

Required tests: 970 / 485 / 485 example; same-room overlap rejected; adjacent allowed;
cross-room mic over-allocation rejected; second acoustic guitar / second bass amp rejected
when overlapping; rehearsal over a lesson rejected; lesson request rejected when all 3 rooms
are busy; instructor double-booking rejected; instructor outside their schedule or
not teaching that level is excluded; outside 9–9 rejected; cancel on booking day refused.

## Rehearsal booking flow (7 steps, visible stepper)

1. **Date & start time:** a grid of the 3 rooms × hourly slots for the chosen date,
   with available / booked / selected states shown by icon + text, not color alone.
2. **Room:** cards with placeholder photo and included equipment; a room is disabled if
   it's busy at the chosen start.
3. **Duration:** capped at 21:00 and at the room's next booking.
4. **Equipment:** "Included in every room" panel separate from paid add-ons;
   steppers limited by live mock stock; note "charged once per reservation".
5. **Details:** name, email or phone (one required), optional band name and notes.
6. **Review & pay:** receipt-style breakdown, 50% downpayment, balance, the
   non-refundable policy with a required acknowledgement checkbox, a demo GCash
   panel, a mock reference number and a mock proof upload (filename only).
7. **Confirmation:** a ticket stub with status **Awaiting payment verification**,
   which is distinct from Confirmed.

Draft state is kept in `sessionStorage` so a refresh doesn't lose progress.

## Demo behaviour

- A fictional "Demo Customer" persona, with no real login, labelled as such.
- Admin entry via an "Enter demo admin" button; the docs state this is not security.
- Seed bookings are generated relative to today, so conflicts are always visible
  (including one slot where all 5 mic kits are taken across two rooms, a booked acoustic
  guitar, and a lesson that blocks a room).
- Lesson duration is fixed by level: beginner 30 min, intermediate 1 h (no duration
  picker). Lesson start times use 30-minute increments; a half-hour lesson still blocks
  any overlapping rehearsal hour in that room.
- Lesson booking (6 steps): instrument → level → date and start time →
  available instructor → contact details → review and submit. The review shows the
  assigned room. The admin can confirm, decline, or reassign the room or instructor.
- Admin actions (verify payment, confirm, reject, adjust stock) are reflected in the
  portal through localStorage. Both portals have a "Reset demo data" button.
- Shop is inquiry-first; demo products are labelled DEMO, with price/stock shown as "TBD".

## Build order and checkpoints

1. Scaffold, tokens, fonts, layouts, grunge components, home page.
   **Checkpoint: user reviews the look.**
2. Remaining public pages (services, rooms, rates, about, contact, shop catalog).
3. Domain logic + tests, then the rehearsal booking flow.
4. Customer portal (dashboard, reservations, detail, cancel request).
5. Admin portal (bookings, payment review, schedule, inventory, settings).
6. Lessons, streaming, shop inquiries.
7. Responsive/accessibility pass, `npm run build`, tests, README, `wrangler.jsonc`, `.gitignore`, `.env.example`.

## Not done by Claude

- `git init` and commits: only after the user confirms the personal repo email.
- GitHub repo creation, push, Cloudflare deploy: done by the user.

## Assumptions needing owner confirmation (all configurable)

1-hour slots and 1-hour minimum; stock held while awaiting verification; room held
while a lesson request is pending.

Lesson prices confirmed by the user: beginner ₱500, intermediate ₱750 per session.

Confirmed by the user: lessons block rooms; extra amps = 2 guitar + 1 bass (₱80 each);
acoustic guitar bookable, 1 unit; lessons are drums, guitar, bass, keyboard, piano, voice at beginner
and intermediate level, one session per booking; bookers choose an available instructor;
use demo instructors for now; lesson duration is 30 min (beginner) / 1 h (intermediate).

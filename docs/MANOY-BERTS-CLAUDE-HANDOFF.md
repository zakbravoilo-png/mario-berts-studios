# Manoy Bart's Studio --- Claude Project Handoff

**Document purpose:** Give Claude / Claude Code the product context, UX
requirements, implementation plan, and deployment expectations needed to
create a first-draft website and web portal.

**Project type:** UX and vibe-coding prototype for a real local business.
Manoy Bart's Studio is the real studio's name, used with the owner's
permission (confirmed by the user on 2026-11-19). Content is still demo
data unless the studio has confirmed it.

**Primary outcome:** Build a polished, responsive public website plus a
functional-looking customer booking portal and admin portal. Start with
a safe prototype using mock data. Keep the architecture ready for a real
backend later.

------------------------------------------------------------------------

## 1. Instructions to Claude

Act as a senior product designer, UX engineer, and pragmatic full-stack
developer.

1.  Read this document fully before coding.
2.  First inspect the repository and existing files. Preserve useful
    existing work.
3.  Before implementation, provide a concise build plan, proposed
    routes, component structure, data model, and any assumptions.
    **Then stop and wait for the user's approval before writing code.**
4.  Build a coherent, usable first draft rather than a collection of
    disconnected screens.
5.  Prioritize the rehearsal booking journey and the correct
    pricing/inventory rules.
6.  Use fictional sample data only. Do not use real customer information
    or confidential work from other projects.
7.  Do not invent business policies, prices, product stock, lesson
    schedules, streaming packages, or payment integrations. Mark
    unknowns as "To be confirmed" or use clearly labelled demo data.
8.  Do not claim that GCash is integrated. For the prototype, simulate
    the payment submission and manual verification workflow.
9.  Do not expose secrets, API keys, tokens, or credentials in
    client-side code or commit them to Git.
10. Keep the project easy to run locally, easy to review in GitHub, and
    deployable to Cloudflare.
11. Add a useful README with setup, scripts, architecture, demo
    limitations, and deployment instructions.
12. At the end, report what was built, what works, what is mocked, what
    remains, and the exact commands to run/build/deploy.

**Important:** Do not attempt to create a GitHub repository, connect
accounts, deploy to Cloudflare, or make paid/irreversible changes
without the user's explicit authorization and the required credentials.
Prepare the project for these steps and explain them.

------------------------------------------------------------------------

## 2. Product overview

### Name

**Manoy Bart's Studio**: the business's real name, used with the owner's
permission (user, 2026-11-19). Earlier working names were "Manoy Bert's
Studios" and then "Mario Bert's Studios" (2026-11-16 to 2026-11-19). The
package is now `manoy-barts-studio`; the GitHub repo and Cloudflare Worker
are still `mario-berts-studios` until the user renames them; the local
folder is `D:/Projects/manoy-berts-studios`.

### Concept

A music rehearsal studio website and web portal for musicians and bands.
The platform supports:

-   Rehearsal room discovery and hourly reservations.
-   Optional shared equipment rentals.
-   One-on-one drums, guitar, bass, keyboard, piano, and voice lessons at beginner
    and intermediate level, with a choice of available instructor.
-   Live gig streaming inquiries/bookings.
-   A small retail catalog for guitar and bass strings.
-   An admin interface for rooms, bookings, shared equipment, services,
    and products.

### Product goals

-   Make it easy to understand what the studio offers and how much it
    costs.
-   Make room booking clear and low-friction.
-   Show which equipment is included and which items cost extra.
-   Prevent room and shared-equipment double-booking in the eventual
    real system.
-   Explain the 50% GCash downpayment and non-refundable cancellation
    policy before a customer commits.
-   Separate rehearsal bookings, lesson bookings, streaming inquiries,
    and retail purchases.
-   Give the studio operator a simple view of bookings and inventory.

### Primary users

1.  **Band / musician:** Wants to find a suitable room, check a
    date/time, add equipment if needed, and reserve.
2.  **Lesson student:** Wants to inquire about or book a one-on-one
    lesson.
3.  **Gig organizer / performer:** Wants to ask about live gig
    streaming.
4.  **Shop customer:** Wants to browse strings and product information.
5.  **Studio administrator:** Needs to manage bookings, room
    availability, shared rental stock, lessons, streaming inquiries, and
    products.

------------------------------------------------------------------------

## 3. Confirmed business information

### Operating hours

-   Studio operating hours: **9:00 AM to 9:00 PM**.
-   Do not allow a booking to start before 9:00 AM or finish after 9:00
    PM.
-   Bookings are whole hours with a 1-hour minimum, up to closing time.
    No gap is needed between bookings, and same-day booking is allowed
    when a room is vacant (both confirmed 2026-11-20).
-   **Timezone:** all dates and times use **Asia/Manila (UTC+8)**. This
    includes the 9 AM--9 PM limits and the "before the day of booking"
    cancellation rule. Store timestamps as ISO strings with offset and
    compare dates in Asia/Manila, never in the browser's local zone.
-   **Prototype assumption (configurable, labelled as demo):** 1-hour
    booking increments, 1-hour minimum. Whole hours keep the per-hour
    price and the 50% downpayment in whole pesos. Keep the increment in
    `BusinessSettings` so the owner's real answer can replace it.

### Rehearsal rooms

There are exactly **3 rehearsal rooms**, each independently bookable.

**Base rental price: PHP 250 per hour per room.**

Each room includes the following equipment as part of the base rental
price:

  Included item         Quantity per room
  ------------------- -------------------
  Audio mixer                           1
  Guitar amplifiers                     2
  Bass amplifier                        1
  Drum kit                              1
  Microphones                           2
  Vocal speakers                        3

Speaker placement: - One vocal speaker is located beside the drummer. -
Two vocal speakers face the rest of the band.

Customers may bring their own instruments. The standard equipment listed
above is included and must not be presented as paid add-ons.

### Optional equipment rentals

These are charged **once per reservation, regardless of the number of
hours booked**.

  Optional rental                         Price
  ------------------------------ --------------
  Guitar cable                      PHP 40 each
  Electric guitar                  PHP 100 each
  Bass guitar (4-string)           PHP 100 each
  Bass guitar (5-string)           PHP 100 each
  Acoustic guitar                  PHP 100 each
  Extra microphone + mic cable      PHP 40 each
  Synth / keyboard + cables             PHP 100
  Extra amplifier                   PHP 80 each
  (guitar amp or bass amp)

Do not multiply these add-on prices by the number of hours.

**Adding items after booking (user, 2026-11-20):** musicians sometimes
forget cables or an instrument. Customers can add rental items from their
booking page until the session starts; studio staff can add them in the
admin until the session ends. Added items must be free in shared stock for
the booking's time, are charged once like any rental, and go onto the
balance paid after the rehearsal. The 50% downpayment does not change.
The 5-string bass (1 unit) was added on 2026-11-20, same price as the
4-string basses.

### Shared additional rental inventory

The following stock is shared across all three rooms. It is not a
per-room allocation.

  Item                              Studio-wide quantity
  ------------------------------- ----------------------
  Extra electric guitars                               5
  Extra bass guitars (4-string)                        3
  Extra bass guitar (5-string)                         1
  Keyboards                                            2
  Extra microphones with cables                        5
  Extra guitar amplifiers                              2
  Extra bass amplifiers                                1
  Acoustic guitars                                     1
  Mono guitar cables                                   5

**Important inventory notes:** - Acoustic guitar rental (PHP 100) is
**confirmed bookable; the studio has 1 unit**, shared across all rooms.
- The "Extra amplifier" add-on (PHP 80 each) covers **two separate
items**: extra guitar amplifier (stock 2) and extra bass amplifier
(stock 1). Both cost PHP 80. Track their stock separately and show them
as two choices in the booking flow (for example "Extra guitar amp" and
"Extra bass amp"). -
The keyboard rental is described as "Synth/Keyboard + cables" at PHP
100. Treat it as one rentable kit unless the owner clarifies
otherwise. - The "guitar cable" add-on is PHP 40 each; the shared
inventory specifies 5 mono guitar cables. - Confirm whether extra
microphones and cables are rented as one kit. The current price
description says they are bundled. - The eventual real booking system
must check shared stock across all three rooms for overlapping time
ranges. Example: if all 5 extra microphones are reserved by overlapping
bookings, the next customer must not be allowed to reserve another. -
For the prototype, implement a shared inventory availability simulation
with sample reservations. Clearly state that mock data is not live
inventory.

### Services and prices

  ------------------------------------------------------------------------
  Service                                      Price Duration / notes
  --------------------- ---------------------------- ---------------------
  Band rehearsal                    PHP 250 per hour Per room; standard
                                                     equipment included

  Lesson -- beginner             PHP 500 per session One-on-one; session
  (drums, guitar, bass,                              lasts 30 minutes;
  keyboard, piano, voice)                            uses a studio room

  Lesson -- intermediate         PHP 750 per session One-on-one; session
  (drums, guitar, bass,                              lasts 1 hour;
  keyboard, piano, voice)                            uses a studio room

  Live gig streaming                PHP 500 per hour Details/packages to
                                                     be confirmed
  ------------------------------------------------------------------------

**Lessons offered (confirmed by the user):** drums, guitar, bass,
keyboard, piano, and voice (six lesson types). Each is available at
**beginner** and **intermediate** level. Keyboard and piano are
separate lesson types.

**Lesson structure:** each booking is **one session**. The level tells
the instructor what to teach; it is not a multi-session course package.

**Lesson duration (confirmed by the user; replaces the earlier 2--4
hours):** the duration is fixed by level, for every lesson type:

-   **Beginner:** 30 minutes.
-   **Intermediate:** 1 hour.

The customer does not choose a duration; it follows from the level.
Lesson start times use **30-minute increments** (prototype assumption,
configurable). A lesson blocks its room for its exact time, so a
10:00--10:30 lesson makes that room unavailable for a 10:00--11:00
rehearsal.

**Lesson pricing (confirmed by the user, 2026-11-16; replaces the
earlier PHP 2,000 / to-be-confirmed prices):**

-   **Beginner:** PHP 500 per session (30 minutes).
-   **Intermediate:** PHP 750 per session (1 hour).

The same price applies to all six lesson types. Do not invent separate
rates per instrument. Lesson payment terms (for example whether a
downpayment applies) are still not confirmed.

**Instructors:** bookers choose from the instructors who are available
for the selected instrument, level, and time. Real instructor names,
which instruments/levels each teaches, and schedules have not been
provided. Use **clearly labelled demo instructors** (see §6).

The following services shown in an old reference menu are **not
offered** and must not appear as active services: - Track-by-track
recording. - Full-band live recording. - Professional song
arrangement. - Mixing and mastering. - Podcast recording. - Voice-over
recording.

Only promote rehearsal, one-on-one musical lessons, and live gig
streaming as studio services.

### Reservation payment and cancellation

Confirmed information: - Rehearsal reservations require a **50%
downpayment via GCash upon booking**. - The 50% downpayment is
**non-refundable**. - A customer may cancel before the day of the
booking. - The remaining 50% is payable, but the exact collection timing
and method have not been confirmed.

UX requirements: - Show the downpayment amount and remaining balance
separately. - Clearly disclose the non-refundable policy before the
customer submits a reservation/payment. - Do not describe a cancellation
on the booking day or later as permitted; the stated policy only allows
cancellation before the booking day. - Do not invent rescheduling,
refund exceptions, grace periods, or no-show policies. - Do not claim an
actual GCash payment gateway exists.

**Suggested prototype flow (recommendation, not a confirmed operational
process):** 1. Customer completes booking details. 2. The interface
calculates the 50% downpayment. 3. Customer is shown a clearly labelled
demo GCash payment instruction panel. 4. Customer can enter a mock GCash
reference number and attach a mock proof-of-payment file or use a demo
upload state. 5. Booking enters "Awaiting payment verification". 6.
Admin can mark the mock payment as verified and confirm the booking.

If no actual GCash number or payment QR is supplied, use a conspicuous
placeholder such as "GCash details to be provided by studio" rather than
inventing one.

### Retail shop

The studio also sells: - Acoustic guitar strings. - Electric guitar
strings. - Electric bass strings: 4-string set PHP 600 and 5-string set
PHP 1,000 (user, 2026-11-20).

Not yet provided: - Brand, product variants/gauges, prices, product
descriptions, photos, stock quantities, online payment method,
delivery/pickup method, shipping rates, returns policy.

Build a small catalog with clearly labelled sample/demo products only if
needed for visual completeness. Every invented product, price, or stock
value must be visibly labelled as demo content and easy to replace.
Prefer an inquiry-first shop for the first prototype rather than
pretending full e-commerce fulfillment exists.

Keep retail products separate from temporary rehearsal equipment
rentals.

------------------------------------------------------------------------

## 4. Recommended site architecture

### Public website

-   `/` --- Home
-   `/about` --- About the studio
-   `/services` --- Services overview
-   `/services/rehearsal` --- Band rehearsal
-   `/services/lessons` --- One-on-one lessons
-   `/services/live-streaming` --- Live gig streaming
-   `/rooms` --- Three rehearsal rooms and included equipment
-   `/rates` --- Base rates and optional rentals
-   `/shop` --- Strings catalog
-   `/contact` --- Contact details and inquiry form

Do not invent an address, phone number, email address, social account,
or opening-day schedule. Use editable placeholders. The About page may
use short placeholder copy, visibly labelled "Placeholder -- to be
written by studio"; do not invent history, founders, or awards.

### Customer portal

-   `/portal` --- Customer dashboard
-   `/portal/book/rehearsal` --- Rehearsal booking flow
-   `/portal/book/lesson` --- Lesson request/booking
-   `/portal/live-streaming` --- Streaming inquiry
-   `/portal/reservations` --- Reservations list and details
-   `/portal/orders` --- Shop inquiries/orders
-   `/portal/profile` --- Customer profile

For the first draft, account authentication can be simulated. Do not
imply that real accounts or secure authentication are active if they are
not.

### Admin portal

-   `/admin` --- Admin overview
-   `/admin/bookings` --- Reservation management
-   `/admin/rooms` --- Room configuration and availability
-   `/admin/inventory` --- Shared additional rental inventory
-   `/admin/lessons` --- Lesson requests/schedule
-   `/admin/instructors` --- Demo instructors, what they teach, and
    their schedules
-   `/admin/streaming` --- Live gig streaming inquiries
-   `/admin/products` --- Shop catalog and stock
-   `/admin/settings` --- Editable business settings

The admin portal should be visually separated from the public site and
customer portal. A demo admin mode is acceptable; clearly label it as a
prototype and do not treat client-side route hiding as real security.

------------------------------------------------------------------------

## 5. Main UX flows

### A. Rehearsal booking --- highest priority

Build this as a guided multi-step flow with a visible progress
indicator.

**Step 1: Choose date and time** - Display the three rooms and their
availability for the selected date. - Enforce studio hours of 9:00
AM--9:00 PM. - Show clear available, unavailable, and selected states. -
Do not invent slot increments. If a prototype needs increments to
demonstrate the UI, label them as configurable demo settings. - Do not
allow overlapping bookings for the same room.

**Step 2: Choose room** - Select Room 1, Room 2, or Room 3. - Show room
photos as replaceable placeholders or generated/royalty-safe visual
assets. - Show the standard included equipment prominently.

**Step 3: Choose duration** - Calculate the room rental at PHP 250 per
hour. - Prevent a booking from extending beyond 9:00 PM. -
Minimum/maximum duration is TBD; use a clearly labelled configurable
demo default if required.

**Step 4: Optional equipment** - Show standard included equipment
separately from optional paid rentals. - Allow customers to select
optional add-ons and quantities. - Show live remaining availability from
the mock shared inventory for the selected time. - Prevent the selected
quantities from exceeding available shared stock. - Clearly explain that
optional equipment prices are per reservation, not per hour.

**Step 5: Customer details** - Collect only reasonable booking
information: name, email or phone, and optional band name/notes. - Do
not request unnecessary sensitive information.

**Step 6: Review and payment** - Itemize room rental and add-ons. -
Calculate total. - Calculate 50% downpayment. - Show remaining
balance. - Display the cancellation policy in plain language. - Present
GCash as the required payment method, but use placeholder details and a
simulated submission flow until actual payment instructions are
provided.

**Step 7: Confirmation state** - Show booking reference, requested
schedule, room, equipment, total, downpayment status, and next step. -
Distinguish "submitted / awaiting verification" from "confirmed".

### B. Rehearsal pricing formula

`Room subtotal = duration in hours × PHP 250`

`Equipment subtotal = sum of (selected quantity × one-time item price)`

`Booking total = room subtotal + equipment subtotal`

`Downpayment = booking total × 0.50`

`Remaining balance = booking total − downpayment`

Example: - 3 hours × PHP 250 = PHP 750. - 2 guitar cables × PHP 40 = PHP
80. - 1 extra microphone kit × PHP 40 = PHP 40. - 1 keyboard kit × PHP
100 = PHP 100. - Total = PHP 970. - 50% downpayment = PHP 485. -
Remaining balance = PHP 485.

Ensure the arithmetic is correct. Do not charge add-ons hourly.

### C. Lesson booking

Suggested step order:

1.  **Instrument:** drums, guitar, bass, keyboard, piano, or voice.
2.  **Level:** beginner (PHP 500 per 30-minute session) or
    intermediate (PHP 750 per 1-hour session).
3.  **Date and start time:** 30-minute start increments; the session
    (30 minutes for beginner, 1 hour for intermediate) must end by 9 PM.
4.  **Instructor:** list only instructors who teach that instrument at
    that level and are free for the whole session. If none are free,
    say so and suggest picking another time.
5.  **Contact details** and optional notes (for example experience or
    goals).
6.  **Review and submit:** instrument, level, instructor, schedule,
    assigned room, and price (or "to be confirmed").

Rules:

-   **Lessons take place in a studio room** and block that room. At
    least one of the three rooms must be free for the whole session
    (see §6).
-   An instructor cannot have two overlapping lessons.
-   A time slot is offered only when **both** an instructor and a room
    are free.
-   Use demo instructors only, labelled as demo. Do not invent a
    lesson-specific payment policy.
-   Show request submitted / awaiting studio response unless the
    prototype explicitly uses demo availability.

### D. Live gig streaming inquiry

-   Show PHP 500 per hour.
-   Collect event date, estimated duration, venue/location, contact
    details, and a short description.
-   Do not invent streaming packages, equipment lists, camera counts,
    platform support, or technical guarantees.
-   Treat as an inquiry pending studio confirmation.

### E. Shop

-   Browse acoustic guitar strings, electric guitar strings, and
    electric bass strings.
-   Product prices and stock are TBD.
-   Use a catalog/inquiry-first experience for MVP.
-   Clearly label any sample product information as demo content.

### F. Customer reservation management

-   List upcoming, pending, confirmed, completed, and cancelled
    reservations.
-   Customer may request cancellation only before the booking day
    according to the stated policy.
-   Clearly state the 50% downpayment is non-refundable.
-   Rescheduling is allowed before the booking day (confirmed
    2026-11-20). Do not invent an automated refund workflow.

### G. Admin workflows

Admin should be able to: - View booking requests and their status. -
Review mock GCash payment reference/proof. - Mark payment as verified in
demo mode. - Confirm or reject a booking request (rejection policy is
TBD; make this a demo admin action, not a stated business policy). -
View room schedule. - View and adjust shared equipment quantities in
demo mode. - View lesson requests and streaming inquiries. - Manage demo
shop products.

------------------------------------------------------------------------

## 6. Availability and inventory logic

This is a core product requirement, not merely a visual detail.

### Room conflict rule

A room cannot have two active reservations whose time ranges overlap.

Use the standard interval overlap test:

`existing.start < requested.end AND requested.start < existing.end`

Treat adjacent bookings (one ends exactly when another starts) as
non-overlapping. **Confirmed (2026-11-20):** no gap is needed between
bookings for setup or teardown.

### Shared equipment conflict rule

For each shared item, calculate how many units are reserved by active
bookings that overlap the requested time range.

`available quantity = total studio stock − overlapping reserved quantity`

Reject or prevent a request if selected quantity exceeds available
quantity.

Only count bookings in relevant active statuses (for example, awaiting
verification if the studio intends to hold inventory during payment
verification, confirmed, and in-progress). Make this policy configurable
and flag it for owner confirmation. Avoid silently releasing inventory
in ways that could create double-bookings.

### Booking status model

Use one explicit status flow for rehearsal bookings. Do not invent
others.

  ------------------------------------------------------------------------
  Status                  Meaning                         Holds room +
                                                          shared stock?
  ----------------------- ------------------------------- ---------------
  `awaiting_payment`      Details entered, no GCash       No (demo)
                          reference submitted yet

  `awaiting_verification` Mock GCash reference/proof      **Yes**
                          submitted; admin has not        (default;
                          verified                        configurable)

  `confirmed`             Admin verified downpayment      Yes

  `completed`             Booking time has passed         No

  `cancelled`             Customer cancelled before the   No (released)
                          booking day; downpayment is
                          non-refundable

  `rejected`              Demo admin action; rejection    No (released)
                          policy TBD
  ------------------------------------------------------------------------

Holding stock during `awaiting_verification` is the safer default
because it avoids double-booking. It is not a confirmed owner policy;
keep it as a setting and list it in the owner questions.

### Lessons and room usage

**Confirmed: lessons use one of the three studio rooms**, so a lesson
blocks its room exactly like a rehearsal booking. The room overlap rule
applies across both booking types: a room cannot have an overlapping
rehearsal and lesson, or two overlapping lessons.

Prototype behaviour:
-   When a lesson is requested, the system checks that at least one
    room is free for the whole session. It suggests (auto-assigns) the
    lowest-numbered free room; the admin can reassign it to another free
    room.
-   Lesson statuses: `requested` → `confirmed` → `completed`, plus
    `declined` (demo admin action) and `cancelled`.
-   The room is held while `requested` and `confirmed` (configurable,
    same reasoning as the rehearsal stock hold; flag for owner
    confirmation). It is released on `declined` or `cancelled`.
-   Lessons do not use shared rental equipment unless the owner says
    otherwise.

### Instructor availability

-   Each instructor has: the instruments and levels they teach, and a
    weekly schedule of hours they are available (demo data).
-   An instructor is available for a lesson when the whole session is
    inside their schedule **and** they have no overlapping held lesson
    (same overlap test as rooms).
-   Demo instructors use obviously fictional placeholder names, for
    example "Demo Instructor 1", with a "Demo" label wherever they
    appear. Seed about 6--7 demo instructors covering all six lesson
    types and both levels (one instructor may teach more than one, for
    example keyboard and piano), with at least one lesson type taught
    by two instructors so the choice is meaningful.
-   The admin can view each instructor's lessons and edit demo
    instructor details and schedules.
-   The rehearsal booking grid and admin room schedule show lesson
    blocks as "Lesson" (booked), without customer details on the public
    or customer side.

### Demo implementation

Use a centralized mock data/service layer. Do not scatter inventory
counts and prices through UI components. Make it possible to replace
mock services with API calls later.

Persist demo state in `localStorage` so that an admin action (for
example, verifying a payment) shows up in the customer portal. Provide
a visible **Reset demo data** button in both portals. Wrap all storage
access in try/catch and fall back to the seed data.

------------------------------------------------------------------------

## 7. Suggested data model

Design typed models/interfaces for at least:

-   `Room`
-   `RoomIncludedEquipment`
-   `RentalEquipment`
-   `InventoryReservation`
-   `Customer`
-   `RehearsalBooking`
-   `BookingEquipmentItem`
-   `Payment`
-   `LessonType` (drums, guitar, bass, keyboard, piano, voice)
-   `LessonLevel` (beginner, intermediate)
-   `Instructor`
-   `LessonRequest`
-   `StreamingInquiry`
-   `ShopProduct`
-   `ShopInquiry` or `ShopOrder`
-   `BusinessSettings`

Suggested key fields:

**Room** - id - name - description - image - includedEquipment - active

**RentalEquipment** - id - name - category - unitPrice - totalQuantity
(nullable when unknown) - pricingUnit (per item / per kit) - active

**RehearsalBooking** - id / reference - customer details - roomId -
startAt - endAt - durationHours - selectedEquipment - roomSubtotal -
equipmentSubtotal - total - downpaymentRequired - downpaymentStatus -
paymentReference - status - createdAt

**Payment** - id - bookingId - method - amount - reference -
proofFileUrl (mock only) - status - verifiedAt

**Instructor** - id - displayName - instruments - levels -
weeklyAvailability - active - isDemo

**LessonRequest** - id / reference - lessonType - level - instructorId
- roomId (assigned room) - startAt - endAt - durationMinutes (30 for
beginner, 60 for intermediate; derived from level) -
sessionPrice (PHP 500 beginner, PHP 750 intermediate; null = to be
confirmed) - customer details - notes - status

**StreamingInquiry** - id - eventDate - estimatedHours - eventLocation -
estimatedPrice (PHP 500 × hours) - customer details - status

**ShopProduct** - id - name - category - description - price (nullable
until confirmed) - stock (nullable until confirmed) - image - isDemo

Use PHP as the currency and format prices consistently with the
Philippine peso symbol.

------------------------------------------------------------------------

## 8. Visual and brand direction

Create a distinctive, musician-oriented identity with a **grunge,
dark-theme** look. Avoid a generic corporate SaaS template.

### Design references

Reference images live in `docs/design-references/`. They are
third-party work: use them as **inspiration only**. Do not copy their
artwork, logos, or text, and keep the folder out of Git (see §10).

  ------------------------------------------------------------------------
  File                              Take from it          Do not take
  --------------------------------- --------------------- ----------------
  `01-collage-layout-brndz.jpg`     Torn-paper section    The lime/
                                    dividers, highlighter chartreuse
                                    swipes on key words,  color; the
                                    tape strips, marker   sneaker/brand
                                    scribbles, sticker    imagery
                                    labels, cream paper
                                    bands between black
                                    sections

  `02-graffiti-texture.jpg`         Textured wall         Graffiti script
                                    backgrounds at low    fonts for
                                    opacity               anything
                                                          people must
                                                          read

  `03-red-on-maroon-type.webp`      Huge condensed        Its maroon
                                    headings, bold        palette; small
                                    single-accent color   red text on
                                    blocks                dark (low
                                                          contrast)

  `04-portal-layout.webp`           Portal structure:     The light theme
                                    grouped sidebar, top
                                    banner, welcome card,
                                    designed empty state,
                                    "more ways to..."
                                    cards

  `05-poster-duotone-moth.jpg`      Duotone/halftone      The moth
                                    photos, paper grain,  artwork,
                                    condensed stencil     "Parental
                                    type, catalog-style   Advisory"-style
                                    small text, barcode   marks
                                    details
  ------------------------------------------------------------------------

### Signature idea: reservations as gig tickets

Rehearsal reservations look like **gig ticket stubs**: perforated edge,
monospace booking reference (for example `MBS-2611-0042`), and a
decorative barcode. The price breakdown in the booking flow looks like
a **printed receipt**. Use this for the booking confirmation, the
reservation cards, and the reservation detail view. It carries the
grunge character into the portal without cluttering forms.

### Grunge level per area

  Area              Level    Treatment
  ----------------- -------- ---------------------------------------------
  Public site       High     Torn dividers, tape, halftone duotone photos,
                             noise overlay, marker annotations, huge
                             condensed type
  Booking flow      Medium   Textured header and progress bar; clean
                             steps; receipt-style price summary
  Customer portal   Low      Dark version of the reference portal layout;
                             torn edge only on the top banner; status
                             labels styled as tape
  Admin portal      Lowest   Plain, dense, readable tables; a
                             "DEMO ADMIN" tape banner

Never put texture behind form fields, tables, prices, or small text.

### Color palette (confirmed by the user)

The brand palette is **palette v3**, set by the user on 2026-11-16. It
replaces v1 (`#0E0426` / `#1A1740`, shown in
`docs/design-references/06-color-palette.png`) and v2 (`#181B26` /
`#1C2040`). The feel is **greys and dark greys** with a desaturated
blue-grey surface, a warm **off-white**, and **rust as an accent only**.

| Token      | Value     | Use |
|------------|-----------|-----|
| `ink`      | `#141519` | Page background (near-black grey) |
| `charcoal` | `#1E1F24` | Dark grey bands, footer, portal banner |
| `surface`  | `#272A33` | Cards, sidebar, inputs, raised panels (desaturated blue-grey) |
| `slate`    | `#64656B` | Borders, dividers, disabled states, decorative texture. **Not for text.** |
| `rust`     | `#A63726` | **Accent only**: primary buttons, highlight swipes, small marks. No large rust areas. |
| `paper`    | `#ECE7DE` | Off-white: body text on dark; receipts, tickets, tape |
| `band`     | `#C6BFB2` | Darker off-white for light torn-paper section bands (with `ink` text) — user, 2026-11-16 |

Two **derived tints** are needed for accessible text. They are lighter
versions of palette colors, not new brand colors:

| Token        | Value     | Use |
|--------------|-----------|-----|
| `muted`      | `#A3A29D` | Secondary text on dark (warm grey) |
| `rust-light` | `#EE7360` | Red text, links and focus rings on dark (lighter `rust`) |

**Measured contrast (WCAG):**

| Pair | Ratio | Rule |
|------|-------|------|
| `paper` on `ink` / `charcoal` / `surface` | 14.8 / 13.4 / 11.6 | Body text: OK |
| `ink` text on `paper` / `band` | 14.8 / 10.0 | OK |
| `rust` text on `band` | 3.6 | **Not for text**; links on bands are `ink` + underline |
| `paper` text on `rust` button | 5.3 | OK |
| `rust` text on `paper` band | 5.3 | OK, but keep red to small accents |
| `rust` on dark (`ink` / `charcoal` / `surface`) | 2.8 / 2.5 / 2.2 | **Never for text**; use `rust-light` |
| `slate` on dark | 2.8 / 2.6 / 2.2 | **Never for text**; borders only |
| `muted` on `ink` / `charcoal` / `surface` | 7.1 / 6.4 / 5.6 | Secondary text: OK |
| `rust-light` on `ink` / `charcoal` / `surface` | 6.3 / 5.7 / 5.0 | Red text on dark: OK |

Rules:
-   `ink` and `surface` are close in value. Separate cards with a
    `slate` border or texture, not by background shade alone.
-   Rust is an accent only (user, 2026-11-16): primary buttons,
    highlight swipes, small marks. Never large rust bands or text blocks.
-   Type is mixed case, not all caps, except emphasised words
    (highlight swipes and accent words), which are set in capitals
    (user, 2026-11-16).
-   Buttons are torn paper scraps, not boxes (user, 2026-11-16).
-   Error states are also red-ish, so they must carry an icon and text
    so they are not confused with brand accents. Status must never rely
    on color alone.

### Typography

-   Display headings: a condensed face such as **Anton** or **Big
    Shoulders Display**.
-   Optional hero-only texture face: **Rubik Dirt** (gives grunge
    texture without image files). Never for body or UI text.
-   Handwritten annotations: **Permanent Marker**, sparingly.
-   Body/UI: **Inter** or **Archivo**.
-   Prices, references, receipts: **Space Mono**.
-   Self-host fonts via `@fontsource/*` packages rather than loading
    them from Google at runtime.

### Imagery

-   **Photos (user, 2026-11-16):** use the photos the user supplied
    (sources in `photo-sources/`, optimized to `public/images/` by
    `node scripts/optimize-images.mjs`) instead of illustrations. The
    hero uses the empty-room photo as a background with noise and
    halftone. **Rights confirmed (owner, 2026-11-20):** every photo is
    either free to use or taken from the studio's own Facebook page.
    Only visible brand logos (drum and amp makers) remain for the owner
    to accept or not; see `public/images/CREDITS.md`.
-   Unify photos with a duotone treatment in CSS (shadows `ink`
    `#141519`, highlights `paper` `#ECE7DE`, or `rust` `#A63726` as an
    occasional accent), plus halftone and grain, so they read as one set.

### Implementation notes for grunge effects

-   Noise/grain: SVG `feTurbulence` overlay, low opacity.
-   Torn edges: CSS `mask-image` with an SVG path, not large PNGs.
-   Tape: rotated, semi-transparent pseudo-elements.
-   Halftone: CSS radial-gradient masks or pre-processed small images.
-   Respect `prefers-reduced-motion`; keep any motion subtle.
-   Keep total texture weight small so mobile pages stay fast.

Use a consistent design system: - Color tokens. - Type scale. - Spacing
scale. - Buttons and form controls. - Cards and tables. - Status
labels. - Responsive navigation. - Accessible contrast and visible focus
states.

Avoid overusing red for large text blocks or low-priority UI. Reserve
strong accent color for primary actions and meaningful states.

### Responsive behavior

Support: - Desktop-first admin and booking calendar. - Tablet layouts. -
Mobile public website and booking flow. - Mobile-friendly forms and
clear touch targets.

### Accessibility

-   Semantic HTML.
-   Keyboard navigation.
-   Visible focus states.
-   Form labels and helpful validation.
-   Sufficient color contrast.
-   Do not rely on color alone for availability or status.
-   Accessible calendar controls and error messages.

------------------------------------------------------------------------

## 9. Recommended technical approach

Use a simple, maintainable architecture suitable for GitHub and
Cloudflare.

### Initial prototype stack

-   React
-   TypeScript
-   Vite
-   Tailwind CSS (v4: define the color/type tokens with `@theme` in
    CSS)
-   React Router
-   Lucide icons
-   A lightweight form validation approach
-   Local mock data and a service abstraction
-   Vitest for unit tests of pricing and availability logic

Claude may recommend an equivalent stack if there is a strong reason,
but explain the tradeoff before changing it.

### Prototype boundaries

For the first draft: - Use mock data. - Use simulated booking
submission. - Use simulated payment verification. - Use simulated
authentication or a clearly labelled demo mode. - Use mock admin
actions. - Persist demo state locally only if useful. - Never imply that
bookings are real or that GCash transactions are processed. - Do not
collect real payment details.

### Future production architecture

Prepare for a future Cloudflare-native backend: - Cloudflare Pages for
static frontend hosting (or the appropriate Cloudflare deployment target
for the chosen framework). - Cloudflare Workers for API endpoints. -
Cloudflare D1 for relational booking, room, customer, inventory, and
product data. - Cloudflare R2 for payment proof uploads and product
images, if needed. - Secrets and environment variables managed through
Cloudflare configuration, never committed to Git.

Do not build or claim production backend functionality in the mock
prototype. Keep the frontend data access behind typed service modules so
a real API can replace the mock implementation.

------------------------------------------------------------------------

## 10. GitHub repository expectations

Suggested repository name:

`mario-berts-studios` (personal account `zakbravoilo-png`, photo rights confirmed
2026-11-20)

Suggested structure:

``` text
manoy-berts-studios/
├── public/
│   ├── images/
│   └── favicon.svg
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── booking/
│   │   ├── inventory/
│   │   ├── lessons/
│   │   ├── streaming/
│   │   ├── shop/
│   │   └── admin/
│   ├── pages/
│   ├── data/
│   ├── services/
│   ├── types/
│   ├── styles/
│   └── utils/
├── docs/
│   ├── MANOY-BERTS-CLAUDE-HANDOFF.md
│   └── design-references/      (git-ignored; inspiration only)
├── .gitignore
├── README.md
├── CLAUDE.md
├── package.json
└── vite.config.ts
```

The actual structure may vary if the framework requires it. Keep
features modular and avoid a monolithic component.

### Git expectations

-   Create a clear `.gitignore`.
-   Never commit `.env` files, secrets, payment credentials, or private
    customer data.
-   Include `.env.example` only with placeholder variable names and no
    secrets.
-   Use meaningful commit messages.
-   Keep the README current.
-   Do not create a public repository or push code until the user
    explicitly authorizes the action.
-   Add `docs/design-references/` to `.gitignore`. The images are
    third-party work and must not be published.

### Account separation (important)

This project uses a **personal GitHub account and a personal Cloudflare
account**, separate from the user's work (ICON) accounts. The machine
also has work credentials. Mixing them up is the main setup risk.

-   **Project location:** keep the repo outside the work folders, for
    example `D:\Projects\manoy-berts-studios`.
-   **Git identity:** set `user.name` and `user.email` **in this repo
    only** (`git config user.email ...` without `--global`), or with an
    `includeIf "gitdir:D:/Projects/"` rule in the global config. Before
    the first commit, run `git config user.email` and confirm it is the
    personal address, not the work one.
-   **GitHub authentication:** Windows Credential Manager keeps one
    login per host, so pushes can silently use the work account. Use one
    of:
    -   an SSH key for the personal account with a host alias in
        `~/.ssh/config`, so the remote is
        `git@github-personal:<personal-user>/mario-berts-studios.git`;
        or
    -   `gh auth login` for the personal account and `gh auth switch`
        when changing accounts. Check with `gh auth status` before
        pushing.
-   **Cloudflare:** `wrangler login` is a single machine-wide login.
    Prefer connecting the GitHub repo from the **personal** Cloudflare
    dashboard (Git integration), so no local Cloudflare login is needed.
    If wrangler is used, set the personal `account_id` in the wrangler
    config and run `wrangler whoami` before any deploy.
-   **Claude tooling:** do **not** use any Cloudflare MCP connector or
    other connected Cloudflare/GitHub tools in the Claude environment
    for this project; they may be linked to the work account. All
    account actions are done by the user, manually.

------------------------------------------------------------------------

## 11. Cloudflare deployment expectations

**Chosen target: Cloudflare Workers with static assets.** Cloudflare
now steers new projects to Workers rather than Pages, and the planned
backend (Workers + D1 + R2) can then live in the same project. Pages
remains an acceptable fallback (SPA fallback via a `_redirects` file
containing `/* /index.html 200`); document it in the README as an
alternative only.

For the initial Vite-based static prototype: - Prepare a production
build command (`npm run build`). - Confirm the generated output
directory (commonly `dist`). - Add a `wrangler.jsonc` that serves
`dist` as static assets with
`"not_found_handling": "single-page-application"`. - Connect the GitHub
repository from the personal Cloudflare dashboard (Workers Builds /
Git integration). - Set the correct build command and output
directory. - Ensure SPA route fallback works for routes such as
`/portal` and `/admin`. - Test direct navigation and refresh on nested
routes. - Use a preview deployment before production. - Do not add
secrets unless a real backend requires them.

For future backend functionality, evaluate Cloudflare Workers + D1 + R2.
Do not assume that a static Pages deployment alone provides secure
booking, authentication, payment verification, or transactional
inventory locking.

Deployment instructions must reflect the actual framework and Cloudflare
adapter/configuration used. Do not invent a deployment success state.

------------------------------------------------------------------------

## 12. MVP priorities

### Must-have for first draft

1.  Public homepage with clear service calls to action.
2.  Services page with only the confirmed services.
3.  Rooms and included equipment presentation.
4.  Rates and additional equipment pricing.
5.  Rehearsal booking flow with correct pricing calculation.
6.  Mock room availability and shared inventory validation.
7.  50% downpayment and non-refundable cancellation disclosure.
8.  Mock GCash payment submission / awaiting verification state.
9.  Customer reservation list and detail.
10. Basic admin booking and inventory views.
11. Lesson request flow.
12. Live gig streaming inquiry flow.
13. Shop catalog with TBD/demo product data.
14. Responsive layout and accessible forms.

### Later phase

-   Real authentication and roles.
-   Real database and API.
-   Atomic booking/inventory reservation transactions.
-   Real file upload storage.
-   Real GCash payment integration, if the business obtains an
    appropriate provider setup.
-   Email/SMS notifications.
-   Full retail checkout and fulfillment.
-   Reports and analytics.
-   Production audit logging and security hardening.
-   Privacy notice and consent compliant with the Philippine Data
    Privacy Act of 2012 (RA 10173) before collecting real customer
    names, emails, or phone numbers. The prototype shows a placeholder
    privacy notice labelled "To be provided by studio".

------------------------------------------------------------------------

## 13. Acceptance criteria

The first draft is ready for review when:

-   A visitor can navigate the public site and understand all active
    services.
-   No unavailable service is advertised.
-   All three rooms are shown.
-   Each room's included equipment is clearly distinguished from paid
    add-ons.
-   Rehearsal base price is PHP 250 per hour.
-   Optional equipment prices are accurate and charged once per
    reservation.
-   The example booking total and 50% downpayment calculate correctly,
    and this is covered by a **unit test** (PHP 970 total, PHP 485
    downpayment, PHP 485 balance).
-   Unit tests also cover: same-room overlap rejected; adjacent
    bookings allowed; shared-stock over-allocation rejected for
    overlapping bookings across different rooms; bookings outside 9
    AM--9 PM (Asia/Manila) rejected.
-   A booking cannot exceed the 9 AM--9 PM operating window.
-   The mock booking flow prevents overlapping reservations for the same
    room.
-   The mock inventory flow prevents shared equipment over-allocation
    for overlapping bookings.
-   Lesson types are drums, guitar, bass, keyboard, piano, and voice, each at
    beginner (30-minute session, PHP 500) and intermediate (1-hour
    session, PHP 750).
-   A 30-minute lesson correctly blocks an overlapping 1-hour rehearsal
    in the same room (unit-tested).
-   Bookers can choose only instructors who teach the selected
    instrument and level and are free for the whole session; an
    instructor cannot be double-booked (unit-tested).
-   A lesson blocks its room: a rehearsal cannot be booked over it, and
    a lesson cannot be requested when no room is free (unit-tested).
-   Extra guitar amps (2), extra bass amp (1) and acoustic guitar (1)
    are bookable and limited by shared stock.
-   Live gig streaming is shown at PHP 500 per hour.
-   GCash is presented as the required downpayment method without
    falsely claiming a live integration.
-   The non-refundable downpayment policy is visible before submission.
-   Product prices and stock are marked TBD/demo rather than invented as
    facts.
-   Public, customer, and admin experiences are clearly separated.
-   The site works on mobile and desktop.
-   The README explains local setup, demo limitations, build, and
    deployment.
-   A production build completes without errors.

------------------------------------------------------------------------

## 14. Questions to confirm with the studio owner

Keep these visible in the documentation and do not block the first
prototype unless necessary:

1.  ~~What is the studio's address, contact number, email, and social
    media?~~ **Partly answered (user, 2026-11-16):** address L40 Blk 2
    Dama De Noche St., Don Francisco Village, Jaro, Iloilo City,
    Philippines 5000; email manoybartstudio@gmail.com; preferred
    contact is Facebook Messenger. Phone 0921 265 1898. Still open: the
    Facebook/Messenger page link — **decided 2026-11-19:** customers
    contact the studio through its Facebook page manually for now; no
    link on the site.
2.  What are the exact booking slot increments and minimum/maximum
    rehearsal durations? **Answered:** whole hours, 1-hour minimum
    (current behaviour). Maximum: until closing time.
3.  ~~Is there any setup/teardown buffer between bookings?~~
    **Answered (2026-11-20):** no gap is needed; bookings can run
    back to back.
4.  ~~Is same-day booking allowed?~~ **Answered (2026-11-20):** yes,
    bands can book on the day as long as a room is vacant.
5.  ~~Is acoustic guitar rental available, and how many units?~~
    **Answered:** yes, 1 unit.
6.  Are extra microphone and cable always a single rental kit?
7.  Is the keyboard and cable rental one kit?
8.  **Answered for lessons:** no downpayment — students pay the full
    fee on the day, at the studio. Each lesson fee is split 70% to the
    instructor and 30% to the studio (admin shows per-lesson splits
    and instructor payout totals). Streaming still open.
    Original question: does the 50% downpayment rule apply to lessons and live gig
    streaming, or only rehearsal reservations?
9.  ~~When and how is the remaining 50% collected?~~ **Answered:**
    after the rehearsal, in cash at the studio or by GCash (checked
    manually).
10. ~~What is the process for rescheduling?~~ **Answered (2026-11-20):**
    bands can reschedule before the booking day (same cut-off as
    cancelling). Not on the day itself. The prototype states this in
    the policy notice and asks customers to contact the studio; there
    is no self-service reschedule yet.
11. Who are the instructors, which instruments and levels does each
    teach, and what are their schedules? (Prototype: demo
    instructors.)
11a. ~~What are the lesson prices?~~ **Answered:** beginner PHP 500
    per 30-minute session, intermediate PHP 750 per 1-hour session.
12. How is live gig streaming scoped, and are there minimum hours or
    technical requirements?
13. ~~What are the shop product brands, variants, prices, and stock?~~
    **Partly answered:** Kuting-Kuting Music City Strings — acoustic
    PHP 200, electric PHP 200, bass PHP 600 (per set); drumsticks PHP
    300. Still open: gauges/variants, drumstick brand/size, and stock.
14. Will the shop support online checkout, pickup, delivery, or inquiry
    only?
15. What should happen to shared equipment stock while a booking is
    awaiting payment verification? (Prototype default: it is held.)
16. ~~Do lessons take place in one of the three rehearsal rooms?~~
    **Answered:** yes; lessons block their room. Open follow-up: is
    the room held while a lesson request is pending? (Prototype
    default: yes.)
17. ~~Does the "Extra amplifier" rental include bass amplifiers?~~
    **Answered:** yes; 2 extra guitar amps and 1 extra bass amp, PHP 80
    each.
18. What should the About page say (studio story, history, people)?
    (Prototype: labelled placeholder copy.)
19. What privacy notice should be shown when collecting customer
    details? **Drafted** at `/privacy` (2026-11-19); the studio must
    review it (ideally with a lawyer) and confirm the proposed retention
    periods before real data is collected.

------------------------------------------------------------------------

## 14b. Decisions made with the user during the build (2026-11-16)

These override earlier sections where they conflict.

-   **Name:** Manoy Bart's Studio (real name, owner's permission 2026-11-19).
-   **Contact:** address L40 Blk 2 Dama De Noche St., Don Francisco
    Village, Jaro, Iloilo City 5000; phone 0921 265 1898; email
    manoybartstudio@gmail.com; preferred channel Facebook Messenger
    (page link TBD).
-   **Lessons:** beginner PHP 500 / 30 min; intermediate PHP 750 / 1 hour.
-   **Shop:** Kuting-Kuting Music City Strings — acoustic PHP 200,
    electric PHP 200, bass PHP 600; **drumsticks PHP 300** (brand/size
    TBD). Shop stays inquiry-first.
-   **Guest booking:** customers can book rehearsals, request lessons
    and send streaming inquiries without an account (`/book`,
    `/book/lesson`, `/book/streaming`). Contact details collected:
    **name or nickname (required), contact number (required), email
    (optional)**, plus optional band name and notes. Guests look up
    bookings at `/my-booking` with reference + contact number (demo
    only; production needs a one-time-code check). The demo customer
    portal remains as the "signed-in" option.
-   **Sign-in (demo, client-side only — not security):** customers
    sign in with contact number + one-time code (code shown on screen;
    new numbers create an account; guest bookings with the same number
    appear in the account). Admin signs in with email
    manoybartstudio@gmail.com + a **published demo password** (user
    asked for email + password, 2026-11-19). Never put a real password in
    the static site; real protection needs a server or Cloudflare Access.
-   **GCash stays manual (user, 2026-11-19):** the customer pays in their
    GCash app, enters the reference (and optional receipt), and the studio
    verifies it by hand in admin. The final booking button reads "Confirm
    downpayment and proceed to book" and opens a confirmation prompt
    (booking, downpayment, balance, non-refundable, cancel-before-the-day)
    that replaces the acknowledgement checkbox. Automatic GCash
    (PayMongo/Xendit) is a later phase.
-   **Editable catalog (user, 2026-11-19):** admin can change rental
    item and shop item prices and stock, add and remove items, mark rental
    items out of service and shop items out of stock. Bookings store the
    price and name at booking time, so later edits never change existing
    bookings. Removed rental items are hidden but kept for old bookings.
-   **Studio cancellations (user, 2026-11-19):** admin can cancel a
    booking from Booking details. On the booking day or later the
    downpayment is kept; before the booking day the studio returns it
    manually via GCash and marks the refund as sent (overview shows a
    reminder). Unpaid bookings have nothing to return.
-   **Refund policy change (user, 2026-11-19):** the downpayment is no
    longer non-refundable. Customer cancellations (only allowed before the
    booking day) also get the downpayment back via a manual GCash refund.
    This replaces the "non-refundable" rule in §3 and §5.
-   **Lesson cancellation (studio, 2026-11-20):** customers can cancel a
    lesson up to the day before (Asia/Manila), but not on the lesson day
    itself. Lessons are paid in full on the day, so there is nothing to
    refund.
-   **Admin booking for a customer:** admin overview has "Book a room",
    the same flow; it links to the customer's account if the contact
    number matches, otherwise it's a guest booking.
-   **Admin schedule:** booked cells link to booking details; lesson
    cells to lesson requests.
-   **Homepage tone (user, 2026-11-19):** no "50% downpayment" wording on
    the homepage (felt too harsh). It shows a friendly "Good to know" note
    instead. The full payment terms are still disclosed before the customer
    commits: booking review step + confirmation prompt, Rates and Rehearsal
    pages.
-   **Booking confirmations by SMS and email:** every booking event
    produces an SMS to the contact number and an email if one was given.
    In the prototype these are **simulated** (demo outbox, admin
    "Messages" page); nothing is sent. Real sending needs a server-side
    function plus SMS and email provider accounts chosen by the studio.
-   **Look:** palette v3 (§8), off-white `band` #C6BFB2 for light
    sections, rust as accent only, mixed-case type with emphasised words
    in capitals, torn-paper buttons, user-supplied photos (rights
    confirmed 2026-11-20, see `public/images/CREDITS.md`).

## 15. Final instruction to Claude

Build the first draft in a deliberate sequence:

**First:** inspect repository and summarize the plan.

**Second:** establish the visual system, navigation, page structure, and
responsive shell.

**Third:** build the public website and service/room/rates content.

**Fourth:** build the rehearsal booking flow and correct
pricing/inventory calculations.

**Fifth:** build the customer portal and admin demo.

**Sixth:** add lesson, streaming, and shop experiences.

**Seventh:** test the critical user journeys, responsive behavior,
routes, and production build.

**Finally:** update README and CLAUDE.md, document the mock/real
boundaries, and provide GitHub + Cloudflare deployment instructions.

Do not sacrifice the booking rules for visual polish. The most important
demonstration is a coherent, believable user journey with transparent
pricing and realistic availability behavior.

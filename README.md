# Mario Bert's Studios — prototype

Website, customer portal and admin portal for a music rehearsal studio:
rehearsal room booking, one-on-one lessons, live gig streaming inquiries and a
shop (strings and drumsticks).

> **This is a prototype.** There is no server. Bookings, accounts, GCash payments
> and SMS/email confirmations are **simulated** and live only in your browser's
> local storage. Nothing is charged, reserved or sent.

## Quick start

Requires Node.js 20+ (built with Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest unit tests (pricing, overlaps, inventory, lessons, hours, cancellation, notifications) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript (strict) |
| `npm run check` | All of the above in one go |
| `node scripts/optimize-images.mjs` | Rebuild `public/images/*.webp` from `photo-sources/` |

## Where to look

| Area | URL |
|---|---|
| Public site | `/`, `/services`, `/rooms`, `/rates`, `/services/lessons`, `/services/live-streaming`, `/shop`, `/about`, `/contact` |
| Book without an account | `/book` (rehearsal), `/book/lesson`, `/book/streaming`, `/book/shop`, `/my-booking` (look up by reference + contact number) |
| Customer sign-in | `/login` — contact number + one-time code (demo code shown on screen). Demo account: **0900 000 0000**. New numbers create an account. Guest bookings with the same number appear in the account. |
| Customer portal | `/portal` (requires sign-in) — dashboard, bookings, reservations (ticket stubs), shop inquiries, profile |
| Admin sign-in | `/admin/login` — email **mario.bertstudios@gmail.com** + demo password **demo-admin-2026** (shown on the page on purpose — never put a real password in this static site) |
| Admin | `/admin` (requires admin sign-in). **Shared inventory** and **Shop products** let the studio edit prices and stock, mark items out of service / out of stock, and add or remove items. Price changes apply to new bookings only; existing bookings keep the price they were booked at. — bookings + payment review, room schedule, shared inventory, lessons, instructors, streaming, products, messages outbox, settings |

**Try the core journey:** book a room at `/book` → open `/admin/bookings`, verify
the mock payment → look the booking up at `/my-booking` and see it confirmed,
plus the simulated SMS/email in **Messages**. "Reset demo data" in either portal
restores the seed.

The seed data is generated relative to today (Asia/Manila), so the conflict
scenarios are always visible — e.g. tomorrow 11:00–13:00 every extra mic kit, the
acoustic guitar and the extra bass amp are taken, and a lesson blocks Room 3 at 2 PM.

## Business rules implemented

- Hours 9:00 AM – 9:00 PM, **Asia/Manila**; all times stored with `+08:00` and compared as instants (tests run with `TZ=UTC` to prove it).
- 3 rooms, ₱250 per hour per room, standard kit included (never an add-on).
- Optional rentals charged **once per booking** (not per hour), limited by **shared stock across all rooms** for overlapping times.
- 50% GCash downpayment (non-refundable); cancel only **before the booking day**. Policy shown — and acknowledged — before submitting.
- Room overlap check covers rehearsals **and lessons**; adjacent bookings are allowed; no buffer invented.
- Lessons: drums, guitar, bass, keyboard, piano, voice. Beginner ₱500 / 30 min, intermediate ₱750 / 1 hour. A slot opens only when an instructor (who teaches that instrument + level, is scheduled, and isn't double-booked) **and** a room are free. Room auto-assigned (lowest free).
- Booking statuses: awaiting payment → awaiting verification → confirmed → completed; cancelled; rejected (demo).
- Example from the brief is unit-tested: ₱970 total, ₱485 down, ₱485 balance.

Core logic lives in pure functions: `src/features/booking/availability.ts` and `pricing.ts`.

## What is mocked / demo-only

| Thing | In the prototype | For production |
|---|---|---|
| Data | `localStorage` via `src/services/demoStore.ts` | API (Cloudflare Worker + D1) |
| Double-booking protection | Client-side checks, re-validated on submit | Server-side, transactional checks |
| GCash | Placeholder panel, made-up reference, proof file name only | Studio's real GCash instructions; uploads to R2; admin verification |
| Sign-in | Passwordless one-time code generated and checked **in the browser** and shown on screen; accounts stored locally. Not security. | Server-side auth (SMS codes sent for real for customers; real admin password or Cloudflare Access in front of `/admin`) |
| Guest lookup | Reference + contact number | Add a one-time code check |
| SMS / email confirmations | Generated into a demo outbox (`/admin/messages`) | Server-side sending via an SMS provider and an email provider (studio picks and pays) |
| Instructors | "Demo Instructor 1…7" with demo schedules | Real names and schedules |

### Notifications (next step)

Messages are already composed for each event (booking saved, payment submitted,
confirmed, cancelled, rejected, lesson requested/confirmed/declined/cancelled) in
`src/services/notifications.ts`. To send them for real: add a Worker endpoint,
call an SMS provider and an email provider from it with secrets set in Cloudflare
(see `.env.example` for names), and call it from the actions in
`src/services/actions.ts`. Don't put provider keys in front-end code.

## Still to confirm with the studio

Booking slot size and min/max duration (demo: 1-hour slots, 1-hour minimum) ·
turnaround buffer · same-day booking · whether mic and keyboard rentals are kits ·
when/how the remaining 50% is collected · lesson payment and cancellation terms
(demo applies "before the day") · whether stock/rooms are held while awaiting
verification or while a lesson is requested (demo: yes) · rescheduling · real
instructors · streaming packages · string gauges, drumstick brand/size and stock · Messenger page link ·
privacy notice (RA 10173) · rights to the photos in `public/images/` (see
`public/images/CREDITS.md`).

## Project structure

```text
src/
  app/          router, layouts (Public, Portal, Admin), reset
  components/   grunge/ (TornEdge, Tape, Noise, DuotoneImage, TicketStub, Receipt…), ui/
  features/     booking/, lessons/, streaming/, inventory/, admin/
  pages/        public/, portal/, admin/, home/
  data/         seed data, settings, rooms, rentals, instructors, products, photos
  services/     demo store, actions, notifications
  styles/       tokens.css (palette + type), grunge.css
  utils/        Asia/Manila time, money
```

## Deploy (Cloudflare Workers static assets)

Use the **personal** Cloudflare and GitHub accounts, not work ones.

1. Push the repo to the personal GitHub account.
2. In the **personal** Cloudflare dashboard → Workers & Pages → Create → import the
   repo. Build command `npm run build`, output `dist`. `wrangler.jsonc` already
   serves `dist` with single-page-app fallback, so `/portal` and `/admin/...` work on refresh.
3. Use the preview deployment first; check direct loads of nested routes.

If you deploy with the CLI instead, set `account_id` in `wrangler.jsonc` to the
personal account, run `npx wrangler whoami` to confirm the account, then
`npm run build && npx wrangler deploy`.

**Pages (fallback):** build `npm run build`, output `dist`, and add a
`public/_redirects` file containing `/* /index.html 200` for SPA routing.

No secrets are needed for the prototype.

# CLAUDE.md --- Manoy Bart's Studio

Read `docs/MANOY-BERTS-CLAUDE-HANDOFF.md` in full before making product,
design, or architecture decisions. Design references are in
`docs/design-references/` (see handoff §8).

## Working rules

-   Treat the handoff document as the source of truth.
-   Manoy Bart's Studio is a real business; its name is used with the
    owner's permission (2026-11-19). Treat everything else as
    unconfirmed demo content until the studio confirms it.
-   Preserve confirmed prices, service scope, operating hours,
    cancellation rules, and shared inventory quantities exactly.
-   All dates and times use **Asia/Manila**.
-   Mark unknown details as TBD. Never invent real contact details,
    payment credentials, product prices, stock, policies, or
    integrations.
-   Use mock data for the first draft. Clearly label demo-only behavior.
-   Never claim that GCash, authentication, booking persistence, or
    production inventory locking is live unless actually implemented and
    configured.
-   Do not commit secrets, `.env` files, private customer data, payment
    credentials, or the third-party images in `docs/design-references/`.

## Workflow

-   First inspect the repo and present a build plan (routes, components,
    data model, assumptions). **Stop and wait for approval before
    writing code.**
-   Follow the build order in handoff §15. Do not sacrifice booking
    rules for visual polish.

## Accounts (important)

-   This project uses a **personal** GitHub account and a **personal**
    Cloudflare account, separate from the user's work (ICON) accounts.
-   Do not create/publish a GitHub repository, push, or deploy to
    Cloudflare without explicit user authorization. The user performs
    account actions manually.
-   Do **not** use any Cloudflare MCP connector or other connected
    GitHub/Cloudflare tools in this environment for this project; they
    may be linked to the work account.
-   Before the first commit, confirm `git config user.email` (repo-local)
    is the personal address. Never set git identity globally.

## Design

-   Dark grunge identity: torn paper, tape, halftone duotone photos,
    condensed display type.
-   Palette (v3): `#141519` ink, `#1E1F24` charcoal, `#272A33` surface,
    `#64656B` slate, `#A63726` rust (accent only), `#ECE7DE` off-white
    paper, `#C6BFB2` band (light section backgrounds). Derived text tints: `#A3A29D` muted, `#EE7360` rust-light.
    Mixed-case type; emphasised words in capitals; torn-paper buttons. Slate and rust are never
    used as text on dark backgrounds (handoff §8 has the contrast
    table).
-   Grunge level: public site high, booking flow medium, customer
    portal low, admin lowest. No texture behind forms, tables, prices,
    or small text.
-   Use the color tokens and contrast rules in handoff §8. Status must
    never rely on color alone.
-   Reservations are styled as gig ticket stubs; price summaries as
    receipts.

## Priority

1.  Rehearsal booking UX and correct price calculation.
2.  Room overlap (rehearsals **and lessons** both occupy rooms),
    instructor double-booking, and shared rental inventory conflict
    handling in the prototype. Lessons are drums, guitar, bass,
    keyboard, piano and voice (beginner/intermediate).
3.  Clear downpayment and cancellation disclosure.
4.  Public services, rooms, rates, lessons, streaming, and shop.
5.  Customer and admin demo portals.
6.  Responsive accessibility, documentation, and deployment readiness.

## Before finishing

-   Run lint, typecheck, and unit tests (Vitest), including the pricing
    example (PHP 970 / 485 / 485), overlap, and inventory tests.
-   Run a production build.
-   Fix errors rather than merely listing them.
-   Update README with setup, demo limitations, and deployment
    instructions (Cloudflare Workers static assets; Pages as fallback).
-   Summarize implemented features, mocked features, known limitations,
    and next steps.

# Taste Garden — Premium Redesign — Design Spec

**Date:** 2026-06-20
**Business:** Taste Garden – Wereld Keuken — Asian all-you-can-eat buffet (teppanyaki, wok, sushi bar, dessert & ice cream bar), Kortrijksestraat 276, 8870 Izegem, België.
**Goal:** Replace the dated site with a premium, cinematic, mobile-first experience that makes visitors want to reserve a table. No "AI-template" look — built on the real brand, real photography, refined typography, and meaningful motion.

## Locked decisions
- **Stack:** Next.js (App Router) + Tailwind CSS + GSAP/ScrollTrigger + Lenis smooth scroll + next-intl.
- **Design fidelity:** Use brand (logo, crimson) + real photos from the `.fig` as the foundation; elevate composition, type, and motion to best-in-class restaurant standards.
- **Languages:** NL (default) + FR + EN, locale-routed `/nl` `/fr` `/en`.
- **Imagery:** Hybrid — real photos as the backbone; AI generation only for atmospheric hero/section backgrounds where it elevates without faking the food.

## Brand assets (extracted from tastegarden.fig)
- Logo PNG (transparent, red "Wereld Keuken / Taste Garden" + teppanyaki-chef mark).
- Real photos: teppanyaki wagyu on the grill, plated dark dessert, red lanterns, wok cooking, Asian table spreads (×2), restaurant interior, Google-Maps location.

## Design system
- **Color (warm dark, brand-led):**
  - `--ink` #14100E (background), `--ink-soft` #1E1713
  - `--crimson` #C1272D (brand / primary CTA), `--crimson-deep` #8E1B20
  - `--ember` #D8A24A (gold accent — teppanyaki/lantern light)
  - `--cream` #F3EBE3 (primary text on dark), muted `#B6A99E`
  - Glass layers: `rgba(255,255,255,0.04–0.08)` + 1px warm border.
- **Type:** Playfair Display (display/editorial headings) + Inter (UI, prices, forms). Tabular figures for prices/hours.
- **Spacing:** 4/8px rhythm; generous section spacing; bento gallery.
- **Focus:** NO ring/outline. Keyboard focus shown via subtle brand glow / background shift on `:focus-visible` only (invisible to mouse/touch users). Never a default browser ring.

## Page structure (mobile-first, AIDA → reservation)
1. **Hero** — logo, "Wereld Keuken" headline, primary CTA "Reserveer". Cinematic parallax, masked text reveal, subtle ember/steam canvas (reduced-motion aware), Lenis. Skip-intro affordance.
2. **Concept à volonté** — value of unlimited world cuisine; split-text reveal + stat count-up.
3. **Stations** — Teppanyaki · Wok · Sushi · Dessert; pinned ScrollTrigger sequence, photo scale/crossfade. Immersive core.
4. **Signature dishes** — bento of real food photos, parallax columns, magnetic hover.
5. **Formules / prices** — Lunch (€25 / €17 / €5.50), Diner (€43 / €24 / €5.50), special menus; cards rise + price count-up. Included drinks noted.
6. **Ambiance** — lanterns/interior full-bleed parallax + birthday offer.
7. **Practical** — opening hours (today highlighted), address, map, click-to-call.
8. **Reservation** — date/time/guests/name/phone form, validation, success state; prominent phone fallback.
9. **Footer** + sticky mobile bar ("Reserveer" / "Bel").

## Motion system
GSAP + ScrollTrigger + Lenis. Reveal-on-scroll (staggered translate/opacity), pinned stations, hero/gallery parallax, magnetic buttons, count-up, ember canvas. `gsap.matchMedia()` drives full vs. reduced motion and desktop vs. mobile particle budgets. Every animation expresses cause/effect — no decoration-only motion.

## Quality bars
- Accessibility: AA contrast on dark, visible (custom) focus, 44px touch targets, alt text, `prefers-reduced-motion`, keyboard nav, labelled form fields.
- Performance: `next/image` AVIF/WebP, lazy below-fold, reserved aspect-ratios (CLS < 0.1), transforms/opacity only, code-split heavy client motion.
- Responsive: verified at 375 / 768 / 1024 / 1440.

## Out of scope (v1)
- Live reservation backend (form ships with client validation + API-route stub to wire to email/Resend later).
- CMS for menu content (content lives in i18n message files).

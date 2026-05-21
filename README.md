# Al-Shifa · مركز الشفاء للحجامة

**The sunnah of healing, refined.** A premium Arabic + English clinic & booking
platform for hijama in Saudi Arabia. Built like a real funded SaaS product.

> **Status:** turn 1 ships the full **scaffold + brand + landing page + i18n + database schema**.
> Booking engine, NextAuth, admin dashboard, blog, AI chat are designed in the
> schema and ready to land in turn 2 without re-architecting.

---

## 1 · Stack

- **Next.js 15** App Router · React 19 · TypeScript strict
- **Tailwind CSS** with brand tokens · shadcn-style primitives (locally vendored)
- **next-intl** for Arabic/English routing (`/ar` default, `/en`)
- **Framer Motion** for entrance + scroll animations
- **Prisma** ORM (full schema designed) targeting **Supabase Postgres**
- **NextAuth** wired in schema (`Account/Session/User`) — provider plug-in lands turn 2
- **next-themes** for dark/light/system
- **Edge OG image** generated at `/opengraph-image`
- **react-hook-form + Zod** for the contact form
- **Lucide** icon system

## 2 · What ships in this turn

| Module | Status |
| --- | --- |
| Landing page (hero, benefits, sunnah, services, gallery, testimonials, FAQ, map, contact, CTA) | ✅ |
| Premium Arabic + English copy | ✅ |
| RTL/LTR with `[locale]` routing | ✅ |
| Dark / light / system theme | ✅ |
| Brand identity (logo SVG, palette, typography) | ✅ |
| Sticky responsive navbar + mobile sheet | ✅ |
| Footer + newsletter input + social | ✅ |
| Floating WhatsApp button (prefilled message, RTL-safe) | ✅ |
| Contact API with Zod validation + naive rate limit | ✅ |
| SEO: metadata, `hreflang`, sitemap, robots, JSON-LD `MedicalBusiness` | ✅ |
| Edge-rendered OG image | ✅ |
| Full Prisma schema (users, appointments, services, reviews, blog, gallery, contact, notifications, settings) | ✅ |
| Booking engine UI · admin dashboard · NextAuth providers · blog CMS · AI chat | 🟡 turn 2 |
| WhatsApp Business webhook · reminder cron | 🟡 turn 2 |

---

## 3 · Run it locally

```bash
cd ~/projects/hijama-clinic
cp .env.example .env

# (Optional for turn 1 — only needed once you plug Supabase)
# Fill DATABASE_URL + DIRECT_URL + NEXTAUTH_SECRET in .env
# openssl rand -base64 32   # generate NEXTAUTH_SECRET

npm install
npm run dev
```

Open **http://localhost:3000** — you’ll be redirected to `/ar` (default locale).
Toggle to English via the globe icon in the navbar.

> The landing page renders without a database. The contact API logs to the
> server console until Prisma is wired in turn 2.

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev with Turbopack |
| `npm run build` | `prisma generate` + production build |
| `npm run typecheck` | TS only, no emit |
| `npm run db:push` | Push the schema to your database (dev) |
| `npm run db:migrate` | Create a migration |
| `npm run db:studio` | Open Prisma Studio |

---

## 4 · Supabase setup (free tier)

1. Go to <https://supabase.com> → **New project**. Pick the **Frankfurt** or
   **Bahrain** region for lowest latency from KSA.
2. After provisioning, open **Project Settings → Database**.
3. Copy two connection strings:
   - **Connection pooling → Transaction** (port `6543`) → paste into
     `DATABASE_URL` and append `?pgbouncer=true&connection_limit=1`
   - **Connection string → URI** (port `5432`) → paste into `DIRECT_URL`
4. Copy **Project URL** and **anon public key** from Settings → API into
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Push the schema:
   ```bash
   npm run db:push
   ```
6. Verify in Supabase **Table Editor** — you should see `User`, `Service`,
   `Appointment`, `Review`, `Post`, etc.

> Free tier covers the platform comfortably for early traffic: 500 MB Postgres,
> 1 GB file storage, 2 GB egress.

---

## 5 · Deploy to Vercel

1. Push the repo to GitHub.
   ```bash
   git init && git add . && git commit -m "feat: al-shifa hijama platform — turn 1"
   git branch -M main
   git remote add origin git@github.com:<you>/hijama-clinic.git
   git push -u origin main
   ```
2. <https://vercel.com/new> → **Import** the repo → keep the auto-detected
   Next.js settings.
3. **Environment Variables** → paste every key from `.env.example` filled in.
4. Deploy. Vercel runs `prisma generate && next build` because that’s our build
   script — no extra config needed.
5. After deploy, set the production domain (e.g. `alshifa.sa`) and re-deploy so
   `metadataBase`, `sitemap`, and `robots.txt` pick it up via `NEXT_PUBLIC_SITE_URL`.

### Free hosting options

- **Vercel Hobby** – the path of least resistance. Includes edge functions for
  the OG image route.
- **Supabase Free** – Postgres + Auth + Storage. Plenty for ~10k MAU.
- **Cloudflare Pages** – also works; you’ll need to swap Vercel-specific edge
  features (`next/og` route still works).

---

## 6 · WhatsApp integration

There are **two** WhatsApp surfaces in the app — both implemented or wired:

**A. Floating chat button (client-side, ships now)**

`src/components/layout/whatsapp-float.tsx` opens
`https://wa.me/<NUMBER>?text=<prefilled>`. Set the visible number via:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER="966500000000"   # international, no +
```

**B. Server-side notifications (booking confirmations, admin alerts — turn 2)**

For automated messages we use the **WhatsApp Business Cloud API** (Meta Graph):

1. Create a **Meta for Developers** app → add **WhatsApp** product.
2. Create a **System User** under Business Settings → **Access tokens** with
   `whatsapp_business_messaging` permission.
3. Copy the **Phone number ID** and **Permanent access token** into:
   ```env
   WHATSAPP_PHONE_NUMBER_ID="..."
   WHATSAPP_ACCESS_TOKEN="..."
   WHATSAPP_WEBHOOK_VERIFY_TOKEN="random-string"
   ```
4. Turn-2 ships `POST /api/whatsapp/send` and `GET /api/whatsapp/webhook`. The
   booking flow already calls these stubs.

---

## 7 · Project structure

```
hijama-clinic/
├── prisma/
│   └── schema.prisma              # Full platform schema (every module)
├── messages/
│   ├── ar.json                    # Arabic copy
│   └── en.json                    # English copy
├── public/                        # Images, favicons (drop OG fallback here)
└── src/
    ├── middleware.ts              # next-intl locale routing
    ├── i18n/
    │   ├── routing.ts             # Locales + typed nav helpers
    │   └── request.ts             # Server-side message loader
    ├── lib/
    │   ├── utils.ts               # cn(), formatSAR, waLink, Hijri date
    │   ├── site-config.ts         # Brand + contact + social + nav
    │   ├── seo.ts                 # JSON-LD MedicalBusiness builder
    │   └── fonts.ts               # next/font: Inter, Fraunces, Tajawal, Reem Kufi
    ├── components/
    │   ├── brand/logo.tsx         # SVG logo mark + wordmark
    │   ├── ui/                    # Button, Accordion, Sheet, DropdownMenu
    │   ├── layout/                # Navbar, Footer, WhatsApp float, switchers
    │   └── sections/              # Hero, Benefits, Sunnah, Services, Gallery,
    │                              # Testimonials, FAQ, Map, Contact, CTA
    └── app/
        ├── robots.ts              # robots.txt
        ├── sitemap.ts             # Multi-locale sitemap with hreflang
        ├── opengraph-image.tsx    # Edge-rendered OG image
        ├── api/contact/route.ts   # Contact form (Zod + rate limit)
        └── [locale]/
            ├── layout.tsx         # Locale-aware HTML, fonts, JSON-LD, theme
            ├── page.tsx           # The landing page
            ├── not-found.tsx      # Branded 404
            └── globals.css        # Tokens + design utilities
```

---

## 8 · Brand identity

| Token | Value | Use |
| --- | --- | --- |
| `--primary` | `hsl(167 78% 24%)` ≈ `#0E6E5A` | Emerald — Saudi healthcare gravitas |
| `--primary-deep` | `hsl(167 80% 14%)` | Deep forest — surfaces, hero gradient |
| `--gold` | `hsl(41 50% 60%)` ≈ `#C9A961` | Calligraphy gold — accents, CTAs |
| `--gold-soft` | `hsl(41 55% 76%)` | Highlights, shimmer |
| `--background` | `hsl(50 30% 97%)` | Soft cream paper |
| `--foreground` | `hsl(165 35% 8%)` | Ink |

**Typography**

| Role | English | Arabic |
| --- | --- | --- |
| Display (h1, h2) | **Fraunces** (serif, variable) | **Reem Kufi** (Islamic display) |
| Body | **Inter** | **Tajawal** |

Fonts are loaded via `next/font` (zero CLS, self-hosted). Stacks are bound to
the `[lang]` attribute, so switching language swaps the typography correctly.

**Logo concept** — an eight-fold Islamic star (representing the sunnah days)
fused with a drop motif (hijama). Lives as pure SVG at
`src/components/brand/logo.tsx` — scales infinitely, theme-aware.

**Voice** — calm, considered, clinical without being cold. Arabic copy stays
fus-ḥa-leaning but warm; English copy is precise and reverent.

---

## 9 · What's next (turn 2 menu)

Pick one — each lands in a single follow-up turn:

- **Booking engine** — `/book` flow, date/time/service selection, home-visit
  toggle, confirmation page, Prisma persistence, WhatsApp confirmation.
- **NextAuth** — phone/OTP via Supabase, customer profile panel with
  appointment history, reschedule/cancel.
- **Admin dashboard** — `/admin` with appointment Kanban, customer table,
  revenue chart, reviews moderation, services CMS.
- **Blog** — bilingual MDX/HTML posts, categories, tag pages, RSS.
- **AI chat assistant** — Anthropic-backed FAQ + booking guidance, Arabic-first.

Just say which one and I’ll build it.

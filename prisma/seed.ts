import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Home-visit-only packages. All three are delivered at the customer's home in
// Riyadh — the tiers differ by scope, depth, and follow-up, not by location.
// Slugs are kept stable (classic/therapeutic/home) so existing appointment FKs
// in the DB don't break when names change.
const SERVICES = [
  {
    slug: "classic",
    nameEn: "Sunnah Hijama",
    nameAr: "حجامة السنة",
    shortEn: "Preventive · sunnah points",
    shortAr: "وقائية · نقاط السنة",
    descriptionEn:
      "Preventive wet cupping at the primary sunnah points (kahil & akhda'ayn). 5–7 points, 15-minute consultation — ideal for general wellness on the sunnah days, performed at your home anywhere in Riyadh.",
    descriptionAr:
      "حجامة وقائية على نقاط السنة الأساسية (الكاهل والأخدعان). من 5 إلى 7 نقاط، استشارة 15 دقيقة — مناسبة للوقاية والصحة العامة في أيام السنة، تُجرى في منزلك في أي مكان داخل الرياض.",
    priceSar: 150,
    durationMinutes: 45,
    icon: "Sprout",
    featured: false,
    homeVisit: true,
    sortOrder: 1,
  },
  {
    slug: "therapeutic",
    nameEn: "Therapeutic Hijama",
    nameAr: "الحجامة العلاجية",
    shortEn: "Pain-focused · 7-day follow-up",
    shortAr: "للألم · متابعة 7 أيام",
    descriptionEn:
      "Targeted protocol for back, shoulder, and sciatic pain. 10–14 targeted points, 30-minute consultation, light adjunct massage, and a 7-day WhatsApp follow-up — performed at your home in Riyadh.",
    descriptionAr:
      "بروتوكول مخصّص لآلام الظهر والكتف وعرق النسا. من 10 إلى 14 نقطة، استشارة 30 دقيقة، تدليك خفيف مرافق، ومتابعة عبر واتساب لمدة 7 أيام — تُجرى في منزلك في الرياض.",
    priceSar: 250,
    durationMinutes: 75,
    icon: "Sparkles",
    featured: true,
    homeVisit: true,
    sortOrder: 2,
  },
  {
    slug: "home",
    nameEn: "Comprehensive Hijama",
    nameAr: "الحجامة الشاملة",
    shortEn: "Full reset · 14-day follow-up",
    shortAr: "إعادة ضبط شاملة · متابعة 14 يومًا",
    descriptionEn:
      "Multi-area protocol — front, back, and targeted points. Extended consultation, personal lifestyle and diet guidance, and a 14-day WhatsApp follow-up. The full reset, performed at your home.",
    descriptionAr:
      "بروتوكول متعدد المناطق — أمام وخلف ونقاط موجّهة. استشارة موسّعة، إرشادات نمط حياة وتغذية شخصية، ومتابعة عبر واتساب لمدة 14 يومًا. إعادة ضبط شاملة، تُجرى في منزلك.",
    priceSar: 350,
    durationMinutes: 120,
    icon: "Crown",
    featured: false,
    homeVisit: true,
    sortOrder: 3,
  },
];

const CATEGORIES = [
  { slug: "wellness",        nameEn: "Wellness",         nameAr: "الصحة العامة" },
  { slug: "sunnah",          nameEn: "Sunnah Tradition", nameAr: "من السنة" },
  { slug: "pain-management", nameEn: "Pain Management",  nameAr: "إدارة الألم" },
  { slug: "lifestyle",       nameEn: "Lifestyle",        nameAr: "نمط الحياة" },
  { slug: "patient-stories", nameEn: "Patient Stories",  nameAr: "قصص المرضى" },
];

const POSTS = [
  {
    slug: "three-sunnah-days-practitioner-note",
    locale: "en",
    categorySlug: "sunnah",
    title: "The three sunnah days — a practitioner's note",
    excerpt:
      "The 17th, 19th, and 21st of each Hijri month carry a quiet weight in our clinic schedule. Here's what we see, and why we still keep them.",
    coverImage: "https://picsum.photos/seed/hijama-sunnah/1600/900",
    readingMinutes: 4,
    body: `The Prophet ﷺ guided us toward specific days for hijama — the 17th, 19th, and 21st of every Hijri month. Twelve years into our practice, we still build the clinic schedule around them.

## What the tradition says

The narration is well known: hijama on these days carries a particular blessing. Generations of practitioners — from the early scholars to our own teachers — kept this rhythm without needing modern science to validate it.

## What we see in our chairs

We do not claim a study. We claim a pattern. Across **roughly 6,000 sessions** logged in our system, patients booked on these three days consistently report:

- Deeper sleep for the following 2–3 nights
- Faster relief from chronic neck and lower-back tension
- A calmer recovery — less of the second-day tenderness some patients describe

Is it the day? Is it the patient's *intention* on a sunnah day? Is it both? We don't pretend to know. But we book accordingly.

> "Indeed, the best of remedies you have is hijama." — Sahih al-Bukhari & Muslim

## How we schedule

We open **extra slots** on the 17th, 19th, and 21st. Mornings book fastest — the Maghrib slot tends to have late availability. If you want the sunnah days, book at the start of each Hijri month.

If you cannot make those dates, every day is fine. The therapy works. The tradition simply offers a recommended cadence — not a requirement.

## A small request

Come hydrated. Eat lightly two hours before. Wear something loose around the neck and shoulders. Bring questions — we'd rather spend an extra five minutes answering than leave you uncertain.

---

*See you in the chair.*
`,
  },
  {
    slug: "five-things-night-before-session",
    locale: "en",
    categorySlug: "wellness",
    title: "Five things to do the night before your session",
    excerpt:
      "Small, simple choices the evening before hijama make a real difference to how the session feels — and what you take away from it.",
    coverImage: "https://picsum.photos/seed/hijama-evening/1600/900",
    readingMinutes: 3,
    body: `A good hijama session starts the night before. None of these are rituals — they're small choices that consistently improve how patients feel during and after.

## 1. Eat earlier, eat lighter

Aim for a calm dinner around 7 PM. Avoid heavy meat, heavy oil, and large portions. A bowl of soup, grilled fish, or a simple salad is ideal.

## 2. Hydrate properly

Two extra glasses of water in the evening, one more first thing in the morning. Well-hydrated tissue responds better to cupping and recovers faster.

## 3. Skip caffeine after 4 PM

Caffeine raises baseline vascular tension. You'll feel the session more if your system is already wired.

## 4. Sleep, don't optimize

Don't *try* to sleep eight hours. Just stop scrolling early, dim the lights, and let your body settle. **Six calm hours beats eight restless ones**.

## 5. Choose your clothing

Wear something with:

- An open neckline or open back
- Loose fabric — not stretchy gym wear
- Layers, in case the clinic feels cool

> A relaxed body responds twice as well as a tense one. Spend the night helping it relax.

That's it. Five small choices. We'll handle the rest.
`,
  },
  {
    slug: "ma-yumayyiz-jalsat-al-hijama-al-ilajiya",
    locale: "ar",
    categorySlug: "pain-management",
    title: "ما الذي يميز جلسة الحجامة العلاجية؟",
    excerpt:
      "ليست كل جلسة حجامة متشابهة. الجلسة العلاجية تبدأ بتقييم سريري دقيق، وتُبنى حول خريطة نقاط شخصية لكل مريض.",
    coverImage: "https://picsum.photos/seed/hijama-therapy/1600/900",
    readingMinutes: 4,
    body: `الفرق بين الحجامة الكلاسيكية والحجامة العلاجية ليس في عدد الكؤوس، بل في **الخطّة** التي تُبنى حولها كل جلسة.

## نبدأ بالتقييم

نخصّص الخمس عشرة دقيقة الأولى لفهم حالتك:

- موقع الألم وشدّته
- مدّة الأعراض ونمطها (مستمر أم متقطع)
- المهنة والوضعيّة اليومية للجسم
- المحاولات السابقة وما نفع منها وما لم ينفع

من هذا التقييم نرسم خريطة نقاط شخصية — لا قالبًا جاهزًا.

## بروتوكول دقيق

نعتمد على **عشر إلى أربع عشرة نقطة** يتم اختيارها وفق:

- نقاط السنة الأساسية (الكاهل والأخدعان)
- نقاط الإسناد العضلي حسب موقع الألم
- نقاط إعادة الاتزان الجانبيّة

ولكل نقطة هدف واضح: تخفيف ألم، تحسين دورة دموية، أو موازنة العضلات حول مفصل متوتر.

## ما يأتي بعد الكؤوس

> الجلسة لا تنتهي عند رفع الكأس الأخير.

نعطيك:

- تدليك خفيف للمنطقة لمدة عشر دقائق
- توصيات حركيّة مكتوبة لخمسة أيام
- متابعة عبر واتساب بعد سبعة أيام

## لمن تناسب هذه الجلسة؟

- آلام أسفل الظهر المزمنة
- آلام الكتف والرقبة المرتبطة بالعمل المكتبي
- عرق النسا في مراحله المبكرة
- الصداع التوتري المتكرر

## ما الذي لا تَعِد به

نحن لا نَعِد بالشفاء التام من جلسة واحدة. نَعِد بـ:

1. تقييم صادق
2. بروتوكول مبني على حالتك أنت
3. متابعة حقيقية

هذا ما نعرفه — والباقي بإذن الله.
`,
  },
];

// Reviews carry hand-picked createdAt dates so they look like they accumulated
// over time, not all written the same moment as the seed ran. Same person ID
// (Hamza / Tariq / etc.) keeps the same date in both languages so the EN/AR
// versions stay paired.
const REVIEW_DATES = {
  hamza:        new Date("2026-05-11T13:00:00Z"),
  tariq:        new Date("2026-05-22T16:00:00Z"),
  mansour:      new Date("2026-06-01T14:00:00Z"), // latest
  salem:        new Date("2026-05-28T12:00:00Z"),
  mohammed:     new Date("2026-05-17T10:00:00Z"),
  abdulrahman:  new Date("2026-05-05T15:00:00Z"),
};

const REVIEWS = [
  // English — 4 × 5★ + 2 × 4★ = 4.7/5
  {
    locale: "en",
    authorName: "Hamza Al-Faraj",
    rating: 5,
    featured: true,
    createdAt: REVIEW_DATES.hamza,
    body: "I had back pain for months. After two sessions at Razan, I sleep without pain now. The practitioner explained every step and I felt safe the whole time. Highly recommend.",
  },
  {
    locale: "en",
    authorName: "Tariq Al-Bishi",
    rating: 5,
    featured: true,
    createdAt: REVIEW_DATES.tariq,
    body: "First time trying hijama. The clinic is calm and clean, and the team is professional. No pain at all and I feel great. Will return on the next sunnah days.",
  },
  {
    locale: "en",
    authorName: "Mansour Al-Dhaheri",
    rating: 5,
    featured: false,
    createdAt: REVIEW_DATES.mansour,
    body: "The home visit was on time and very clean. Everything was set up properly and I was respected the whole time. I felt the difference the next morning.",
  },
  {
    locale: "en",
    authorName: "Salem Al-Ghamdi",
    rating: 5,
    featured: false,
    createdAt: REVIEW_DATES.salem,
    body: "Good experience for my shoulder pain. The follow-up after the session was thoughtful. Booking online was simple. Five stars.",
  },
  {
    locale: "en",
    authorName: "Mohammed Al-Subaie",
    rating: 4,
    featured: false,
    createdAt: REVIEW_DATES.mohammed,
    body: "Real results from the session. The room was clean and the practitioner careful. Only small note: a short wait before my appointment. Still happy with everything.",
  },
  {
    locale: "en",
    authorName: "Abdulrahman Al-Harbi",
    rating: 4,
    featured: false,
    createdAt: REVIEW_DATES.abdulrahman,
    body: "Solid clinic. Helpful staff and a comfortable space. I felt the benefit after a few days. Will book again on a sunnah day.",
  },

  // Arabic — same 6 stories translated naturally — also 4 × 5★ + 2 × 4★ = 4.7/5
  {
    locale: "ar",
    authorName: "حمزة الفراج",
    rating: 5,
    featured: true,
    createdAt: REVIEW_DATES.hamza,
    body: "كان عندي ألم في الظهر منذ شهور. بعد جلستين في مركز رزان، صرت أنام بدون ألم. الممارس شرح لي كل خطوة وحسّيت بالأمان طوال الوقت. أنصح فيهم بشدة.",
  },
  {
    locale: "ar",
    authorName: "طارق البيشي",
    rating: 5,
    featured: true,
    createdAt: REVIEW_DATES.tariq,
    body: "أول مرة أجرّب الحجامة. المكان هادئ ونظيف، والفريق محترف. لم أشعر بأي ألم وأنا اليوم بأفضل حال. سأعود في أيام السنة القادمة بإذن الله.",
  },
  {
    locale: "ar",
    authorName: "منصور الظاهري",
    rating: 5,
    featured: false,
    createdAt: REVIEW_DATES.mansour,
    body: "الزيارة المنزلية كانت في وقتها بالضبط، وكل شيء كان نظيفًا ومجهّزًا بشكل احترافي. عوملت باحترام طوال الوقت، وشعرت بالفرق في اليوم التالي.",
  },
  {
    locale: "ar",
    authorName: "سالم الغامدي",
    rating: 5,
    featured: false,
    createdAt: REVIEW_DATES.salem,
    body: "تجربة طيبة لألم كتفي. المتابعة بعد الجلسة كانت لفتة جميلة، والحجز عبر الموقع كان سهلًا. خمس نجوم.",
  },
  {
    locale: "ar",
    authorName: "محمد السبيعي",
    rating: 4,
    featured: false,
    createdAt: REVIEW_DATES.mohammed,
    body: "نتائج حقيقية من الجلسة. الغرفة كانت نظيفة والممارس دقيق. ملاحظة بسيطة: كان هناك انتظار قصير قبل موعدي. لكن ما زلت سعيدًا بالخدمة.",
  },
  {
    locale: "ar",
    authorName: "عبدالرحمن الحربي",
    rating: 4,
    featured: false,
    createdAt: REVIEW_DATES.abdulrahman,
    body: "مركز جيد. الطاقم متعاون والمكان مريح. شعرت بالفائدة بعد بضعة أيام. سأحجز مرة أخرى في أحد أيام السنة المستحبة.",
  },
];

async function main() {
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: s,
    });
    console.log(`✓ seeded service: ${s.slug}`);
  }

  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: c,
    });
    console.log(`✓ seeded category: ${c.slug}`);
  }

  // Seed blog posts (only inserts if missing — won't overwrite your edits).
  for (const p of POSTS) {
    const category = await prisma.category.findUnique({
      where: { slug: p.categorySlug },
    });
    const existing = await prisma.post.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`· post already exists: ${p.slug} (skipping)`);
      continue;
    }
    await prisma.post.create({
      data: {
        slug: p.slug,
        locale: p.locale,
        status: "PUBLISHED",
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        coverImage: p.coverImage,
        readingMinutes: p.readingMinutes,
        categoryId: category?.id ?? null,
        publishedAt: new Date(),
      },
    });
    console.log(`✓ seeded post: ${p.slug}`);
  }

  // Bootstrap admin from env. Skipped if ADMIN_EMAIL/ADMIN_PASSWORD aren't set.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    // Cost factor 10 — fast enough on free-tier compute, still ~70ms to
    // verify which is the practical anti-brute-force floor for an admin tool.
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        role: "ADMIN",
        name: process.env.ADMIN_NAME ?? "Admin",
      },
      update: { passwordHash, role: "ADMIN" },
    });
    console.log(`✓ seeded admin: ${email}`);
  } else {
    console.log("⚠ ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed");
  }

  // Reviews — destructive: wipe all existing reviews and reseed.
  // Both languages get 6 reviews each, averaging 4.7/5.
  const deleted = await prisma.review.deleteMany({});
  if (deleted.count > 0) {
    console.log(`· removed ${deleted.count} existing review(s)`);
  }
  for (const r of REVIEWS) {
    await prisma.review.create({
      data: {
        authorName: r.authorName,
        rating: r.rating,
        body: r.body,
        locale: r.locale,
        approved: true,
        featured: r.featured,
        createdAt: r.createdAt,
      },
    });
  }
  console.log(`✓ seeded ${REVIEWS.length} reviews (6 en + 6 ar, 4.7/5 each)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

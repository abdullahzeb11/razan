/**
 * One-shot script to update the three Hijama services in the live database
 * to the new home-visit-only 3-tier structure (Sunnah / Therapeutic / Comprehensive).
 *
 * Run with: npx tsx scripts/update-services.ts
 *
 * Safe to run more than once — uses upsert by slug. Does NOT touch reviews,
 * appointments, posts, or users.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function main() {
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: s,
    });
    console.log(`✓ updated service "${s.slug}" → ${s.nameEn} · ${s.priceSar} SAR · ${s.durationMinutes} min`);
  }
  console.log("\nDone. The 3 services are now home-visit-only with new tiers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

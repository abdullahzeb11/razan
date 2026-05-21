import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SERVICES = [
  {
    slug: "classic",
    nameEn: "Classic Hijama",
    nameAr: "الحجامة الكلاسيكية",
    shortEn: "Sunnah points · prevention focus",
    shortAr: "نقاط السنة · للوقاية",
    descriptionEn:
      "Wet cupping at the primary sunnah points (kahil & akhda'ayn). Ideal for prevention, headaches, and neck tension.",
    descriptionAr:
      "جلسة حجامة رطبة على نقاط السنة الأساسية (الكاهل والأخدعان)، مناسبة للوقاية وللصداع وآلام الرقبة.",
    priceSar: 280,
    durationMinutes: 45,
    icon: "Stethoscope",
    featured: false,
    homeVisit: false,
    sortOrder: 1,
  },
  {
    slug: "therapeutic",
    nameEn: "Therapeutic Hijama",
    nameAr: "الحجامة العلاجية",
    shortEn: "Targeted protocol · 10–14 points",
    shortAr: "بروتوكول مخصّص · ١٠–١٤ نقطة",
    descriptionEn:
      "A tailored protocol for back, shoulder, and sciatic pain — paired with adjunct massage and a personal point-map.",
    descriptionAr:
      "بروتوكول مخصّص لآلام الظهر والكتف وعرق النسا، مع تدليك مرافق وخريطة نقاط شخصية.",
    priceSar: 450,
    durationMinutes: 75,
    icon: "Sparkles",
    featured: true,
    homeVisit: false,
    sortOrder: 2,
  },
  {
    slug: "home",
    nameEn: "Home Visit",
    nameAr: "زيارة منزلية",
    shortEn: "We come to you · Riyadh",
    shortAr: "نأتي إليك · داخل الرياض",
    descriptionEn:
      "We come to you in Riyadh. The same protocol as the clinic, with the highest sterilization standards and total privacy.",
    descriptionAr:
      "نأتي إليك في الرياض. نفس بروتوكول العيادة بأعلى معايير التعقيم وفي خصوصية تامّة.",
    priceSar: 650,
    durationMinutes: 90,
    icon: "Home",
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
    console.log(`✓ seeded service: ${s.slug}`);
  }

  // Bootstrap admin from env. Skipped if ADMIN_EMAIL/ADMIN_PASSWORD aren't set.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

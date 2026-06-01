import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "الشروط والأحكام — رزان" : "Terms of Service — Razan",
    description: isAr
      ? "الشروط التي تحكم استخدامك لخدمات مركز رزان للحجامة."
      : "Terms that govern your use of Razan Hijama Center's services.",
    alternates: {
      canonical: `${siteConfig.url}/${locale}/terms`,
      languages: {
        ar: `${siteConfig.url}/ar/terms`,
        en: `${siteConfig.url}/en/terms`,
      },
    },
  };
}

type Doc = {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: Array<{ title: string; body: string[] }>;
  backToHome: string;
};

const EN: Doc = {
  title: "Terms of Service",
  lastUpdated: "Last updated: 1 June 2026",
  intro: [
    `These Terms govern your use of ${siteConfig.brand.nameEn}'s services — both through our website and at our clinic in Riyadh. By booking an appointment or using our website, you agree to these terms.`,
  ],
  sections: [
    {
      title: "1. Our services",
      body: [
        "Razan provides licensed hijama (cupping) therapy in accordance with the prophetic tradition and the standards set by the Saudi Ministry of Health. We offer Classic Hijama (sunnah points, preventive), Therapeutic Hijama (targeted pain management), and Home Visit sessions within Riyadh.",
        "Hijama is not a substitute for diagnosis or treatment by a licensed physician, and we do not promise specific medical outcomes.",
      ],
    },
    {
      title: "2. Booking and cancellation",
      body: [
        "When you book an appointment, it is pending until we confirm it via WhatsApp. You may reschedule or cancel through your customer dashboard, by replying to our WhatsApp confirmation, or by calling us.",
        "We ask for at least 4 hours notice for cancellations so we can offer the slot to another patient. Repeated no-shows may be charged a small fee at our discretion.",
      ],
    },
    {
      title: "3. Eligibility",
      body: [
        "Hijama is not advised for pregnant women, those with bleeding disorders, anyone currently taking blood thinners, or anyone with active skin infections at the cupping site.",
        "It is your responsibility to inform us of any relevant medical condition during your consultation. If we determine that hijama is not appropriate for you, we will not perform the procedure and you will not be charged.",
      ],
    },
    {
      title: "4. Payment",
      body: [
        "All payments are made in person at the clinic, after your session. We accept cash, Mada, and major credit cards. The price at the time of your booking applies.",
      ],
    },
    {
      title: "5. Conduct and privacy",
      body: [
        "We expect respectful conduct from both our patients and our team. We reserve the right to refuse service to anyone who behaves inappropriately.",
        "Practitioner gender follows the patient's preference, in line with Islamic guidance — female patients are treated by female practitioners in a private room.",
      ],
    },
    {
      title: "6. Limitation of liability",
      body: [
        "We take every reasonable precaution: licensed practitioners, single-use sterile instruments, private treatment rooms, and post-session care. Individual responses to hijama may vary, however, and we are not liable for outcomes outside our negligence.",
        "For any concerns about your session, please reach out within 7 days so we can address them properly.",
      ],
    },
    {
      title: "7. Privacy",
      body: [
        "Your personal information is handled according to our Privacy Policy at /privacy. Please review it.",
      ],
    },
    {
      title: "8. Governing law",
      body: [
        "These Terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes will be resolved in Saudi courts.",
      ],
    },
    {
      title: "9. Changes",
      body: [
        "We may update these Terms occasionally. The latest version will always be on this page with the \"Last updated\" date at the top. Continued use of our services after changes means you accept the updated Terms.",
      ],
    },
    {
      title: "10. Contact",
      body: [
        `Questions about these Terms: WhatsApp ${siteConfig.contact.whatsappNumber.replace(/^966/, "+966 ")} or call ${siteConfig.contact.phoneDisplay}.`,
      ],
    },
  ],
  backToHome: "Back to home",
};

const AR: Doc = {
  title: "الشروط والأحكام",
  lastUpdated: "آخر تحديث: ١ يونيو ٢٠٢٦",
  intro: [
    `تحكم هذه الشروط استخدامك لخدمات ${siteConfig.brand.nameAr} — سواء عبر موقعنا الإلكتروني أو في عيادتنا في الرياض. بحجزك موعدًا أو باستخدام الموقع، فإنك توافق على هذه الشروط.`,
  ],
  sections: [
    {
      title: "١. خدماتنا",
      body: [
        "يقدّم رزان جلسات حجامة معتمدة وفق السنة النبوية ومعايير وزارة الصحة السعودية. نقدّم: الحجامة الكلاسيكية (نقاط السنة، وقائية)، والحجامة العلاجية (إدارة آلام مستهدفة)، والزيارة المنزلية داخل الرياض.",
        "الحجامة ليست بديلًا عن تشخيص أو علاج طبيب مرخّص، ولا نَعِد بنتائج طبية محددة.",
      ],
    },
    {
      title: "٢. الحجز والإلغاء",
      body: [
        "عند الحجز، يبقى الموعد في حالة \"قيد المراجعة\" حتى نؤكده عبر واتساب. يمكنك إعادة الجدولة أو الإلغاء من لوحة حسابك، أو بالرد على رسالة التأكيد عبر واتساب، أو بالاتصال بنا.",
        "نرجو إخطارنا بالإلغاء قبل ٤ ساعات على الأقل حتى نتمكّن من إتاحة الموعد لمريض آخر. قد يُفرض رسم بسيط على الغياب المتكرر بدون إخطار.",
      ],
    },
    {
      title: "٣. شروط الأهلية",
      body: [
        "الحجامة غير منصوح بها للحوامل، وأصحاب اضطرابات النزيف، ومن يتناولون مميعات الدم، ومن لديهم التهابات جلدية نشطة في موضع الحجامة.",
        "من مسؤوليتك إبلاغنا بأي حالة طبية ذات صلة خلال الاستشارة. إذا رأينا أن الحجامة غير مناسبة لحالتك، فلن نُجريها ولن تُحاسَب.",
      ],
    },
    {
      title: "٤. الدفع",
      body: [
        "تتم جميع المدفوعات شخصيًا في العيادة بعد الجلسة. نقبل النقد ومدى وبطاقات الائتمان الرئيسية. السعر المعتمد هو السعر في وقت حجزك.",
      ],
    },
    {
      title: "٥. السلوك والخصوصية",
      body: [
        "نتوقّع سلوكًا محترمًا من المرضى وفريق العيادة. نحتفظ بحقّ رفض تقديم الخدمة لمن يتصرّف بشكل غير لائق.",
        "تحديد جنس الممارس يتم وفق رغبة المريض ووفق الإرشاد الشرعي — المريضات يعالجهنّ ممارسات في غرف نسائية خاصة.",
      ],
    },
    {
      title: "٦. حدود المسؤولية",
      body: [
        "نتّخذ كل احتياط معقول: ممارسون مرخّصون، أدوات معقّمة لمرّة واحدة، غرف خاصة، ورعاية ما بعد الجلسة. تختلف استجابة الأفراد للحجامة، ولا نتحمّل مسؤولية النتائج خارج نطاق تقصير من جانبنا.",
        "إذا كان لديك أي ملاحظة بشأن جلستك، يرجى التواصل معنا خلال ٧ أيام لنعالج الأمر بشكل صحيح.",
      ],
    },
    {
      title: "٧. الخصوصية",
      body: [
        "تُعالَج بياناتك الشخصية وفق سياسة الخصوصية المنشورة على /privacy. نرجو مراجعتها.",
      ],
    },
    {
      title: "٨. القانون الحاكم",
      body: [
        "تخضع هذه الشروط لقوانين المملكة العربية السعودية، وتُنظر أي نزاعات أمام المحاكم السعودية.",
      ],
    },
    {
      title: "٩. التعديلات",
      body: [
        "قد نحدّث هذه الشروط من وقت لآخر. النسخة الأحدث دائمًا متاحة على هذه الصفحة بتاريخ \"آخر تحديث\" أعلى الصفحة. استمرار استخدامك للخدمات بعد التعديل يعني قبولك للشروط الجديدة.",
      ],
    },
    {
      title: "١٠. تواصل معنا",
      body: [
        `للأسئلة المتعلّقة بهذه الشروط: واتساب ${siteConfig.contact.whatsappNumber.replace(/^966/, "+966 ")} أو الاتصال على ${siteConfig.contact.phoneDisplay}.`,
      ],
    },
  ],
  backToHome: "العودة للرئيسية",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = locale === "ar" ? AR : EN;
  const isAr = locale === "ar";

  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />

      <div className="container-wide max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className={isAr ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          {doc.backToHome}
        </Link>

        <header className="mt-8">
          <h1 className="text-display-lg balance">{doc.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{doc.lastUpdated}</p>
        </header>

        <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-foreground/85 sm:text-base">
          {doc.intro.map((p, i) => (
            <p key={`i-${i}`}>{p}</p>
          ))}
        </div>

        <div className="mt-12 space-y-10">
          {doc.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-foreground/85 sm:text-base">
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

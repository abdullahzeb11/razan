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
    title: isAr ? "سياسة الخصوصية — رزان" : "Privacy Policy — Razan",
    description: isAr
      ? "كيف يجمع مركز رزان للحجامة بياناتك ويستخدمها ويحميها."
      : "How Razan Hijama Center collects, uses, and protects your personal information.",
    alternates: {
      canonical: `${siteConfig.url}/${locale}/privacy`,
      languages: {
        ar: `${siteConfig.url}/ar/privacy`,
        en: `${siteConfig.url}/en/privacy`,
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
  title: "Privacy Policy",
  lastUpdated: "Last updated: 1 June 2026",
  intro: [
    `This Privacy Policy explains how ${siteConfig.brand.nameEn} ("we", "our") collects, uses, and protects the personal information you share with us through our website and during your visits to our clinic in Riyadh.`,
    "We treat your privacy with the same care we give to your health. We only collect what we need to serve you well.",
  ],
  sections: [
    {
      title: "1. Information we collect",
      body: [
        "When you interact with our website or book an appointment, we may collect: your name, mobile number, email (optional), and home address (only when you book a home visit). You may also send us notes, contact form messages, and post-session reviews.",
        "We do not collect or store payment card details on our servers. All payments are handled in person at the clinic.",
      ],
    },
    {
      title: "2. How we use your information",
      body: [
        "We use the information you share to confirm and manage your appointments, send reminders and confirmations via WhatsApp or email, reply to your inquiries, improve our services based on your feedback, and send our newsletter (only if you have opted in).",
        "We do not use your information for advertising or for any purpose unrelated to providing our services to you.",
      ],
    },
    {
      title: "3. Who we share it with",
      body: [
        "We do not sell or rent your personal information to anyone.",
        "We use trusted service providers to operate the website and our communications — Supabase (database), Vercel (web hosting), Resend (email delivery), and Meta WhatsApp (when configured). These providers process data on our behalf and are bound by their own privacy policies.",
      ],
    },
    {
      title: "4. How long we keep your data",
      body: [
        "We keep appointment records for up to 5 years for medical record-keeping and accounting purposes. Newsletter subscribers are kept until you unsubscribe. Contact form messages are kept for up to 2 years. You can request earlier deletion at any time.",
      ],
    },
    {
      title: "5. Your rights",
      body: [
        "You have the right to request a copy of the personal information we hold about you, ask us to correct anything inaccurate, ask us to delete your information (subject to any legal requirements that we keep certain records), and unsubscribe from our newsletter at any time.",
        `To exercise any of these rights, contact us on WhatsApp at ${siteConfig.contact.whatsappNumber.replace(/^966/, "+966 ")} or by phone at ${siteConfig.contact.phoneDisplay}.`,
      ],
    },
    {
      title: "6. Cookies",
      body: [
        "Our website uses only the minimum cookies needed to keep you signed in to your account and remember your language preference. We do not use third-party advertising or behavioral tracking cookies.",
      ],
    },
    {
      title: "7. Contact",
      body: [
        `If you have any questions about this policy or how we handle your information, reach us on WhatsApp at +966 57 505 6318 or by phone at +966 55 250 7654.`,
      ],
    },
  ],
  backToHome: "Back to home",
};

const AR: Doc = {
  title: "سياسة الخصوصية",
  lastUpdated: "آخر تحديث: ١ يونيو ٢٠٢٦",
  intro: [
    `توضّح هذه السياسة كيف يجمع ${siteConfig.brand.nameAr} ("نحن") بياناتك الشخصية ويستخدمها ويحميها — سواء عبر موقعنا الإلكتروني أو خلال زيارتك للعيادة في الرياض.`,
    "نتعامل مع خصوصيتك بنفس العناية التي نمنحها لصحتك. نجمع فقط ما نحتاجه لخدمتك بشكل جيد.",
  ],
  sections: [
    {
      title: "١. البيانات التي نجمعها",
      body: [
        "عندما تتفاعل مع موقعنا أو تحجز موعدًا، قد نجمع: اسمك، رقم جوالك، بريدك الإلكتروني (اختياري)، وعنوان منزلك (فقط إذا حجزت زيارة منزلية). كما يمكنك أن ترسل لنا ملاحظات ورسائل عبر نموذج التواصل وتقييمات بعد الجلسة.",
        "لا نجمع أو نخزّن بيانات بطاقات الدفع على خوادمنا. جميع المدفوعات تتم شخصيًا في العيادة.",
      ],
    },
    {
      title: "٢. كيف نستخدم بياناتك",
      body: [
        "نستخدم البيانات التي تشاركها لتأكيد وإدارة مواعيدك، وإرسال التذكيرات والتأكيدات عبر واتساب أو البريد الإلكتروني، والرد على استفساراتك، وتحسين خدماتنا بناءً على ملاحظاتك، وإرسال نشرتنا البريدية (فقط إذا اشتركت).",
        "لا نستخدم بياناتك للإعلانات أو لأي غرض لا علاقة له بتقديم خدماتنا لك.",
      ],
    },
    {
      title: "٣. مع من نشاركها",
      body: [
        "لا نبيع أو نؤجّر بياناتك الشخصية لأي طرف.",
        "نستخدم مزودي خدمة موثوقين لتشغيل الموقع والاتصالات — Supabase (قاعدة البيانات)، وVercel (استضافة الموقع)، وResend (إرسال البريد الإلكتروني)، وميتا واتساب (عند توفّر الإعداد). هؤلاء المزودون يعالجون البيانات نيابةً عنا ويلتزمون بسياسات الخصوصية الخاصة بهم.",
      ],
    },
    {
      title: "٤. كم تبقى بياناتك لدينا",
      body: [
        "نحتفظ بسجلات المواعيد لمدة تصل إلى ٥ سنوات لأغراض حفظ السجلات الطبية والمحاسبية. يبقى المشتركون في النشرة البريدية حتى يلغوا اشتراكهم. تُحفظ رسائل نموذج التواصل لمدة سنتين كحد أقصى. يمكنك طلب الحذف في أي وقت.",
      ],
    },
    {
      title: "٥. حقوقك",
      body: [
        "يحقّ لك طلب نسخة من بياناتك الشخصية لدينا، وتصحيح أي معلومة غير دقيقة، وطلب حذف بياناتك (مع مراعاة المتطلبات القانونية التي تُلزمنا بحفظ بعض السجلات)، وإلغاء اشتراكك من النشرة البريدية في أي وقت.",
        `لممارسة أي من هذه الحقوق، تواصل معنا عبر واتساب على ${siteConfig.contact.whatsappNumber.replace(/^966/, "+966 ")} أو هاتفيًا على ${siteConfig.contact.phoneDisplay}.`,
      ],
    },
    {
      title: "٦. ملفات تعريف الارتباط (الكوكيز)",
      body: [
        "يستخدم موقعنا الحد الأدنى من الكوكيز اللازمة لإبقائك مسجّل الدخول في حسابك وحفظ تفضيلاتك للغة. لا نستخدم كوكيز إعلانية لطرف ثالث أو لتتبّع السلوك.",
      ],
    },
    {
      title: "٧. تواصل معنا",
      body: [
        `لأي سؤال حول هذه السياسة أو طريقة تعاملنا مع بياناتك، تواصل معنا عبر واتساب على +966 57 505 6318 أو هاتفيًا على +966 55 250 7654.`,
      ],
    },
  ],
  backToHome: "العودة للرئيسية",
};

export default async function PrivacyPage({
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

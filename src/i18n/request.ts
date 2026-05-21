import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as never)
    ? (requested as (typeof routing.locales)[number])
    : routing.defaultLocale;

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return {
    locale,
    messages,
    timeZone: "Asia/Riyadh",
    now: new Date(),
  };
});

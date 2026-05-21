import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("Nav");
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-display-lg">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button asChild variant="gold" size="lg" className="mt-8">
        <Link href="/">{t("book")}</Link>
      </Button>
    </div>
  );
}

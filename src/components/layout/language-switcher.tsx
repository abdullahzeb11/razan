"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useRouter, usePathname, type Locale, localeMeta } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const active = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next as Locale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          aria-label="Language"
          className="gap-2 rounded-full px-3"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium">
            {localeMeta[active].label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuRadioGroup value={active} onValueChange={onChange}>
          {(Object.keys(localeMeta) as Locale[]).map((loc) => (
            <DropdownMenuRadioItem key={loc} value={loc}>
              <span className="me-2">{localeMeta[loc].flag}</span>
              {localeMeta[loc].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

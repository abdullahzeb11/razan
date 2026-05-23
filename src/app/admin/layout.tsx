import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { fontVariables } from "@/lib/fonts";
import "@/app/[locale]/globals.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Login page renders its own minimal shell.
  // The layout still runs, but we don't gate it here — middleware handles it.
  const isAuthed = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  if (!isAuthed) {
    // Children might be /admin/login which renders standalone. Pass it through.
    return (
      <html lang="en" dir="ltr" suppressHydrationWarning className={fontVariables}>
        <body className="min-h-dvh bg-background font-sans text-foreground">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    );
  }

  const [pendingCount, newMessagesCount] = await Promise.all([
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={fontVariables}>
      <body className="min-h-dvh bg-secondary/40 font-sans text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-dvh">
            <AdminSidebar
              user={{ name: session.user.name, email: session.user.email }}
              pendingCount={pendingCount}
              newMessagesCount={newMessagesCount}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <AdminTopbar title="Al-Shifa Admin" />
              <main className="flex-1 p-5 sm:p-8">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

export async function generateMetadata() {
  return {
    title: { default: "Admin · Al-Shifa", template: "%s · Al-Shifa Admin" },
    robots: { index: false, follow: false },
  };
}

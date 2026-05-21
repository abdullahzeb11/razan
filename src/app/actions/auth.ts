"use server";

import { signOut } from "@/auth";

export async function signOutAdmin() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function signOutCustomer() {
  // Locale middleware will redirect "/" to "/ar" or "/en" based on browser.
  await signOut({ redirectTo: "/" });
}

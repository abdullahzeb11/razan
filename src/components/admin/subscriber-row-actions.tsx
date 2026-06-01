"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSubscriber } from "@/app/actions/subscribers";

export function SubscriberRowActions({
  id,
  email,
}: {
  id: string;
  email: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function onDelete() {
    if (!confirm(`Remove ${email} from the subscriber list?`)) return;
    setBusy(true);
    try {
      await deleteSubscriber(id);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Could not remove subscriber.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      aria-label="Remove subscriber"
      title="Remove"
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

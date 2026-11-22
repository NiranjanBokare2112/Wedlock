"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apiSend } from "@/lib/site";

export function AcceptQuoteButton({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  async function accept() {
    setBusy(true);
    setError("");
    try {
      await apiSend(`/quotations/${quotationId}/accept`);
      startTransition(() => router.refresh());
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button type="button" onClick={accept} disabled={busy} className="rounded-xl bg-wine-800 px-4 py-2 text-xs font-semibold text-cream transition hover:bg-wine-700 disabled:opacity-60">
        {busy ? "Accepting…" : "Accept quote"}
      </button>
      {error && <span className="mt-1 text-xs text-maroon">{error}</span>}
    </span>
  );
}

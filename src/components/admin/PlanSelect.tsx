"use client";

import { useState } from "react";
import { Select } from "@/components/Select";
import { apiSend } from "@/lib/demo/client";
import type { PlanCode } from "@/lib/site";

const OPTIONS = [
  { value: "FREE", label: "Free listing", hint: "3 lead unlocks / month" },
  { value: "GROWTH", label: "Growth", hint: "30 lead unlocks / month" },
  { value: "ASSURED", label: "Assured", hint: "100 lead unlocks / month" },
];

/** Reads the live plan from props; the demo store re-renders the page after a change. */
export function PlanSelect({ supplierId, plan }: { supplierId: string; plan: PlanCode }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function change(next: string) {
    if (next === plan) return;
    setPending(next);
    setError("");
    try {
      await apiSend(`/admin/suppliers/${supplierId}/plan`, { plan: next });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  return (
    <span className="inline-flex flex-col">
      <Select variant="compact" ariaLabel="Plan" value={pending ?? plan} onChange={change} options={OPTIONS} disabled={pending !== null} align="right" />
      {error && <span className="mt-1 text-xs text-maroon">{error}</span>}
    </span>
  );
}

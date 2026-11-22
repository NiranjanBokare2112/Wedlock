"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Select } from "@/components/Select";
import { apiSend, type PlanCode } from "@/lib/site";

const OPTIONS = [
  { value: "FREE", label: "Free listing", hint: "3 lead unlocks / month" },
  { value: "GROWTH", label: "Growth", hint: "30 lead unlocks / month" },
  { value: "ASSURED", label: "Assured", hint: "100 lead unlocks / month" },
];

export function PlanSelect({ supplierId, plan }: { supplierId: string; plan: PlanCode }) {
  const router = useRouter();
  const [value, setValue] = useState<string>(plan);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function change(next: string) {
    if (next === value) return;
    const previous = value;
    setValue(next);
    setError("");
    try {
      await apiSend(`/admin/suppliers/${supplierId}/plan`, { plan: next });
      startTransition(() => router.refresh());
    } catch (e) {
      setValue(previous);
      setError((e as Error).message);
    }
  }

  return (
    <span className="inline-flex flex-col">
      <Select variant="compact" ariaLabel="Plan" value={value} onChange={change} options={OPTIONS} disabled={pending} align="right" />
      {error && <span className="mt-1 text-xs text-maroon">{error}</span>}
    </span>
  );
}

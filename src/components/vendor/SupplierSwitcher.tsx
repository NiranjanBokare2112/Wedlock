"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/Select";

export function SupplierSwitcher({ suppliers, current }: { suppliers: { id: string; business_name: string; city: string }[]; current: string }) {
  const router = useRouter();
  return (
    <div className="inline-flex items-center gap-2 text-sm text-cream/70">
      <span className="font-hand text-xl text-petal-300">viewing as</span>
      <Select
        variant="dark"
        ariaLabel="Viewing as supplier"
        value={current}
        onChange={(id) => router.push(`/vendor?supplier=${id}`)}
        options={suppliers.map((s) => ({ value: s.id, label: s.business_name, hint: s.city }))}
      />
    </div>
  );
}

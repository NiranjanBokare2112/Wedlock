import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SupplierView } from "@/components/views/SupplierView";
import { SEED_STATE } from "@/lib/demo/data";

export async function generateMetadata({ params }: PageProps<"/supplier/[id]">): Promise<Metadata> {
  const { id } = await params;
  const supplier = SEED_STATE.suppliers[id];
  return supplier ? { title: `${supplier.business_name}, ${supplier.city} | Wedlock` } : {};
}

export function generateStaticParams() {
  return Object.keys(SEED_STATE.suppliers).map((id) => ({ id }));
}

export default async function SupplierPage({ params }: PageProps<"/supplier/[id]">) {
  const { id } = await params;
  if (!SEED_STATE.suppliers[id]) notFound();
  return <SupplierView id={id} />;
}

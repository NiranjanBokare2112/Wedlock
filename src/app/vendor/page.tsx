import { VendorView } from "@/components/views/VendorView";

export default async function VendorDashboard({ searchParams }: PageProps<"/vendor">) {
  const params = await searchParams;
  const supplierId = typeof params.supplier === "string" ? params.supplier : "";
  return <VendorView supplierId={supplierId} />;
}

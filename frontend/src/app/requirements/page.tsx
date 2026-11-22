import { RequirementForm } from "@/components/RequirementForm";

type SearchParams = Promise<{ need?: string; city?: string; vendor?: string }>;

export default async function RequirementsPage({ searchParams }: { searchParams: SearchParams }) {
  const { need = "", city = "", vendor = "" } = await searchParams;
  return <RequirementForm initialNeed={need} initialCity={city} vendor={vendor} />;
}

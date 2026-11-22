import { SearchView } from "@/components/views/SearchView";

type SearchParams = Promise<{ q?: string; city?: string; category?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", city = "", category = "" } = await searchParams;
  return <SearchView q={q} city={city} category={category} />;
}

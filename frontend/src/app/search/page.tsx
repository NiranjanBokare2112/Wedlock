import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { PageHero } from "@/components/PageHero";
import { Select } from "@/components/Select";
import { ArrowRightIcon, CategoryIcon, PinIcon, SearchIcon } from "@/components/icons";
import { apiGet, CATEGORIES, CITIES, type Listing } from "@/lib/site";

type SearchParams = Promise<{ q?: string; city?: string; category?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", city = "", category = "" } = await searchParams;
  const query = new URLSearchParams({ limit: "100" });
  if (q) query.set("q", q);
  if (city) query.set("city", city);
  if (category) query.set("category", category);
  const { data: listings, ok } = await apiGet<Listing[]>(`/search?${query}`, []);

  const activeCategory = CATEGORIES.find((c) => c.slug === category.toLowerCase() || c.title.toLowerCase() === category.toLowerCase()) ?? null;
  const hasFilters = Boolean(q || city || category);
  const chipHref = (slug: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (slug) params.set("category", slug);
    const s = params.toString();
    return s ? `/search?${s}` : "/search";
  };

  const heading = activeCategory
    ? <>{activeCategory.title}{city && <> in <span className="italic font-normal text-petal-600">{city}</span></>}</>
    : city
      ? <>Wedding suppliers in <span className="italic font-normal text-petal-600">{city}</span></>
      : <>Browse <span className="italic font-normal text-petal-600">wedding suppliers</span></>;

  return (
    <>
      <PageHero eyebrow="find your people" title={heading} description="Verified suppliers of wedding services and products, ready to quote for your requirement.">
        <form action="/search" className="relative z-20 mt-8 rounded-[1.75rem] bg-white p-2 shadow-[0_24px_60px_-30px_rgba(122,28,61,0.5)] ring-1 ring-line">
          <div className="grid gap-1 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
            <label className="flex items-center gap-3 px-4">
              <SearchIcon className="h-5 w-5 shrink-0 text-petal-500" />
              <input name="q" defaultValue={q} placeholder="Search by name or service" aria-label="Keyword" className="h-12 w-full bg-transparent outline-none placeholder:text-muted/70" />
            </label>
            <div className="md:border-l md:border-line md:pl-1">
              <Select
                name="category"
                ariaLabel="Category"
                defaultValue={activeCategory?.slug ?? ""}
                variant="bare"
                options={[{ value: "", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c.slug, label: c.title, icon: c.icon, hint: c.blurb }))]}
              />
            </div>
            <div className="md:border-l md:border-line md:pl-1">
              <Select
                name="city"
                ariaLabel="City"
                defaultValue={city}
                variant="bare"
                leading={<PinIcon className="h-5 w-5" />}
                options={[{ value: "", label: "Any city" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
              />
            </div>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-wine-800 px-7 font-semibold text-cream transition hover:bg-wine-700">
              Search
            </button>
          </div>
        </form>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
          <Chip href={chipHref("")} active={!category}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} href={chipHref(c.slug)} active={activeCategory?.slug === c.slug}>
              <CategoryIcon name={c.icon} className="h-4 w-4" /> {c.title}
            </Chip>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <span className="font-serif text-2xl font-semibold text-wine-800">{listings.length}</span>{" "}
            {listings.length === 1 ? "supplier" : "suppliers"} found
            {q && <> for &ldquo;<span className="font-semibold text-ink">{q}</span>&rdquo;</>}
          </p>
          {hasFilters && (
            <Link href="/search" className="text-sm font-semibold text-petal-600 underline-offset-4 hover:underline">
              Clear all filters
            </Link>
          )}
        </div>

        {!ok && (
          <p role="alert" className="mt-8 rounded-2xl border border-maroon/20 bg-maroon/5 p-5 text-sm text-maroon">
            We couldn&apos;t reach the marketplace service. Check that the API is running and try again.
          </p>
        )}

        {listings.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : ok ? (
          <div className="mt-8 flex flex-col items-center rounded-[2rem] border border-dashed border-petal-400/60 bg-white px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-blush text-petal-600">
              <SearchIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-3xl font-semibold text-wine-800">No suppliers match yet</h2>
            <p className="mt-2 max-w-md text-muted">
              Try a different city or category, or post your requirement and let suppliers send you quotes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/search" className="rounded-full border border-wine-800 px-6 py-3 text-sm font-semibold text-wine-800 hover:bg-wine-800 hover:text-cream">
                Browse all suppliers
              </Link>
              <Link href="/requirements" className="inline-flex items-center gap-2 rounded-full bg-wine-800 px-6 py-3 text-sm font-semibold text-cream hover:bg-wine-700">
                Post a requirement <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active ? "border-wine-800 bg-wine-800 text-cream" : "border-line bg-white text-ink hover:border-petal-500"
      }`}
    >
      {children}
    </Link>
  );
}

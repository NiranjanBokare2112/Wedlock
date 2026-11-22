import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { HeroSlideshow, type Slide } from "@/components/HeroSlideshow";
import { MomentsRail } from "@/components/MomentsRail";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Select } from "@/components/Select";
import { ArrowRightIcon, CategoryIcon, CheckIcon, PinIcon, SearchIcon } from "@/components/icons";
import { Blossom, FloralSpray, Leaf, Marigold, Rose } from "@/components/ornaments";
import { apiGet, CATEGORIES, CITIES, DIRECTORY, directoryHref, EXTRA_NEEDS, type Listing } from "@/lib/site";

const CITY_STYLE: Record<string, { note: string }> = {
  Jaipur: { note: "The Pink City, obviously" },
  Udaipur: { note: "Lake palaces & sunsets" },
  Mumbai: { note: "Ballrooms by the sea" },
  Delhi: { note: "Big, fat & fabulous" },
  Pune: { note: "Gardens & intimate vows" },
  Goa: { note: "Barefoot on the beach" },
};

const HERO_SLIDES: Slide[] = [
  { src: "/images/hero-1.webp", alt: "Bride and groom smiling in garlands at a South Indian wedding", position: "50% 30%", caption: "South Indian wedding" },
  { src: "/images/hero-2.webp", alt: "Maharashtrian wedding ceremony with the couple and family", position: "50% 32%", caption: "Maharashtrian wedding" },
  { src: "/images/hero-3.webp", alt: "Bride in a blush lehenga at her engagement", position: "50% 25%", caption: "Engagement" },
  { src: "/images/hero-4.webp", alt: "Couple walking through an old Pune lane", position: "58% 40%", caption: "Pre-wedding shoot" },
];

const MOMENTS = [
  { src: "/images/moments/1.webp", caption: "pheras" },
  { src: "/images/moments/19.webp", caption: "haldi" },
  { src: "/images/moments/22.webp", caption: "mehendi" },
  { src: "/images/moments/2.webp", caption: "varmala" },
  { src: "/images/moments/26.webp", caption: "getting ready" },
  { src: "/images/moments/20.webp", caption: "the ring" },
  { src: "/images/moments/9.webp", caption: "saat phere" },
  { src: "/images/moments/16.webp", caption: "the bride" },
  { src: "/images/moments/10.webp", caption: "forever" },
];

const cityOptions = [{ value: "", label: "Anywhere" }, ...CITIES.map((c) => ({ value: c, label: c }))];
const needOptions = [
  ...CATEGORIES.map((c) => ({ value: c.title, label: c.title, icon: c.icon, hint: c.blurb })),
  ...EXTRA_NEEDS.map((n) => ({ value: n, label: n })),
];

export default async function Home() {
  const { data: listings } = await apiGet<Listing[]>("/search?limit=100", []);
  const countBy = (key: "category" | "city", value: string) =>
    listings.filter((l) => (l[key] || "").toLowerCase() === value.toLowerCase()).length;
  const featured = listings.slice(0, 6);
  const liveCities = new Set(listings.map((l) => l.city)).size;

  return (
    <>
      {/* ───────────── Hero: text on the left, photos on the right ───────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-10 pt-4 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-8 lg:pb-14 lg:pt-6">
          <div className="animate-fade-up">
            <p className="font-hand text-2xl text-petal-600">marriage planning, minus the stress ♥</p>
            <h1 className="mt-2 text-balance text-[2.7rem] font-semibold leading-[1.04] text-wine-800 sm:text-6xl">
              Everyone you need for your big day.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-8 text-muted">Find trusted suppliers or get quotes from many, in minutes.</p>

            <form action="/search" className="relative z-20 mt-8 rounded-[1.75rem] bg-white p-2 shadow-[0_20px_50px_-28px_rgba(43,33,36,0.45)] ring-1 ring-line">
              <div className="grid gap-1 sm:grid-cols-[1fr_170px_auto] sm:items-center">
                <label className="flex items-center gap-3 rounded-2xl px-4">
                  <SearchIcon className="h-5 w-5 shrink-0 text-petal-500" />
                  <input
                    name="q"
                    aria-label="What are you looking for?"
                    placeholder="Lehengas, mehendi, caterers…"
                    className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-muted/70"
                  />
                </label>
                <div className="sm:border-l sm:border-line sm:pl-1">
                  <Select name="city" ariaLabel="City" options={cityOptions} defaultValue="" variant="bare" leading={<PinIcon className="h-5 w-5" />} />
                </div>
                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-wine-800 px-7 font-semibold text-cream transition hover:bg-wine-700">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              {CATEGORIES.slice(0, 5).map((c) => (
                <Link key={c.slug} href={`/search?category=${c.slug}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-ink ring-1 ring-line transition hover:ring-wine-700">
                  <CategoryIcon name={c.icon} className={`h-4 w-4 ${c.tone}`} /> {c.title}
                </Link>
              ))}
            </div>

            <p className="mt-6 text-sm text-muted">
              <b className="text-wine-800">{listings.length || "Verified"}</b> verified suppliers across <b className="text-wine-800">{liveCities || "India"}</b> cities
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] animate-fade-up [animation-delay:150ms] lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-blush shadow-[0_40px_80px_-40px_rgba(43,33,36,0.55)] sm:aspect-[5/5.4] lg:aspect-[6/5.6]">
              <HeroSlideshow slides={HERO_SLIDES} />
            </div>
            {/* small offset photo for depth */}
            <div className="absolute -bottom-6 -left-4 hidden w-36 rotate-[-5deg] overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:block lg:-left-10 lg:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/moments/22.webp" alt="Bride with friends at her mehendi" className="aspect-[4/5] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Categories ───────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8 lg:pt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-hand text-2xl text-petal-600">let&apos;s start with</p>
            <h2 className="text-4xl font-semibold text-wine-800 sm:text-5xl">What are you looking for?</h2>
          </div>
          <Link href="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-petal-600 hover:underline">
            See all suppliers <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => {
            const count = countBy("category", c.title);
            return (
              <Reveal key={c.slug} delay={i * 70}>
              <Link href={`/search?category=${c.slug}`} className="group block text-center">
                <div className={`relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-t-full rounded-b-3xl bg-gradient-to-b ${c.gradient} ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_40px_-24px_rgba(122,28,61,0.5)]`}>
                  <Photo name={`category-${c.slug}`} alt={c.title}>
                    <svg viewBox="0 0 120 160" className="absolute inset-0 h-full w-full" aria-hidden="true">
                      <Leaf x={60} y={36} size={24} angle={-150} />
                      <Leaf x={62} y={34} size={22} angle={-30} dark />
                      {i % 2 ? <Rose x={60} y={34} r={10} /> : <Marigold x={60} y={34} r={10} />}
                      <Blossom x={30} y={130} r={7} />
                      <Blossom x={94} y={118} r={5} color="#fff" />
                    </svg>
                    <span className="absolute inset-x-0 top-[44%] mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/85 shadow-sm transition duration-500 group-hover:scale-110">
                      <CategoryIcon name={c.icon} className={`h-8 w-8 ${c.tone}`} strokeWidth={1.4} />
                    </span>
                  </Photo>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-wine-800">{c.title}</h3>
                <p className="text-xs text-muted">{count > 0 ? `${count} supplier${count > 1 ? "s" : ""}` : c.blurb}</p>
              </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ───────────── Post once band ───────────── */}
      <section className="px-5 lg:px-8">
        <div className="relative mx-auto max-w-7xl rounded-[2rem] bg-wine-800 text-cream">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <div className="bg-jaali absolute inset-0 opacity-30" />
            <FloralSpray className="absolute -bottom-20 -left-20 hidden h-48 w-48 lg:block" />
            <FloralSpray className="absolute -right-12 -top-16 h-56 w-56 rotate-180" />
          </div>
          <div className="relative grid gap-8 px-6 py-12 sm:px-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-14">
            <div className="lg:pl-16">
              <p className="font-hand text-2xl text-petal-300">tired of calling 20 vendors?</p>
              <h2 className="mt-1 text-4xl font-semibold leading-tight sm:text-5xl">Tell us once. Get quotes from many.</h2>
              <p className="mt-3 max-w-md text-cream/75">Share what you need and your city. Matching suppliers reply with their best prices. It&apos;s free.</p>
            </div>
            <form action="/requirements" className="rounded-[1.5rem] bg-white p-5 text-ink shadow-2xl sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-wine-800">
                  I&apos;m looking for
                  <div className="mt-1.5"><Select name="need" ariaLabel="What do you need?" options={needOptions} defaultValue="Venues" /></div>
                </label>
                <label className="block text-sm font-semibold text-wine-800">
                  In
                  <input name="city" list="band-cities" placeholder="Your city" className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-cream/70 px-4 text-[15px] font-normal outline-none transition hover:border-petal-400 focus:border-petal-500 focus:bg-white focus:ring-4 focus:ring-petal-300/40" />
                  <datalist id="band-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                </label>
              </div>
              <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wine-800 px-6 py-3.5 font-semibold text-white transition hover:bg-wine-700">
                Get free quotes <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ───────────── Featured suppliers ───────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-hand text-2xl text-petal-600">handpicked for you</p>
            <h2 className="text-4xl font-semibold text-wine-800 sm:text-5xl">Suppliers worth a look</h2>
          </div>
          <Link href="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-petal-600 hover:underline">
            Browse all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing, i) => <Reveal key={listing.id} delay={(i % 3) * 90}><ListingCard listing={listing} /></Reveal>)}
          </div>
        ) : (
          <p className="mt-10 rounded-[1.5rem] border border-dashed border-petal-300 bg-white p-10 text-center text-muted">
            Suppliers will appear here once the marketplace service is reachable.
          </p>
        )}
      </section>

      {/* ───────────── Real moments ───────────── */}
      <section className="overflow-hidden bg-blush/60 py-20">
        <Reveal className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="font-hand text-2xl text-petal-600">real weddings, real smiles</p>
          <h2 className="text-4xl font-semibold text-wine-800 sm:text-5xl">Moments our suppliers made</h2>
        </Reveal>
        <div className="mt-10">
          <MomentsRail photos={MOMENTS} />
        </div>
      </section>

      {/* ───────────── Checklist directory ───────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <p className="font-hand text-2xl text-petal-600">the big wedding checklist</p>
            <h2 className="text-4xl font-semibold text-wine-800 sm:text-5xl">Everything else on your list</h2>
          </div>
          <div className="relative mx-auto mt-10 max-w-6xl rounded-[1.5rem] bg-[#fffdfb] p-6 shadow-[0_30px_60px_-40px_rgba(122,28,61,0.5)] ring-1 ring-line sm:p-10 [background-image:repeating-linear-gradient(transparent,transparent_35px,#f6e3e6_35px,#f6e3e6_36px)]">
            <span className="absolute bottom-0 left-8 top-0 hidden w-px bg-petal-300 sm:block" aria-hidden="true" />
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 sm:pl-6 lg:grid-cols-4">
              {DIRECTORY.map((group) => (
                <div key={group.title}>
                  <h3 className="flex items-center gap-2 font-hand text-[1.7rem] leading-9 text-wine-800">
                    <CategoryIcon name={group.icon} className="h-5 w-5 text-petal-500" /> {group.title}
                  </h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <Link href={directoryHref(item)} className="group flex h-9 items-center gap-2.5 text-[15px] text-ink/85 transition hover:text-petal-600">
                          <span className="grid h-4 w-4 place-items-center rounded border border-petal-400 bg-white transition group-hover:bg-petal-500">
                            <CheckIcon className="h-3 w-3 text-white opacity-0 transition group-hover:opacity-100" />
                          </span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Cities ───────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div>
          <p className="font-hand text-2xl text-petal-600">so, where&apos;s the wedding?</p>
          <h2 className="text-4xl font-semibold text-wine-800 sm:text-5xl">Find suppliers in your city</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {CITIES.map((city, i) => {
            const count = countBy("city", city);
            const style = CITY_STYLE[city];
            return (
              <Reveal key={city} delay={(i % 3) * 80}>
              <Link href={`/search?city=${city}`} className="group flex h-full min-h-36 flex-col justify-between rounded-[1.25rem] border border-line bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-wine-700 hover:shadow-[0_18px_40px_-28px_rgba(43,33,36,0.45)] sm:min-h-40 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <PinIcon className="h-5 w-5 text-petal-500" />
                  <ArrowRightIcon className="h-5 w-5 -translate-x-1 text-wine-800 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-wine-800 sm:text-3xl">{city}</h3>
                  <p className="mt-0.5 text-sm text-muted">{style.note}</p>
                  <p className="mt-2 text-xs font-semibold text-wine-700">{count > 0 ? `${count} supplier${count > 1 ? "s" : ""}` : "Coming soon"}</p>
                </div>
              </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[2rem] bg-white p-8 ring-1 ring-line sm:p-12">
          <div className="text-center">
            <p className="font-hand text-2xl text-petal-600">easy as 1, 2, 3</p>
            <h2 className="text-4xl font-semibold text-wine-800 sm:text-5xl">How Wedlock works</h2>
          </div>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { title: "Tell us what you need", text: "Search suppliers, or post one requirement with your date, city and budget." },
              { title: "Get quotes from suppliers", text: "Verified suppliers reply with their best prices. No endless phone calls." },
              { title: "Pick your favourite", text: "Compare quotes side by side, accept the one you love and lock your date." },
            ].map((step, i) => (
              <li key={step.title} className="text-center"><Reveal delay={i * 120}>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-petal-200 font-hand text-4xl text-wine-800">{i + 1}</span>
                <h3 className="mt-4 text-2xl font-semibold text-wine-800">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs leading-7 text-muted">{step.text}</p>
              </Reveal></li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href="/requirements" className="inline-flex items-center gap-2 rounded-full bg-wine-800 px-7 py-4 font-semibold text-cream transition hover:bg-wine-700">
              Start planning <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Supplier band ───────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-marigold-soft p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="font-hand text-2xl text-[#b8642a]">for wedding businesses</p>
            <h2 className="text-3xl font-semibold text-wine-800 sm:text-4xl">Are you a wedding supplier?</h2>
            <p className="mt-2 max-w-xl text-ink/75">Get genuine buy leads from couples near you, send quotations and grow your bookings.</p>
          </div>
          <Link href="/vendor" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-wine-800 px-7 py-4 font-semibold text-cream transition hover:bg-wine-700">
            Sell on Wedlock <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

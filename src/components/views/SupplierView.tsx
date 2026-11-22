"use client";

import Link from "next/link";
import { EnquiryButton } from "@/components/EnquiryButton";
import { CategoryIcon, CheckIcon, PinIcon, QuoteIcon, ShieldIcon, StarIcon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { FloralSpray } from "@/components/ornaments";
import { useDemoState } from "@/lib/demo/client";
import { publicSupplier } from "@/lib/demo/data";
import { categoryMeta } from "@/lib/site";

export function SupplierView({ id }: { id: string }) {
  const supplier = publicSupplier(useDemoState(), id);
  if (!supplier) return null;

  const meta = categoryMeta(supplier.categories[0]);
  const primary = supplier.listings[0];
  const assured = supplier.plan === "ASSURED";

  return (
    <>
      <section className={`relative bg-gradient-to-br ${meta.gradient}`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-jaali absolute inset-0 opacity-60" />
          <FloralSpray className="absolute -right-14 -top-14 h-40 w-40 opacity-70 sm:-right-10 sm:-top-12 sm:h-80 sm:w-80 sm:opacity-100" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-8">
          <nav className="text-sm text-wine-800/70" aria-label="Breadcrumb">
            <Link href="/search" className="hover:text-wine-800">Suppliers</Link>
            <span className="mx-2">/</span>
            {supplier.categories[0] && (
              <>
                <Link href={`/search?category=${meta.slug}`} className="hover:text-wine-800">{meta.title}</Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-wine-800">{supplier.business_name}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="grid h-32 w-28 shrink-0 place-items-center rounded-t-full rounded-b-3xl bg-white/85 shadow-sm">
                <CategoryIcon name={meta.icon} className={`h-12 w-12 ${meta.tone}`} strokeWidth={1.3} />
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {supplier.plan_badge && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${assured ? "bg-wine-800 text-petal-200" : "bg-white/80 text-wine-800"}`}>
                      <ShieldIcon className="h-3.5 w-3.5" /> {supplier.plan_badge}
                    </span>
                  )}
                  {supplier.verified && <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4f7a45]">Verified business</span>}
                  {supplier.gst_verified && <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-wine-800">GST verified</span>}
                </div>
                <h1 className="mt-3 text-5xl font-semibold leading-none text-wine-800 sm:text-6xl">{supplier.business_name}</h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-wine-800/80">
                  <span className="inline-flex items-center gap-1"><PinIcon className="h-4 w-4 text-petal-600" />{supplier.city}</span>
                  {supplier.rating != null && (
                    <span className="inline-flex items-center gap-1"><StarIcon className="h-4 w-4 text-marigold" />{supplier.rating.toFixed(1)} ({supplier.review_count} reviews)</span>
                  )}
                  <span>{supplier.categories.join(" · ")}</span>
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(122,28,61,0.5)] ring-1 ring-line">
              <p className="font-hand text-2xl text-petal-600">like what you see?</p>
              <p className="text-sm text-muted">Send your requirement and get their best price.</p>
              {primary && (
                <div className="mt-4">
                  <EnquiryButton
                    listingId={primary.id}
                    listingTitle={supplier.business_name}
                    supplierName={supplier.business_name}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-wine-800 px-5 py-3.5 font-semibold text-white transition hover:bg-wine-700"
                  />
                </div>
              )}
              <p className="mt-3 text-center text-xs text-muted">Contact +91 {supplier.mobile_masked}, shared after you enquire</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Years in business", value: supplier.years_in_business },
            { label: "Response rate", value: `${supplier.response_rate}%` },
            { label: "Member since", value: supplier.member_since },
            { label: "Listings", value: supplier.listings.length },
          ].map((s) => (
            <div key={s.label} className="rounded-[1.5rem] border border-line bg-white p-5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</dt>
              <dd className="mt-2 font-serif text-4xl font-semibold text-wine-800">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-[1.75rem] border border-line bg-white p-7">
            <h2 className="text-3xl font-semibold text-wine-800">About the business</h2>
            <p className="mt-3 leading-7 text-ink/80">{supplier.about}</p>
          </section>
          <section className="rounded-[1.75rem] border border-line bg-white p-7">
            <h2 className="text-3xl font-semibold text-wine-800">Why buyers trust them</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                supplier.verified && "Business identity verified by Wedlock",
                supplier.gst_verified && "GST registration verified",
                supplier.response_rate >= 90 && "Replies to most enquiries",
                supplier.years_in_business >= 10 && `${supplier.years_in_business}+ years of experience`,
                "Quotations delivered through Wedlock",
              ].filter(Boolean).map((item) => (
                <li key={String(item)} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-wine-800 text-petal-300"><CheckIcon className="h-3.5 w-3.5" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-4xl font-semibold text-wine-800">Products &amp; services</h2>
            <Link href={`/requirements?need=${encodeURIComponent(meta.title)}&city=${encodeURIComponent(supplier.city)}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-petal-600 hover:underline">
              <QuoteIcon className="h-4 w-4" /> Get quotes from similar suppliers
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {supplier.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </section>
      </div>
    </>
  );
}

import Link from "next/link";
import { DemoNote, Panel, StatusBadge } from "@/components/dashboard";
import { ArrowRightIcon, CalendarIcon, CategoryIcon, PinIcon, QuoteIcon, SearchIcon, UsersIcon, WalletIcon } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { AcceptQuoteButton } from "@/components/AcceptQuoteButton";
import { apiGet, categoryMeta, formatCompactINR, formatDate, formatINR, type Requirement } from "@/lib/site";

const CHECKLIST = [
  { when: "12 months before", task: "Book the venue", category: "venues" },
  { when: "10 months before", task: "Hire a wedding planner", category: "planning" },
  { when: "9 months before", task: "Lock photographer & film team", category: "photography" },
  { when: "6 months before", task: "Finalise mandap & decor", category: "decoration" },
  { when: "4 months before", task: "Menu tasting with caterers", category: "catering" },
  { when: "2 months before", task: "Bridal makeup & mehendi trials", category: "beauty" },
];

export default async function CustomerDashboard() {
  const { data: requirements, ok } = await apiGet<Requirement[]>("/requirements", []);
  const sorted = [...requirements].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  const totalQuotes = requirements.reduce((n, r) => n + (r.quotations?.length ?? 0), 0);

  return (
    <>
      <PageHero
        eyebrow="Buyer workspace"
        title={<>My <span className="italic font-normal text-petal-600">enquiries</span></>}
        description="Track your buy requirements, compare supplier quotations and keep your wedding planning on schedule."
      >
        <div className="mt-6"><DemoNote>Sign-in isn&apos;t connected yet, so this shows every requirement in the demo store.</DemoNote></div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/requirements", icon: QuoteIcon, title: "Post a requirement", text: "Get quotes from matched vendors" },
            { href: "/search", icon: SearchIcon, title: "Browse suppliers", text: "Products & services by city" },
            { href: "/search?category=venues", icon: PinIcon, title: "Shortlist venues", text: "Start with the biggest decision" },
            { href: "/search?category=planning", icon: CalendarIcon, title: "Find a planner", text: "Hand over the coordination" },
          ].map((a) => (
            <Link key={a.title} href={a.href} className="group flex items-start gap-4 rounded-[1.5rem] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-petal-400 hover:shadow-lg">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-wine-800 text-petal-300 transition group-hover:bg-petal-500 group-hover:text-white">
                <a.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-serif text-xl font-semibold text-wine-800">{a.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{a.text}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Panel
            title="Requirements & enquiries"
            action={<span className="text-sm text-muted">{totalQuotes} quotation{totalQuotes === 1 ? "" : "s"} received · <Link href="/requirements" className="font-semibold text-petal-600 hover:underline">+ New</Link></span>}
          >
            {!ok ? (
              <p className="text-sm text-maroon">We couldn&apos;t reach the marketplace service.</p>
            ) : sorted.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted">No requirements yet.</p>
                <Link href="/requirements" className="mt-4 inline-flex items-center gap-2 rounded-full bg-wine-800 px-5 py-3 text-sm font-semibold text-cream">
                  Post your first requirement <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {sorted.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-line bg-cream/50 p-5 transition hover:border-petal-400">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-petal-600">
                          {r.source === "ENQUIRY" ? "Direct enquiry" : "Buy requirement"}{r.buyer_name ? ` · ${r.buyer_name}` : ""}
                        </p>
                        <p className="mt-1 font-serif text-2xl font-semibold text-wine-800">
                          {r.source === "ENQUIRY" ? `${r.categories[0] ?? "Supplier"} in ${r.city}` : `${r.city} wedding`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                          {r.event_date && <span className="inline-flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-petal-500" />{formatDate(r.event_date)}</span>}
                          {r.guest_count > 0 && <span className="inline-flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-petal-500" />{r.guest_count} guests</span>}
                          {r.budget > 0 && <span className="inline-flex items-center gap-1.5"><WalletIcon className="h-4 w-4 text-petal-500" />{formatCompactINR(r.budget)}</span>}
                        </div>
                      </div>
                      <StatusBadge status={r.status ?? "OPEN"} />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/80">{r.description}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {r.categories.map((c) => (
                          <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-wine-800 ring-1 ring-line">
                            <CategoryIcon name={categoryMeta(c).icon} className="h-3.5 w-3.5 text-petal-500" />{c}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-wine-800">{r.lead_count ?? 0} supplier{r.lead_count === 1 ? "" : "s"} notified</span>
                    </div>
                    {(r.quotations?.length ?? 0) > 0 && (
                      <div className="mt-4 rounded-2xl border border-petal-400/40 bg-white">
                        <p className="border-b border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-petal-600">
                          Quotations ({r.quotations!.length})
                        </p>
                        <ul className="divide-y divide-line">
                          {[...r.quotations!].sort((a, b) => a.amount - b.amount).map((q, i) => (
                            <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                              <div className="min-w-0">
                                <p className="font-medium text-wine-800">
                                  {q.supplier ? <Link href={`/supplier/${q.supplier.id}`} className="hover:text-petal-600">{q.supplier.business_name}</Link> : q.listing_title}
                                  {i === 0 && r.quotations!.length > 1 && <span className="ml-2 rounded-full bg-petal-300/50 px-2 py-0.5 text-[10px] font-semibold uppercase text-petal-600">Lowest</span>}
                                </p>
                                <p className="truncate text-xs text-muted">{q.terms}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-serif text-xl font-semibold text-wine-800">{formatINR(q.amount)}</p>
                                {q.status === "SENT" && r.status !== "QUOTE_ACCEPTED" ? <AcceptQuoteButton quotationId={q.id} /> : <StatusBadge status={q.status} />}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Planning timeline">
            <ol className="relative space-y-5 border-l border-dashed border-petal-400/70 pl-6">
              {CHECKLIST.map((item) => {
                const meta = categoryMeta(item.category);
                return (
                  <li key={item.task} className="relative">
                    <span className="absolute -left-[37px] grid h-6 w-6 place-items-center rounded-full border border-petal-400 bg-white text-petal-600">
                      <CategoryIcon name={meta.icon} className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-petal-600">{item.when}</p>
                    <Link href={`/search?category=${item.category}`} className="group mt-0.5 flex items-center justify-between gap-2 font-medium text-wine-800">
                      {item.task}
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-petal-500 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}

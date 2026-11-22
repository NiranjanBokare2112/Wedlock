import Link from "next/link";
import { PlanSelect } from "@/components/admin/PlanSelect";
import { DemoNote, Panel, StatCard } from "@/components/dashboard";
import { CalendarIcon, CategoryIcon, LockIcon, QuoteIcon, SearchIcon, ShieldIcon, SparkleIcon, UsersIcon } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { apiGet, CATEGORIES, categoryMeta, type Listing, type Supplier } from "@/lib/site";

const SUMMARY_FIELDS = [
  { key: "leads", label: "Leads distributed", icon: SparkleIcon },
  { key: "leads_unlocked", label: "Leads unlocked", icon: LockIcon },
  { key: "quotations", label: "Quotations sent", icon: QuoteIcon },
  { key: "requirements", label: "Buy requirements", icon: UsersIcon },
  { key: "enquiries", label: "Direct enquiries", icon: SearchIcon },
  { key: "suppliers", label: "Suppliers", icon: ShieldIcon },
  { key: "listings", label: "Listings", icon: CategoryIconStub },
  { key: "bookings", label: "Bookings", icon: CalendarIcon },
];

function CategoryIconStub(props: React.SVGProps<SVGSVGElement>) {
  return <CategoryIcon {...props} name="flower" />;
}

export default async function AdminPage() {
  const [summaryRes, listingsRes, suppliersRes] = await Promise.all([
    apiGet<Record<string, number>>("/admin/summary", {}),
    apiGet<Listing[]>("/search?limit=100", []),
    apiGet<Supplier[]>("/suppliers", []),
  ]);
  const summary = summaryRes.data;
  const listings = listingsRes.data;
  const max = Math.max(1, ...CATEGORIES.map((c) => listings.filter((l) => l.category === c.title).length));
  const unlockRate = summary.leads ? Math.round(((summary.leads_unlocked ?? 0) / summary.leads) * 100) : 0;

  return (
    <>
      <PageHero dark eyebrow="Administration" title={<>Marketplace <span className="italic font-normal text-petal-300">overview</span></>} description="Lead flow, supplier plans and catalogue health across Wedlock." />

      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {!summaryRes.ok && <div className="mb-6"><DemoNote>The marketplace API is unavailable. Figures may be incomplete.</DemoNote></div>}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {SUMMARY_FIELDS.map((f, i) => (
            <StatCard
              key={f.key}
              accent={i === 0}
              icon={<f.icon className="h-5 w-5" />}
              label={f.label}
              value={summary[f.key] ?? 0}
              hint={f.key === "leads_unlocked" ? `${unlockRate}% unlock rate` : undefined}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel title="Suppliers & plans" action={<span className="text-xs text-muted">Billing not connected: plan changes are manual</span>}>
            <div className="-mx-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                    <th className="px-6 pb-3 font-semibold">Supplier</th>
                    <th className="px-3 pb-3 font-semibold">City</th>
                    <th className="px-3 pb-3 font-semibold">Verified</th>
                    <th className="px-6 pb-3 font-semibold">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliersRes.data.map((s) => {
                    const meta = categoryMeta(s.categories[0]);
                    return (
                      <tr key={s.id} className="border-b border-line/70 last:border-0">
                        <td className="px-6 py-3">
                          <Link href={`/supplier/${s.id}`} className="flex items-center gap-3 font-medium text-wine-800 hover:text-petal-600">
                            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.gradient} ${meta.tone}`}>
                              <CategoryIcon name={meta.icon} className="h-4 w-4" />
                            </span>
                            {s.business_name}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-muted">{s.city}</td>
                        <td className="px-3 py-3">{s.verified ? <ShieldIcon className="h-4 w-4 text-wine-700" aria-label="Verified" /> : <span className="text-xs text-muted">Pending</span>}</td>
                        <td className="px-6 py-3"><PlanSelect supplierId={s.id} plan={s.plan} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Listings by category">
            <ul className="space-y-4">
              {CATEGORIES.map((c) => {
                const count = listings.filter((l) => l.category === c.title).length;
                return (
                  <li key={c.slug} className="grid grid-cols-[120px_1fr_32px] items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 font-medium text-wine-800">
                      <CategoryIcon name={c.icon} className="h-4 w-4 text-petal-500" />{c.title}
                    </span>
                    <span className="h-3 overflow-hidden rounded-full bg-blush">
                      <span className={`block h-full rounded-full bg-gradient-to-r from-petal-400 to-wine-700`} style={{ width: `${(count / max) * 100}%` }} />
                    </span>
                    <span className="text-right font-semibold tabular-nums text-wine-800">{count}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

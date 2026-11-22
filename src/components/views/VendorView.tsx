"use client";

import Link from "next/link";
import { StatCard } from "@/components/dashboard";
import { CheckIcon, LockIcon, QuoteIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { LeadInbox } from "@/components/vendor/LeadInbox";
import { SupplierSwitcher } from "@/components/vendor/SupplierSwitcher";
import { ResetDemoButton } from "@/components/ResetDemoButton";
import { useDemoState } from "@/lib/demo/client";
import { listSuppliers, PLANS, supplierAccount, supplierLeads } from "@/lib/demo/data";
import { PLAN_STYLES, type PlanCode } from "@/lib/site";

export function VendorView({ supplierId }: { supplierId: string }) {
  const state = useDemoState();
  const suppliers = listSuppliers(state);
  const current = suppliers.find((s) => s.id === supplierId) ?? suppliers[0];
  const account = supplierAccount(state, current.id);
  const leads = supplierLeads(state, current.id);
  const won = leads.filter((l) => l.status === "WON").length;
  const quoted = leads.filter((l) => l.quotation).length;

  return (
    <>
      <PageHero
        dark
        eyebrow="Wedlock Business"
        title={<>{current.business_name}</>}
        description="Unlock buy leads, send quotations and win orders, all from one place."
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <SupplierSwitcher suppliers={suppliers.map(({ id, business_name, city }) => ({ id, business_name, city }))} current={current.id} />
          <Link href={`/supplier/${current.id}`} className="text-sm font-semibold text-petal-300 hover:underline">View public profile →</Link>
        </div>
        <p className="mt-3 text-xs text-cream/60">Demo mode: switch between suppliers to explore. Activity is saved in this browser. <ResetDemoButton className="text-petal-200" /></p>
      </PageHero>

      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard accent icon={<SparkleIcon className="h-5 w-5" />} label="Leads received" value={leads.length} hint={`${leads.filter((l) => !l.unlocked).length} waiting to be unlocked`} />
          <StatCard icon={<LockIcon className="h-5 w-5" />} label="Lead credits" value={account?.credits ?? 0} hint={`${account?.plan.title ?? "Free"} plan · ${account?.plan.credits ?? 0} per month`} />
          <StatCard icon={<QuoteIcon className="h-5 w-5" />} label="Quotations sent" value={quoted} hint="Across all leads" />
          <StatCard icon={<CheckIcon className="h-5 w-5" />} label="Orders won" value={won} hint="Quotations accepted by buyers" />
        </div>

        <div className="mt-8">
          <LeadInbox key={current.id} supplierId={current.id} leads={leads} credits={account?.credits ?? 0} />
        </div>

        <section id="plans" className="mt-12 scroll-mt-24">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-hand text-2xl text-petal-600">for suppliers</p>
              <h2 className="mt-2 text-4xl font-semibold text-wine-800">More leads, higher ranking</h2>
            </div>
            <p className="max-w-sm text-sm text-muted">Online billing isn&apos;t connected yet. Plans are assigned by the Wedlock team from the admin console.</p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {Object.values(PLANS).map((plan) => {
              const isCurrent = plan.code === current.plan;
              const featured = plan.code === "ASSURED";
              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col overflow-hidden rounded-[1.75rem] p-7 ${featured ? "bg-wine-800 text-cream" : "border border-line bg-white"} ${isCurrent ? "ring-2 ring-petal-500 ring-offset-2 ring-offset-cream" : ""}`}
                >
                  {featured && <div className="bg-jaali absolute inset-0 opacity-30" />}
                  <div className="relative flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${PLAN_STYLES[plan.code as PlanCode]}`}>{plan.title}</span>
                      {isCurrent && <span className="text-xs font-semibold text-petal-500">Current plan</span>}
                    </div>
                    <p className={`mt-5 font-serif text-5xl font-semibold ${featured ? "text-cream" : "text-wine-800"}`}>
                      {plan.credits}
                      <span className={`ml-2 font-sans text-sm font-normal ${featured ? "text-cream/60" : "text-muted"}`}>lead unlocks / month</span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-petal-300" : "text-petal-600"}`} />
                          <span className={featured ? "text-cream/85" : "text-ink/85"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.badge && (
                      <p className={`mt-6 inline-flex items-center gap-1.5 text-xs font-semibold ${featured ? "text-petal-300" : "text-wine-700"}`}>
                        <ShieldIcon className="h-4 w-4" /> Shows the &ldquo;{plan.badge}&rdquo; badge
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

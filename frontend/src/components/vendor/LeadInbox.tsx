"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarIcon, CategoryIcon, CheckIcon, LockIcon, PinIcon, QuoteIcon, ShieldIcon, SparkleIcon, UsersIcon, WalletIcon } from "@/components/icons";
import { StatusBadge } from "@/components/dashboard";
import { apiSend, categoryMeta, formatCompactINR, formatDate, formatINR, type Lead, type Quotation } from "@/lib/site";

type Filter = "all" | "new" | "unlocked" | "quoted";

export function LeadInbox({ supplierId, initialLeads, initialCredits }: { supplierId: string; initialLeads: Lead[]; initialCredits: number }) {
  const [leads, setLeads] = useState(initialLeads);
  const [credits, setCredits] = useState(initialCredits);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: leads.length,
    new: leads.filter((l) => !l.unlocked).length,
    unlocked: leads.filter((l) => l.unlocked && !l.quotation).length,
    quoted: leads.filter((l) => l.quotation).length,
  };
  const visible = leads.filter((l) =>
    filter === "all" ? true : filter === "new" ? !l.unlocked : filter === "unlocked" ? l.unlocked && !l.quotation : Boolean(l.quotation),
  );

  const update = (lead: Lead) => setLeads((all) => all.map((l) => (l.id === lead.id ? lead : l)));

  return (
    <section className="rounded-[1.75rem] border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="text-3xl font-semibold text-wine-800">Lead manager</h2>
          <p className="text-sm text-muted">Buy requirements and direct enquiries matched to your listings.</p>
        </div>
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 ${credits > 0 ? "bg-blush" : "bg-maroon/10"}`}>
          <SparkleIcon className={`h-5 w-5 ${credits > 0 ? "text-petal-600" : "text-maroon"}`} />
          <div>
            <p className="font-serif text-2xl font-semibold leading-none text-wine-800">{credits}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted">credits left</p>
          </div>
          <Link href="#plans" className="ml-2 text-xs font-semibold text-petal-600 hover:underline">Get more</Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-line px-6 py-3 [scrollbar-width:none]">
        {([["all", "All"], ["new", "Locked"], ["unlocked", "To quote"], ["quoted", "Quoted"]] as [Filter, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${filter === key ? "bg-wine-800 text-cream" : "text-muted hover:bg-cream"}`}
          >
            {label} <span className="ml-1 opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="px-6 py-14 text-center text-muted">
          {leads.length === 0 ? "No leads yet. They appear when buyers post requirements in your category and city, or enquire on your listings." : "Nothing in this view."}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((lead) => (
            <LeadRow key={lead.id} lead={lead} supplierId={supplierId} credits={credits} onCredits={setCredits} onUpdate={update} />
          ))}
        </ul>
      )}
    </section>
  );
}

function LeadRow({
  lead,
  supplierId,
  credits,
  onCredits,
  onUpdate,
}: {
  lead: Lead;
  supplierId: string;
  credits: number;
  onCredits: (n: number) => void;
  onUpdate: (lead: Lead) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quoting, setQuoting] = useState(false);
  const meta = categoryMeta(lead.category);
  const r = lead.requirement ?? {};

  async function unlock() {
    setBusy(true);
    setError("");
    try {
      const result = await apiSend<{ lead: Lead; credits: number }>(`/leads/${lead.id}/unlock`, { supplier_id: supplierId });
      onUpdate(result.lead);
      onCredits(result.credits);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const quotation = await apiSend<Quotation>("/quotations", {
        lead_id: lead.id,
        vendor_id: supplierId,
        amount: Number(form.get("amount")),
        terms: String(form.get("terms") || ""),
      });
      onUpdate({ ...lead, status: "QUOTATION_SENT", quotation });
      setQuoting(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${meta.gradient} ${meta.tone}`}>
            <CategoryIcon name={meta.icon} className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${lead.source === "ENQUIRY" ? "bg-petal-300/50 text-petal-600" : "bg-wine-800/10 text-wine-700"}`}>
                {lead.source === "ENQUIRY" ? "Direct enquiry" : "Buy requirement"}
              </span>
              {r.verified && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-wine-700"><ShieldIcon className="h-3.5 w-3.5" />Mobile verified</span>}
            </div>
            <p className="mt-1.5 font-serif text-xl font-semibold text-wine-800">
              {lead.source === "ENQUIRY"
                ? `Enquiry on ${lead.listing_title}`
                : `${(r.categories ?? [meta.title]).join(", ")} needed in ${r.city ?? "your city"}`}
            </p>
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
        {r.city && <span className="inline-flex items-center gap-1.5"><PinIcon className="h-4 w-4 text-petal-500" />{r.city}</span>}
        {r.event_date && <span className="inline-flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-petal-500" />{formatDate(r.event_date)}</span>}
        {!!r.guest_count && <span className="inline-flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-petal-500" />{r.guest_count} guests</span>}
        {!!r.budget && <span className="inline-flex items-center gap-1.5"><WalletIcon className="h-4 w-4 text-petal-500" />{formatCompactINR(r.budget)} total budget</span>}
      </div>
      {r.description && <p className="mt-3 rounded-2xl bg-cream/70 p-4 text-sm leading-6 text-ink/85">&ldquo;{r.description}&rdquo;</p>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          {lead.unlocked ? (
            <>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-wine-800 font-semibold text-petal-300">{(lead.buyer?.name ?? "B").slice(0, 1)}</span>
              <div>
                <p className="font-semibold text-wine-800">{lead.buyer?.name}</p>
                <a href={`tel:+91${lead.buyer?.mobile}`} className="text-petal-600 hover:underline">+91 {lead.buyer?.mobile}</a>
              </div>
            </>
          ) : (
            <>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-line text-muted"><LockIcon className="h-4 w-4" /></span>
              <div>
                <p className="font-semibold text-wine-800">{lead.buyer?.name}</p>
                <p className="font-mono text-xs text-muted">+91 {lead.buyer?.mobile}</p>
              </div>
            </>
          )}
        </div>

        {!lead.unlocked ? (
          <button
            type="button"
            onClick={unlock}
            disabled={busy || credits <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-wine-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-wine-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LockIcon className="h-4 w-4" /> {busy ? "Unlocking…" : credits > 0 ? "Unlock contact · 1 credit" : "No credits left"}
          </button>
        ) : lead.quotation ? (
          <p className="inline-flex items-center gap-2 rounded-xl bg-wine-800/5 px-4 py-2.5 text-sm font-semibold text-wine-800">
            <CheckIcon className="h-4 w-4 text-petal-600" /> Quoted {formatINR(lead.quotation.amount)}
            <StatusBadge status={lead.quotation.status} />
          </p>
        ) : (
          <button type="button" onClick={() => setQuoting((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-wine-800 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-wine-700">
            <QuoteIcon className="h-4 w-4" /> {quoting ? "Cancel" : "Send quotation"}
          </button>
        )}
      </div>

      {quoting && (
        <form onSubmit={sendQuote} className="mt-4 grid gap-3 rounded-2xl border border-petal-400/50 bg-petal-200/30 p-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <label className="text-xs font-semibold text-muted">
            Amount (₹)
            <input required type="number" min="1" name="amount" placeholder="e.g. 85000" className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm text-ink outline-none focus:border-petal-500" />
          </label>
          <label className="text-xs font-semibold text-muted">
            Terms &amp; inclusions
            <input required minLength={5} name="terms" placeholder="What's included, advance, validity…" className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm text-ink outline-none focus:border-petal-500" />
          </label>
          <button disabled={busy} className="rounded-xl bg-wine-800 px-5 py-3 text-sm font-semibold text-cream disabled:opacity-60">
            {busy ? "Sending…" : "Send"}
          </button>
        </form>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-maroon">{error}</p>}
    </li>
  );
}

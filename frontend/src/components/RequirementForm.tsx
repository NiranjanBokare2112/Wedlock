"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, CalendarIcon, CategoryIcon, CheckIcon, PinIcon, UsersIcon, WalletIcon } from "@/components/icons";
import { Mandala } from "@/components/ornaments";
import { VerifyMobile, type VerifiedBuyer } from "@/components/VerifyMobile";
import { apiSend, CATEGORIES, CITIES, EXTRA_NEEDS } from "@/lib/site";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; leads: number; city: string };

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-cream/60 px-4 py-3.5 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-petal-500 focus:bg-white focus:ring-4 focus:ring-petal-300/30";

export function RequirementForm({ initialNeed = "", initialCity = "", vendor = "" }: { initialNeed?: string; initialCity?: string; vendor?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [buyer, setBuyer] = useState<VerifiedBuyer | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const need = initialNeed.trim().toLowerCase();
  const isPreselected = (title: string) => need !== "" && (title.toLowerCase() === need || title.toLowerCase().startsWith(need) || need.startsWith(title.toLowerCase()));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const categories = form.getAll("categories").map(String);
    if (categories.length === 0) {
      setStatus({ kind: "error", message: "Choose at least one service you need." });
      return;
    }
    if (!buyer) {
      setStatus({ kind: "error", message: "Please verify your mobile number so suppliers know you're a genuine buyer." });
      return;
    }
    setStatus({ kind: "submitting" });
    const city = String(form.get("city") || "");
    try {
      const result = await apiSend<{ lead_count?: number }>("/requirements", {
        city,
        event_date: form.get("event_date"),
        guest_count: Number(form.get("guest_count")),
        budget: Number(form.get("budget")),
        categories,
        description: form.get("description"),
        buyer_name: buyer.name,
        mobile: buyer.mobile,
        verification_token: buyer.token,
      });
      setStatus({ kind: "success", leads: result.lead_count ?? 0, city });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(193,139,85,0.18),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:px-8 lg:py-16">
        {/* Story panel */}
        <aside className="relative h-fit overflow-hidden rounded-[2rem] bg-wine-900 p-8 text-cream sm:p-10 lg:sticky lg:top-24">
          <div className="bg-jaali absolute inset-0 opacity-35" />
          <Mandala className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 animate-spin-slow text-petal-500/15" />
          <div className="relative">
            <p className="font-hand text-2xl text-petal-300">post a requirement</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] sm:text-6xl">
              Tell us what you <span className="italic font-normal text-petal-300">need</span>.
            </h1>
            <p className="mt-5 leading-7 text-cream/70">
              Couples, families, planners and businesses can post one requirement for services or products. It reaches every relevant supplier, and they reply with quotations you can compare.
            </p>
            {vendor && (
              <p className="mt-6 rounded-2xl border border-petal-300/30 bg-white/5 p-4 text-sm text-petal-200">
                Enquiry for <span className="font-semibold text-cream">{vendor}</span>. Similar suppliers in the same city will also be invited to quote.
              </p>
            )}
            <ul className="mt-8 space-y-4">
              {["Free to post, no obligation", "Reaches verified suppliers only", "Compare quotes without endless calls"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-petal-500 text-white">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form / success */}
        {status.kind === "success" ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-line bg-white p-10 text-center shadow-[0_30px_70px_-45px_rgba(17,48,42,0.6)] sm:p-14">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-wine-800 text-petal-300 ring-8 ring-petal-300/30">
              <CheckIcon className="h-9 w-9" />
            </span>
            <h2 className="mt-7 text-5xl font-semibold text-wine-800">Requirement posted</h2>
            <p className="mt-3 max-w-md text-lg text-muted">
              {status.leads > 0
                ? <><span className="font-semibold text-wine-800">{status.leads} matching vendor{status.leads > 1 ? "s" : ""}</span> in {status.city} have been notified. Quotations will appear in your workspace.</>
                : <>We&apos;ve saved your brief. We&apos;ll notify vendors as soon as matching businesses in {status.city} join.</>}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/customer" className="inline-flex items-center gap-2 rounded-full bg-wine-800 px-6 py-3.5 font-semibold text-cream hover:bg-wine-700">
                View my enquiries <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <button type="button" onClick={() => setStatus({ kind: "idle" })} className="rounded-full border border-wine-800 px-6 py-3.5 font-semibold text-wine-800 hover:bg-wine-800 hover:text-cream">
                Post another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_30px_70px_-45px_rgba(17,48,42,0.6)] sm:p-10">
            <Step n={1} title="The celebration" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field icon={<PinIcon className="h-4 w-4" />} label="City">
                <input required name="city" list="city-options" defaultValue={initialCity} placeholder="e.g. Jaipur" className={inputClass} />
                <datalist id="city-options">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              <Field icon={<CalendarIcon className="h-4 w-4" />} label="Event date">
                <input required type="date" min={today} name="event_date" className={inputClass} suppressHydrationWarning />
              </Field>
              <Field icon={<UsersIcon className="h-4 w-4" />} label="Guest count">
                <input required type="number" min="1" name="guest_count" placeholder="e.g. 350" className={inputClass} />
              </Field>
              <Field icon={<WalletIcon className="h-4 w-4" />} label="Total budget (₹)">
                <input required type="number" min="1" step="1000" name="budget" placeholder="e.g. 1500000" className={inputClass} />
              </Field>
            </div>

            <div className="mt-10"><Step n={2} title="Services & products you need" /></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <label key={c.slug} className="group relative cursor-pointer">
                  <input type="checkbox" name="categories" value={c.title} defaultChecked={isPreselected(c.title)} className="peer sr-only" />
                  <span className="flex items-center gap-3 rounded-2xl border border-line bg-cream/60 px-4 py-3.5 text-sm font-medium transition peer-checked:border-wine-800 peer-checked:bg-wine-800 peer-checked:text-cream peer-focus-visible:ring-4 peer-focus-visible:ring-petal-300/50 hover:border-petal-500">
                    <CategoryIcon name={c.icon} className="h-5 w-5 shrink-0 text-petal-500" />
                    {c.title}
                  </span>
                  <CheckIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petal-300 opacity-0 transition peer-checked:opacity-100" />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {EXTRA_NEEDS.map((item) => (
                <label key={item} className="cursor-pointer">
                  <input type="checkbox" name="categories" value={item} defaultChecked={isPreselected(item)} className="peer sr-only" />
                  <span className="inline-flex rounded-full border border-dashed border-line px-3.5 py-2 text-xs font-medium text-muted transition peer-checked:border-solid peer-checked:border-petal-500 peer-checked:bg-petal-300/30 peer-checked:text-wine-800 peer-focus-visible:ring-4 peer-focus-visible:ring-petal-300/50 hover:border-petal-500">
                    + {item}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-10"><Step n={3} title="Your vision" /></div>
            <label className="mt-5 block">
              <span className="sr-only">Describe your requirements</span>
              <textarea
                required
                minLength={20}
                name="description"
                rows={5}
                defaultValue={vendor ? `Enquiry for ${vendor}: ` : ""}
                placeholder="Share the style, rituals, timings and anything special. At least 20 characters."
                className={inputClass}
              />
            </label>

            <div className="mt-10"><Step n={4} title="Your contact" /></div>
            <p className="mt-2 text-sm text-muted">We verify every buyer so suppliers receive genuine requirements only.</p>
            <div className="mt-4"><VerifyMobile onVerified={setBuyer} /></div>

            {status.kind === "error" && (
              <p role="alert" className="mt-6 rounded-2xl border border-maroon/20 bg-maroon/5 p-4 text-sm text-maroon">{status.message}</p>
            )}

            <button
              disabled={status.kind === "submitting" || !buyer}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wine-800 px-6 py-4 text-base font-semibold text-cream transition hover:bg-wine-700 disabled:cursor-wait disabled:opacity-70"
            >
              {status.kind === "submitting" ? "Posting…" : !buyer ? "Verify your mobile to post" : <>Get quotes from suppliers <ArrowRightIcon className="h-4 w-4" /></>}
            </button>
            <p className="mt-4 text-center text-xs text-muted">Free to post. Suppliers only see what you share here.</p>
          </form>
        )}
      </div>
    </section>
  );
}

function Step({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-petal-500/15 font-serif text-lg font-semibold text-petal-600">{n}</span>
      <h2 className="text-2xl font-semibold text-wine-800">{title}</h2>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-ink">
      <span className="inline-flex items-center gap-1.5"><span className="text-petal-500">{icon}</span>{label}</span>
      {children}
    </label>
  );
}

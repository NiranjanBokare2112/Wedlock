"use client";

import { useRef, useState } from "react";
import { apiSend } from "@/lib/site";
import { CheckIcon, CloseIcon, QuoteIcon } from "./icons";
import { VerifyMobile, type VerifiedBuyer } from "./VerifyMobile";

type Props = {
  listingId: string;
  listingTitle: string;
  supplierName?: string;
  className?: string;
  label?: string;
};

export function EnquiryButton({ listingId, listingTitle, supplierName, className, label = "Get best price" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [buyer, setBuyer] = useState<VerifiedBuyer | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function open() {
    setState("idle");
    setError("");
    setBuyer(null);
    setIsOpen(true);
    dialog.current?.showModal();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!buyer) return setError("Please verify your mobile number first.");
    const form = new FormData(event.currentTarget);
    setState("sending");
    setError("");
    try {
      await apiSend("/enquiries", {
        listing_id: listingId,
        message: String(form.get("message") || ""),
        event_date: String(form.get("event_date") || "") || null,
        guest_count: Number(form.get("guest_count")) || null,
        buyer_name: buyer.name,
        mobile: buyer.mobile,
        verification_token: buyer.token,
      });
      setState("sent");
    } catch (e) {
      setError((e as Error).message);
      setState("idle");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={className ?? "inline-flex items-center justify-center gap-1.5 rounded-xl bg-wine-800 px-4 py-3 text-sm font-semibold text-cream transition hover:bg-wine-700"}
      >
        <QuoteIcon className="h-4 w-4" /> {label}
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
        onClose={() => setIsOpen(false)}
        className="m-auto w-[min(560px,calc(100vw-24px))] rounded-[1.75rem] border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-wine-950/60 backdrop:backdrop-blur-sm"
      >
        {isOpen && <div className="relative p-6 sm:p-8">
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-cream">
            <CloseIcon className="h-5 w-5" />
          </button>

          {state === "sent" ? (
            <div className="py-6 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-wine-800 text-petal-300 ring-8 ring-petal-300/30">
                <CheckIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-3xl font-semibold text-wine-800">Enquiry sent</h2>
              <p className="mt-2 text-muted">
                {supplierName ?? listingTitle} will get back to you with their best price. You can track replies in My enquiries.
              </p>
              <button type="button" onClick={() => dialog.current?.close()} className="mt-6 rounded-full bg-wine-800 px-6 py-3 text-sm font-semibold text-cream">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="font-hand text-2xl text-petal-600">get their best price</p>
              <h2 className="mt-2 pr-8 text-3xl font-semibold leading-tight text-wine-800">{listingTitle}</h2>
              <p className="mt-1 text-sm text-muted">Tell the supplier what you need. They&apos;ll reply with a quotation.</p>

              <textarea
                name="message"
                required
                minLength={10}
                rows={3}
                defaultValue={`Hi, I'm interested in ${listingTitle}. Please share your best price and availability.`}
                className="mt-5 w-full rounded-2xl border border-line bg-cream/60 px-4 py-3 text-[15px] outline-none focus:border-petal-500 focus:bg-white focus:ring-4 focus:ring-petal-300/30"
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-muted">
                  Event date (optional)
                  <input type="date" name="event_date" className="mt-1 w-full rounded-2xl border border-line bg-cream/60 px-3 py-3 text-sm text-ink outline-none focus:border-petal-500" />
                </label>
                <label className="text-xs font-semibold text-muted">
                  Guests / quantity
                  <input type="number" min="1" name="guest_count" placeholder="e.g. 300" className="mt-1 w-full rounded-2xl border border-line bg-cream/60 px-3 py-3 text-sm text-ink outline-none focus:border-petal-500" />
                </label>
              </div>

              <p className="mt-6 text-sm font-semibold text-ink">Verify your mobile</p>
              <div className="mt-2"><VerifyMobile onVerified={setBuyer} /></div>

              {error && <p role="alert" className="mt-4 rounded-xl bg-maroon/5 p-3 text-sm text-maroon">{error}</p>}
              <button
                disabled={!buyer || state === "sending"}
                className="mt-6 w-full rounded-2xl bg-wine-800 px-6 py-4 font-semibold text-white transition hover:bg-wine-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {state === "sending" ? "Sending…" : buyer ? "Send enquiry" : "Verify mobile to continue"}
              </button>
            </form>
          )}
        </div>}
      </dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { apiSend } from "@/lib/demo/client";
import { CheckIcon, ShieldIcon } from "./icons";

export type VerifiedBuyer = { name: string; mobile: string; token: string };

const STORAGE_KEY = "vivaha.verified-buyer";

function loadSaved(): VerifiedBuyer | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as VerifiedBuyer & { expires: number };
    return saved.expires > Date.now() ? saved : null;
  } catch {
    return null;
  }
}

function save(buyer: VerifiedBuyer, ttlSeconds: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...buyer, expires: Date.now() + (ttlSeconds - 60) * 1000 }));
  } catch {
    /* storage unavailable: verification still works for this form */
  }
}

const field =
  "w-full rounded-2xl border border-line bg-cream/60 px-4 py-3.5 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-petal-500 focus:bg-white focus:ring-4 focus:ring-petal-300/30";

export function VerifyMobile({ onVerified }: { onVerified: (buyer: VerifiedBuyer | null) => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter" | "code" | "done">("enter");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [buyer, setBuyer] = useState<VerifiedBuyer | null>(null);

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      // Restore a verification from earlier in this browser session.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBuyer(saved);
      setStep("done");
      onVerified(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendCode() {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your name.");
    setBusy(true);
    try {
      const result = await apiSend<{ dev_code?: string }>("/otp/request", { mobile });
      setDevCode(result.dev_code ?? null);
      setStep("code");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setError("");
    setBusy(true);
    try {
      const result = await apiSend<{ verification_token: string; expires_in: number }>("/otp/verify", { mobile, code });
      const verified = { name: name.trim(), mobile: mobile.replace(/\D/g, "").slice(-10), token: result.verification_token };
      save(verified, result.expires_in);
      setBuyer(verified);
      setStep("done");
      onVerified(verified);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setBuyer(null);
    setCode("");
    setStep("enter");
    onVerified(null);
  }

  if (step === "done" && buyer) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-wine-800/20 bg-wine-800/5 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-wine-800 text-petal-300"><CheckIcon className="h-4 w-4" /></span>
          <div>
            <p className="text-sm font-semibold text-wine-800">Verified as {buyer.name}</p>
            <p className="text-xs text-muted">+91 {buyer.mobile.slice(0, 2)}XXXXXX{buyer.mobile.slice(-2)}</p>
          </div>
        </div>
        <button type="button" onClick={reset} className="text-xs font-semibold text-petal-600 hover:underline">Change</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {step === "enter" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
          <div className="flex items-center rounded-2xl border border-line bg-cream/60 focus-within:border-petal-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-petal-300/30">
            <span className="pl-4 text-[15px] text-muted">+91</span>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Mobile number"
              aria-label="Mobile number"
              className="w-full bg-transparent px-3 py-3.5 text-[15px] outline-none placeholder:text-muted/60"
            />
          </div>
          <button type="button" onClick={sendCode} disabled={busy} className="rounded-2xl border border-wine-800 px-5 py-3 text-sm font-semibold text-wine-800 transition hover:bg-wine-800 hover:text-cream disabled:opacity-60 sm:col-span-2">
            {busy ? "Sending…" : "Send verification code"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Enter the 6-digit code sent to <span className="font-semibold text-ink">+91 {mobile}</span>.{" "}
            <button type="button" onClick={() => setStep("enter")} className="font-semibold text-petal-600 hover:underline">Edit number</button>
          </p>
          {devCode && (
            <p className="rounded-xl border border-dashed border-petal-500/60 bg-petal-300/20 px-4 py-2.5 text-xs text-wine-800">
              Development mode: SMS isn&apos;t connected yet. Your code is <span className="font-mono text-sm font-bold tracking-widest">{devCode}</span>
            </p>
          )}
          <div className="flex gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              aria-label="Verification code"
              className={`${field} text-center font-mono text-lg tracking-[0.5em]`}
            />
            <button type="button" onClick={verifyCode} disabled={busy || code.length !== 6} className="shrink-0 rounded-2xl bg-wine-800 px-6 text-sm font-semibold text-cream transition hover:bg-wine-700 disabled:opacity-50">
              {busy ? "Checking…" : "Verify"}
            </button>
          </div>
          <button type="button" onClick={sendCode} disabled={busy} className="text-xs font-semibold text-petal-600 hover:underline">Resend code</button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-maroon">{error}</p>}
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <ShieldIcon className="h-3.5 w-3.5 text-petal-500" /> Suppliers see your number only after accepting your lead.
      </p>
    </div>
  );
}

/**
 * Browser side of the Wedlock demo: holds the live DemoState, persists it to localStorage,
 * notifies React when it changes, and exposes `apiSend` with the same paths the old API used.
 */
import { useSyncExternalStore } from "react";
import {
  acceptQuote,
  ApiError,
  changePlan,
  createEnquiry,
  createQuote,
  createRequirement,
  createSeedState,
  type DemoState,
  requestOtp,
  SEED_STATE,
  STATE_VERSION,
  unlockLead,
  verifyOtp,
} from "./data";

const STORAGE_KEY = "wedlock-demo-state";


let current: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.version === STATE_VERSION && parsed.suppliers && parsed.listings) return parsed;
    }
  } catch {
    /* storage unavailable or corrupt: fall back to seed data */
  }
  return createSeedState();
}

function getSnapshot(): DemoState {
  if (typeof window === "undefined") return SEED_STATE;
  if (!current) current = load();
  return current;
}

function getServerSnapshot(): DemoState {
  return SEED_STATE;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function save(next: DemoState) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota or privacy mode: the session still works in memory */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep several open tabs (e.g. buyer tab + vendor tab) in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      current = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Live demo state. Renders seed data on the server and updates to the visitor's saved data after hydration. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function mutate<T>(fn: (draft: DemoState) => T): T {
  const draft = structuredClone(getSnapshot());
  const result = fn(draft); // throws ApiError without saving if a rule fails
  save(draft);
  return result;
}

export function resetDemo() {
  save(createSeedState());
}

/* ───────────── API-compatible entry point ───────────── */

type Handler = (body: Record<string, unknown>, match: RegExpMatchArray) => unknown;

const ROUTES: [RegExp, Handler][] = [
  [/^\/otp\/request$/, (b) => mutate((d) => requestOtp(d, b as { mobile: string }))],
  [/^\/otp\/verify$/, (b) => mutate((d) => verifyOtp(d, b as { mobile: string; code: string }))],
  [/^\/requirements$/, (b) => mutate((d) => createRequirement(d, b as never))],
  [/^\/enquiries$/, (b) => mutate((d) => createEnquiry(d, b as never))],
  [/^\/leads\/([^/]+)\/unlock$/, (b, m) => mutate((d) => unlockLead(d, m[1], b as { supplier_id: string }))],
  [/^\/quotations$/, (b) => mutate((d) => createQuote(d, b as never))],
  [/^\/quotations\/([^/]+)\/accept$/, (_b, m) => mutate((d) => acceptQuote(d, m[1]))],
  [/^\/admin\/suppliers\/([^/]+)\/plan$/, (b, m) => mutate((d) => changePlan(d, m[1], b as { plan: string }))],
];

/**
 * Same call shape as the former HTTP client: `apiSend("/quotations", body)`.
 * Resolves with the response object or rejects with an Error carrying a friendly message.
 */
export async function apiSend<T>(path: string, body: unknown = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 180)); // feels like a network round-trip
  for (const [pattern, handler] of ROUTES) {
    const match = path.match(pattern);
    if (match) {
      try {
        return handler((body ?? {}) as Record<string, unknown>, match) as T;
      } catch (error) {
        if (error instanceof ApiError) throw new Error(error.message);
        throw new Error("Something went wrong. Please try again.");
      }
    }
  }
  throw new Error(`Unknown action: ${path}`);
}

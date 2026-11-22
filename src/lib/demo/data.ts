/**
 * Wedlock demo data layer.
 *
 * A self-contained port of the original FastAPI backend: seed data, marketplace rules
 * (category + city lead matching, buyer OTP verification, lead credits, unlocks,
 * quotations, plan-based ranking) and the response shapes the UI expects.
 * Everything here is pure: functions take a DemoState and either read it or mutate a draft.
 */
import type { Lead, Listing, Plan, PlanCode, Quotation, Requirement, Supplier, SupplierSummary } from "@/lib/site";

export const STATE_VERSION = 1;

export const PLANS: Record<PlanCode, Plan> = {
  FREE: {
    code: "FREE",
    title: "Free listing",
    rank: 0,
    credits: 3,
    badge: null,
    features: ["Business profile and catalogue", "3 buy-lead unlocks per month", "Direct enquiries from buyers"],
  },
  GROWTH: {
    code: "GROWTH",
    title: "Growth",
    rank: 1,
    credits: 30,
    badge: "Growth seller",
    features: ["Everything in Free", "30 buy-lead unlocks per month", "Higher placement in search", "Verified business badge"],
  },
  ASSURED: {
    code: "ASSURED",
    title: "Assured",
    rank: 2,
    credits: 100,
    badge: "Wedlock Assured",
    features: ["Everything in Growth", "100 buy-lead unlocks per month", "Top placement in search and categories", "Wedlock Assured trust seal"],
  },
};

const OTP_TTL_MS = 300_000;
const OTP_RESEND_MS = 30_000;
const OTP_MAX_ATTEMPTS = 5;
const VERIFICATION_TTL_MS = 1_800_000;

/* ───────────────────────── Types ───────────────────────── */

export type SupplierRecord = {
  id: string;
  business_name: string;
  owner_name: string;
  city: string;
  about: string;
  plan: PlanCode;
  credits: number;
  verified: boolean;
  gst_verified: boolean;
  years_in_business: number;
  response_rate: number;
  member_since: number;
  mobile: string;
};

export type ListingRecord = Omit<Listing, "category" | "supplier"> & { category_id: string; supplier_id: string; status: string };

export type RequirementRecord = Omit<Requirement, "quotations" | "buyer_name"> & {
  created_at: string;
  buyer: { name: string; mobile: string };
  verified: boolean;
  source: "REQUIREMENT" | "ENQUIRY";
  listing_id?: string;
};

export type LeadRecord = {
  id: string;
  created_at: string;
  requirement_id: string;
  listing_id: string;
  supplier_id: string;
  source: "REQUIREMENT" | "ENQUIRY";
  status: string;
  unlocked: boolean;
};

export type QuotationRecord = {
  id: string;
  created_at: string;
  lead_id: string;
  vendor_id: string;
  requirement_id: string;
  listing_id: string;
  amount: number;
  terms: string;
  status: string;
};

export type DemoState = {
  version: number;
  categories: Record<string, { id: string; title: string; description: string }>;
  suppliers: Record<string, SupplierRecord>;
  listings: Record<string, ListingRecord>;
  requirements: Record<string, RequirementRecord>;
  leads: Record<string, LeadRecord>;
  quotations: Record<string, QuotationRecord>;
  otp: Record<string, { code: string; sentAt: number; expiresAt: number; attempts: number }>;
  verifications: Record<string, { mobile: string; expiresAt: number }>;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/* ───────────────────────── Helpers ───────────────────────── */

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function maskMobile(mobile: string) {
  return mobile.length >= 4 ? `${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}` : "XXXXXXXXXX";
}

export function normaliseMobile(value: string): string {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (!/^[6-9]\d{9}$/.test(digits)) throw new ApiError(422, "Enter a valid 10-digit Indian mobile number");
  return digits;
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomCode() {
  const n = typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 1e9);
  return String(n % 1_000_000).padStart(6, "0");
}

function categoryTitle(state: DemoState, categoryId?: string) {
  return (categoryId && state.categories[categoryId]?.title) || "";
}

/* ───────────────────────── Seed ───────────────────────── */

export function createSeedState(): DemoState {
  const state: DemoState = { version: STATE_VERSION, categories: {}, suppliers: {}, listings: {}, requirements: {}, leads: {}, quotations: {}, otp: {}, verifications: {} };

  const categories: [string, string][] = [
    ["Venues", "Wedding venues"],
    ["Photography", "Wedding photographers"],
    ["Catering", "Wedding catering"],
    ["Decoration", "Decoration and rentals"],
    ["Beauty", "Makeup and grooming"],
    ["Planning", "Wedding planners"],
  ];
  for (const [title, description] of categories) {
    const id = `cat-${slug(title)}`;
    state.categories[id] = { id, title, description };
  }

  // title, category, city, price, description, plan, years, response %, rating, reviews
  const listings: [string, string, string, number, string, PlanCode, number, number, number, number][] = [
    ["Royal Garden Venue", "venues", "Mumbai", 85000, "Grand lawns and elegant indoor halls for 100 to 1,500 guests.", "ASSURED", 14, 98, 4.8, 126],
    ["Studio Shagun", "photography", "Jaipur", 65000, "Candid wedding films, portraits and destination ceremonies.", "GROWTH", 8, 94, 4.7, 88],
    ["Savory Wedding Table", "catering", "Pune", 850, "Vegetarian and regional menus for intimate to grand celebrations.", "FREE", 6, 81, 4.5, 37],
    ["Ivory Decor Studio", "decoration", "Delhi", 75000, "Complete mandap, floral and reception decor concepts.", "GROWTH", 11, 92, 4.6, 64],
    ["Gulmohar Bridal Glam", "beauty", "Mumbai", 18000, "Bridal makeup, hairstyling and family beauty services.", "FREE", 5, 86, 4.6, 52],
    ["Aangan Wedding Co.", "planning", "Jaipur", 125000, "Full-service planning, vendor coordination and wedding day management.", "ASSURED", 12, 97, 4.9, 141],
    ["Lakeview Resort", "venues", "Udaipur", 220000, "Destination wedding resort with ceremony lawns and guest rooms.", "ASSURED", 18, 95, 4.8, 203],
    ["Frame Story Films", "photography", "Pune", 95000, "Cinematic films, drone coverage and live streaming.", "GROWTH", 7, 90, 4.7, 71],
    ["Mehfil Catering", "catering", "Delhi", 1100, "Awadhi, Mughlai and pan-Indian wedding menus.", "GROWTH", 20, 89, 4.6, 98],
    ["Marigold Mandap Works", "decoration", "Mumbai", 55000, "Traditional and contemporary mandap installations.", "FREE", 4, 78, 4.4, 29],
  ];
  listings.forEach(([title, cat, city, price, description, plan, years, response, rating, reviews], i) => {
    const categoryId = `cat-${cat}`;
    const supplierId = `sup-${slug(title)}`;
    const verified = plan !== "FREE" || i % 2 === 0;
    state.suppliers[supplierId] = {
      id: supplierId,
      business_name: title,
      owner_name: "Demo owner",
      city,
      about: `${title} is a ${city}-based wedding ${state.categories[categoryId].title.toLowerCase()} business. ${description}`,
      plan,
      credits: PLANS[plan].credits,
      verified,
      gst_verified: plan !== "FREE",
      years_in_business: years,
      response_rate: response,
      member_since: 2026 - Math.min(years, 6),
      mobile: `98${String((20000000 + i * 1111111) % 100000000).padStart(8, "0")}`,
    };
    const listingId = `lst-${slug(title)}`;
    state.listings[listingId] = {
      id: listingId,
      title,
      description,
      category_id: categoryId,
      supplier_id: supplierId,
      transaction_type: cat === "catering" ? "PRICE_PER_PLATE" : "SERVICE_BOOKING",
      city,
      starting_price: price,
      status: "PUBLISHED",
      verification: verified ? "VERIFIED" : "PENDING",
      rating,
      review_count: reviews,
    };
  });

  const requirements: [string, string, number, number, string[], string, string, string][] = [
    ["Mumbai", "2027-02-15", 700, 1500000, ["Venues", "Catering", "Photography"], "Wedding at a Mumbai venue with a 700 guest dinner.", "Priya S.", "9876501234"],
    ["Jaipur", "2027-11-20", 350, 2400000, ["Venues", "Planning", "Photography"], "Three-day destination wedding in Jaipur with haldi, sangeet and pheras.", "Rohan M.", "9812304567"],
    ["Pune", "2027-01-08", 250, 900000, ["Photography", "Catering"], "Intimate garden wedding, need candid photography and a vegetarian menu.", "Ananya K.", "9900112233"],
    ["Delhi", "2027-03-02", 900, 3500000, ["Decoration", "Catering"], "Large reception with floral mandap and live counters.", "Kabir A.", "9765432109"],
  ];
  requirements.forEach(([city, event_date, guest_count, budget, cats, description, name, mobile], i) => {
    const id = `req-demo-${i + 1}`;
    const created_at = `2026-11-${String(18 - i).padStart(2, "0")}T09:00:00.000Z`;
    const matches = matchListings(state, city, cats);
    state.requirements[id] = {
      id, created_at, city, event_date, guest_count, budget, categories: cats, description,
      buyer: { name, mobile }, verified: true, source: "REQUIREMENT", status: "OPEN", lead_count: matches.length,
    };
    for (const listing of matches) {
      const leadId = `lead-${id}-${listing.id}`;
      state.leads[leadId] = { id: leadId, created_at, requirement_id: id, listing_id: listing.id, supplier_id: listing.supplier_id, source: "REQUIREMENT", status: "NEW", unlocked: false };
    }
  });

  return state;
}

/** Identical on server and client, so server-rendered HTML hydrates without mismatches. */
export const SEED_STATE: DemoState = createSeedState();

/* ───────────────────────── Reads ───────────────────────── */

export function supplierSummary(state: DemoState, supplierId?: string): SupplierSummary | null {
  const s = supplierId ? state.suppliers[supplierId] : undefined;
  if (!s) return null;
  return {
    id: s.id,
    business_name: s.business_name,
    city: s.city,
    plan: s.plan,
    plan_badge: PLANS[s.plan].badge,
    verified: s.verified,
    years_in_business: s.years_in_business,
    response_rate: s.response_rate,
  };
}

export function publicListing(state: DemoState, listing: ListingRecord): Listing {
  return { ...listing, category: categoryTitle(state, listing.category_id), supplier: supplierSummary(state, listing.supplier_id) };
}

export function matchListings(state: DemoState, city: string, categories: string[]) {
  const wanted = new Set(categories.map((c) => c.trim().toLowerCase()));
  return Object.values(state.listings).filter(
    (l) => l.status === "PUBLISHED" && l.city.toLowerCase() === city.trim().toLowerCase() && wanted.has(categoryTitle(state, l.category_id).toLowerCase()),
  );
}

export function search(state: DemoState, params: { q?: string; city?: string; category?: string; limit?: number } = {}): Listing[] {
  let results = Object.values(state.listings).filter((l) => l.status === "PUBLISHED").map((l) => publicListing(state, l));
  if (params.category) {
    const wanted = params.category.trim().toLowerCase();
    results = results.filter((l) => (l.category ?? "").toLowerCase() === wanted);
  }
  if (params.city) {
    const city = params.city.trim().toLowerCase();
    results = results.filter((l) => l.city.toLowerCase() === city);
  }
  if (params.q) {
    const term = params.q.trim().toLowerCase();
    results = results.filter((l) =>
      [l.title, l.description, l.category ?? "", l.city].some((field) => field.toLowerCase().includes(term)),
    );
  }
  // Paid plan first, then verification, then rating (IndiaMART-style ranking).
  const rank = (l: Listing) => [PLANS[l.supplier?.plan ?? "FREE"].rank, l.supplier?.verified ? 1 : 0, l.rating ?? 0];
  results.sort((a, b) => {
    const [ra, rb] = [rank(a), rank(b)];
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return rb[i] - ra[i];
    return 0;
  });
  return results.slice(0, params.limit ?? 20);
}

export function publicSupplier(state: DemoState, supplierId: string): Supplier | null {
  const s = state.suppliers[supplierId];
  if (!s) return null;
  const listings = Object.values(state.listings)
    .filter((l) => l.supplier_id === s.id && l.status === "PUBLISHED")
    .map((l) => publicListing(state, l));
  const ratings = listings.map((l) => l.rating ?? 0);
  return {
    id: s.id,
    business_name: s.business_name,
    city: s.city,
    about: s.about,
    plan: s.plan,
    plan_badge: PLANS[s.plan].badge,
    verified: s.verified,
    gst_verified: s.gst_verified,
    years_in_business: s.years_in_business,
    response_rate: s.response_rate,
    member_since: s.member_since,
    mobile_masked: maskMobile(s.mobile),
    categories: [...new Set(listings.map((l) => l.category ?? "").filter(Boolean))].sort(),
    rating: ratings.length ? Math.max(...ratings) : null,
    review_count: listings.reduce((n, l) => n + (l.review_count ?? 0), 0),
    listings,
  };
}

export function listSuppliers(state: DemoState): Supplier[] {
  return Object.keys(state.suppliers)
    .map((id) => publicSupplier(state, id)!)
    .sort((a, b) => PLANS[b.plan].rank - PLANS[a.plan].rank || Number(b.verified) - Number(a.verified));
}

export function supplierAccount(state: DemoState, supplierId: string) {
  const s = state.suppliers[supplierId];
  if (!s) return null;
  return { id: s.id, business_name: s.business_name, plan: PLANS[s.plan], credits: s.credits };
}

function quoteView(state: DemoState, q: QuotationRecord): Quotation {
  return { ...q, listing_title: state.listings[q.listing_id]?.title, supplier: supplierSummary(state, q.vendor_id) };
}

export function leadView(state: DemoState, lead: LeadRecord): Lead {
  const req = state.requirements[lead.requirement_id];
  const listing = state.listings[lead.listing_id];
  const buyer = req?.buyer ?? { name: "Buyer", mobile: "" };
  const quote = Object.values(state.quotations).find((q) => q.lead_id === lead.id);
  return {
    ...lead,
    listing_title: listing?.title,
    category: categoryTitle(state, listing?.category_id),
    requirement: {
      city: req?.city,
      event_date: req?.event_date,
      guest_count: req?.guest_count,
      budget: req?.budget,
      categories: req?.categories ?? [],
      description: req?.description,
      verified: req?.verified ?? false,
    },
    buyer: lead.unlocked ? { name: buyer.name, mobile: buyer.mobile } : { name: `${buyer.name.slice(0, 1)}•••••`, mobile: maskMobile(buyer.mobile) },
    quotation: quote ? quoteView(state, quote) : null,
  };
}

export function supplierLeads(state: DemoState, supplierId: string): Lead[] {
  return Object.values(state.leads)
    .filter((l) => l.supplier_id === supplierId)
    .map((l) => leadView(state, l))
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export function listRequirements(state: DemoState): Requirement[] {
  return Object.values(state.requirements)
    .map((r) => {
      const { buyer, ...rest } = r;
      return {
        ...rest,
        buyer_name: buyer?.name,
        quotations: Object.values(state.quotations).filter((q) => q.requirement_id === r.id).map((q) => quoteView(state, q)),
      };
    })
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export function adminSummary(state: DemoState) {
  const leads = Object.values(state.leads);
  const reqs = Object.values(state.requirements);
  return {
    suppliers: Object.keys(state.suppliers).length,
    listings: Object.keys(state.listings).length,
    requirements: reqs.filter((r) => r.source !== "ENQUIRY").length,
    enquiries: reqs.filter((r) => r.source === "ENQUIRY").length,
    leads: leads.length,
    leads_unlocked: leads.filter((l) => l.unlocked).length,
    quotations: Object.keys(state.quotations).length,
    bookings: 0,
  };
}

/* ───────────────────────── Mutations (operate on a draft) ───────────────────────── */

export function requestOtp(draft: DemoState, body: { mobile: string }) {
  const mobile = normaliseMobile(body.mobile);
  const now = Date.now();
  const existing = draft.otp[mobile];
  if (existing && now - existing.sentAt < OTP_RESEND_MS) {
    const wait = Math.ceil((OTP_RESEND_MS - (now - existing.sentAt)) / 1000);
    throw new ApiError(429, `Please wait ${wait}s before requesting another code`);
  }
  const code = randomCode();
  draft.otp[mobile] = { code, sentAt: now, expiresAt: now + OTP_TTL_MS, attempts: 0 };
  // No SMS provider in the demo: the code is returned so the UI can display it.
  return { sent: true, expires_in: OTP_TTL_MS / 1000, dev_code: code };
}

export function verifyOtp(draft: DemoState, body: { mobile: string; code: string }) {
  const mobile = normaliseMobile(body.mobile);
  if (!/^\d{6}$/.test(String(body.code ?? ""))) throw new ApiError(422, "Enter the 6-digit code");
  const record = draft.otp[mobile];
  const now = Date.now();
  if (!record || now > record.expiresAt) throw new ApiError(400, "Code expired. Request a new one.");
  if (record.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many attempts. Request a new code.");
  record.attempts += 1;
  if (record.code !== body.code) throw new ApiError(400, "Incorrect code");
  delete draft.otp[mobile];
  const token = newId("verify");
  draft.verifications[token] = { mobile, expiresAt: now + VERIFICATION_TTL_MS };
  return { verification_token: token, expires_in: VERIFICATION_TTL_MS / 1000 };
}

type BuyerFields = { buyer_name: string; mobile: string; verification_token: string };

function requireVerified(draft: DemoState, body: BuyerFields) {
  const name = String(body.buyer_name ?? "").trim();
  if (name.length < 2) throw new ApiError(422, "Please enter your name");
  const mobile = normaliseMobile(body.mobile);
  const record = draft.verifications[body.verification_token];
  if (!record || record.mobile !== mobile || Date.now() > record.expiresAt) {
    throw new ApiError(401, "Mobile number is not verified. Please verify with the OTP again.");
  }
  return { name, mobile };
}

function createLead(draft: DemoState, requirementId: string, listing: ListingRecord, source: LeadRecord["source"]) {
  const id = newId("lead");
  draft.leads[id] = { id, created_at: new Date().toISOString(), requirement_id: requirementId, listing_id: listing.id, supplier_id: listing.supplier_id, source, status: "NEW", unlocked: false };
  return draft.leads[id];
}

export function createRequirement(
  draft: DemoState,
  body: BuyerFields & { city: string; event_date: string; guest_count: number; budget: number; categories: string[]; description: string },
) {
  const buyer = requireVerified(draft, body);
  const city = String(body.city ?? "").trim();
  if (city.length < 2) throw new ApiError(422, "Please enter the city");
  if (!body.event_date) throw new ApiError(422, "Please choose the event date");
  if (!(Number(body.guest_count) > 0)) throw new ApiError(422, "Guest count must be more than 0");
  if (!(Number(body.budget) > 0)) throw new ApiError(422, "Budget must be more than 0");
  if (!Array.isArray(body.categories) || body.categories.length === 0) throw new ApiError(422, "Choose at least one service you need.");
  if (String(body.description ?? "").trim().length < 10) throw new ApiError(422, "Please describe your requirement in a little more detail");

  const id = newId("req");
  const matches = matchListings(draft, city, body.categories);
  draft.requirements[id] = {
    id,
    created_at: new Date().toISOString(),
    city,
    event_date: body.event_date,
    guest_count: Number(body.guest_count),
    budget: Number(body.budget),
    categories: body.categories,
    description: body.description.trim(),
    buyer,
    verified: true,
    source: "REQUIREMENT",
    status: "OPEN",
    lead_count: matches.length,
  };
  for (const listing of matches) createLead(draft, id, listing, "REQUIREMENT");
  return { id, lead_count: matches.length, buyer: { name: buyer.name } };
}

export function createEnquiry(
  draft: DemoState,
  body: BuyerFields & { listing_id: string; message: string; event_date?: string | null; guest_count?: number | null },
) {
  const buyer = requireVerified(draft, body);
  const listing = draft.listings[body.listing_id];
  if (!listing) throw new ApiError(404, "Listing not found");
  const message = String(body.message ?? "").trim();
  if (message.length < 10) throw new ApiError(422, "Please write a short message (at least 10 characters)");

  const id = newId("req");
  draft.requirements[id] = {
    id,
    created_at: new Date().toISOString(),
    city: listing.city,
    event_date: body.event_date || "",
    guest_count: Number(body.guest_count) || 0,
    budget: 0,
    categories: [categoryTitle(draft, listing.category_id)],
    description: message,
    buyer,
    verified: true,
    source: "ENQUIRY",
    listing_id: listing.id,
    status: "OPEN",
    lead_count: 1,
  };
  const lead = createLead(draft, id, listing, "ENQUIRY");
  return { id, lead_id: lead.id, supplier: supplierSummary(draft, listing.supplier_id) };
}

export function unlockLead(draft: DemoState, leadId: string, body: { supplier_id: string }) {
  const lead = draft.leads[leadId];
  if (!lead) throw new ApiError(404, "Lead not found");
  if (lead.supplier_id !== body.supplier_id) throw new ApiError(403, "This lead belongs to another supplier");
  const supplier = draft.suppliers[body.supplier_id];
  if (!lead.unlocked) {
    if (supplier.credits <= 0) throw new ApiError(402, "No lead credits left. Upgrade your plan to unlock more buy leads.");
    supplier.credits -= 1;
    lead.unlocked = true;
    if (lead.status === "NEW") lead.status = "UNLOCKED";
  }
  return { lead: leadView(draft, lead), credits: supplier.credits };
}

export function createQuote(draft: DemoState, body: { lead_id: string; vendor_id: string; amount: number; terms: string }) {
  const lead = draft.leads[body.lead_id];
  if (!lead) throw new ApiError(404, "Lead not found");
  if (lead.supplier_id !== body.vendor_id) throw new ApiError(403, "This lead belongs to another supplier");
  if (!lead.unlocked) throw new ApiError(409, "Unlock the lead before sending a quotation");
  if (Object.values(draft.quotations).some((q) => q.lead_id === lead.id)) throw new ApiError(409, "A quotation was already sent for this lead");
  if (!(Number(body.amount) > 0)) throw new ApiError(422, "Enter a quotation amount");
  if (String(body.terms ?? "").trim().length < 5) throw new ApiError(422, "Please describe what's included");
  const id = newId("quote");
  draft.quotations[id] = {
    id,
    created_at: new Date().toISOString(),
    lead_id: lead.id,
    vendor_id: body.vendor_id,
    requirement_id: lead.requirement_id,
    listing_id: lead.listing_id,
    amount: Number(body.amount),
    terms: body.terms.trim(),
    status: "SENT",
  };
  lead.status = "QUOTATION_SENT";
  return quoteView(draft, draft.quotations[id]);
}

export function acceptQuote(draft: DemoState, quotationId: string) {
  const quote = draft.quotations[quotationId];
  if (!quote) throw new ApiError(404, "Quotation not found");
  quote.status = "ACCEPTED";
  const req = draft.requirements[quote.requirement_id];
  if (req) req.status = "QUOTE_ACCEPTED";
  const lead = draft.leads[quote.lead_id];
  if (lead) lead.status = "WON";
  return quoteView(draft, quote);
}

export function changePlan(draft: DemoState, supplierId: string, body: { plan: string }) {
  const supplier = draft.suppliers[supplierId];
  if (!supplier) throw new ApiError(404, "Supplier not found");
  if (!(body.plan in PLANS)) throw new ApiError(422, `Unknown plan. Choose one of ${Object.keys(PLANS).join(", ")}`);
  const plan = body.plan as PlanCode;
  supplier.plan = plan;
  supplier.credits = Math.max(supplier.credits, PLANS[plan].credits);
  if (plan !== "FREE") supplier.verified = true;
  for (const l of Object.values(draft.listings)) if (l.supplier_id === supplierId) l.verification = supplier.verified ? "VERIFIED" : l.verification;
  return publicSupplier(draft, supplierId);
}

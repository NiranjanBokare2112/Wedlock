export type IconName =
  | "venue"
  | "camera"
  | "catering"
  | "flower"
  | "beauty"
  | "planning";

export type PlanCode = "FREE" | "GROWTH" | "ASSURED";

export type SupplierSummary = {
  id: string;
  business_name: string;
  city: string;
  plan: PlanCode;
  plan_badge: string | null;
  verified: boolean;
  years_in_business: number;
  response_rate: number;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  city: string;
  starting_price: number | null;
  category?: string;
  category_id?: string;
  supplier_id?: string;
  supplier?: SupplierSummary | null;
  transaction_type?: string;
  verification?: string;
  rating?: number;
  review_count?: number;
};

export type Supplier = Omit<SupplierSummary, "plan_badge"> & {
  plan_badge: string | null;
  about: string;
  gst_verified: boolean;
  member_since: number;
  mobile_masked: string;
  categories: string[];
  rating: number | null;
  review_count: number;
  listings: Listing[];
};

export type Plan = {
  code: PlanCode;
  title: string;
  rank: number;
  credits: number;
  badge: string | null;
  features: string[];
};

export type Quotation = {
  id: string;
  lead_id: string;
  requirement_id: string;
  vendor_id: string;
  amount: number;
  terms: string;
  status: string;
  created_at: string;
  listing_title?: string;
  supplier?: SupplierSummary | null;
};

export type Requirement = {
  id: string;
  city: string;
  event_date: string;
  guest_count: number;
  budget: number;
  categories: string[];
  description: string;
  status?: string;
  source?: "REQUIREMENT" | "ENQUIRY";
  lead_count?: number;
  buyer_name?: string;
  created_at?: string;
  quotations?: Quotation[];
};

export type Lead = {
  id: string;
  requirement_id: string;
  listing_id: string;
  supplier_id?: string;
  source?: "REQUIREMENT" | "ENQUIRY";
  status: string;
  unlocked?: boolean;
  created_at?: string;
  listing_title?: string;
  category?: string;
  requirement?: {
    city?: string;
    event_date?: string;
    guest_count?: number;
    budget?: number;
    categories?: string[];
    description?: string;
    verified?: boolean;
  };
  buyer?: { name?: string; mobile?: string };
  quotation?: Quotation | null;
};

export const PLAN_STYLES: Record<PlanCode, string> = {
  FREE: "bg-line text-muted",
  GROWTH: "bg-wine-800/10 text-wine-700",
  ASSURED: "bg-petal-300 text-wine-900",
};


export type CategoryMeta = {
  slug: string;
  title: string;
  blurb: string;
  icon: IconName;
  gradient: string;
  /** Text/icon colour that reads well on the gradient. */
  tone: string;
};

export const CATEGORIES: CategoryMeta[] = [
  { slug: "venues", title: "Venues", blurb: "Palaces, resorts and lawns", icon: "venue", gradient: "from-[#f7f2ee] to-[#e9ddd4]", tone: "text-[#7a1c3d]" },
  { slug: "photography", title: "Photography", blurb: "Candid moments, cinematic films", icon: "camera", gradient: "from-[#efe8fb] to-[#d8cbf3]", tone: "text-[#6b4fa3]" },
  { slug: "catering", title: "Catering", blurb: "Menus your guests will remember", icon: "catering", gradient: "from-[#fdeedd] to-[#f8cfa6]", tone: "text-[#b8642a]" },
  { slug: "decoration", title: "Decoration", blurb: "Mandaps, florals and fairy lights", icon: "flower", gradient: "from-[#fbf1ea] to-[#f1d9c9]", tone: "text-[#a3482e]" },
  { slug: "beauty", title: "Beauty", blurb: "Bridal glam, mehendi, hair", icon: "beauty", gradient: "from-[#f6f0f4] to-[#e6d7e1]", tone: "text-[#8a3a6a]" },
  { slug: "planning", title: "Planning", blurb: "Planners who sweat the details", icon: "planning", gradient: "from-[#e9f2e6] to-[#c7dfc1]", tone: "text-[#4f7a45]" },
];

export const CITIES = ["Mumbai", "Delhi", "Jaipur", "Udaipur", "Pune", "Goa"];

/** Full marketplace directory: services and products. `category` links to a backend category, otherwise search by keyword. */
export type DirectoryGroup = {
  title: string;
  icon: IconName;
  kind: "Services" | "Products" | "Services & rentals";
  items: { label: string; category?: string; q?: string }[];
};

export const DIRECTORY: DirectoryGroup[] = [
  { title: "Venues & Hospitality", icon: "venue", kind: "Services", items: [
    { label: "Banquet halls", category: "venues", q: "hall" }, { label: "Destination resorts", category: "venues", q: "resort" },
    { label: "Lawns & farmhouses", category: "venues", q: "lawn" }, { label: "Heritage palaces", q: "palace" } ] },
  { title: "Food & Catering", icon: "catering", kind: "Services", items: [
    { label: "Wedding caterers", category: "catering" }, { label: "Sweets & mithai", q: "mithai" },
    { label: "Live counters", q: "live counter" }, { label: "Regional cuisine", category: "catering", q: "regional" } ] },
  { title: "Photo & Video", icon: "camera", kind: "Services", items: [
    { label: "Candid photographers", category: "photography", q: "candid" }, { label: "Cinematic films", category: "photography", q: "film" },
    { label: "Drone coverage", category: "photography", q: "drone" }, { label: "Photo booths", q: "photo booth" } ] },
  { title: "Decor & Rentals", icon: "flower", kind: "Services & rentals", items: [
    { label: "Mandap decor", category: "decoration", q: "mandap" }, { label: "Floral decor", category: "decoration", q: "floral" },
    { label: "Tent & lighting", q: "lighting" }, { label: "Furniture rental", q: "furniture" } ] },
  { title: "Bridal & Groom Wear", icon: "beauty", kind: "Products", items: [
    { label: "Bridal lehengas", q: "lehenga" }, { label: "Sherwanis", q: "sherwani" },
    { label: "Wedding jewellery", q: "jewellery" }, { label: "Footwear & accessories", q: "accessories" } ] },
  { title: "Beauty & Mehendi", icon: "beauty", kind: "Services", items: [
    { label: "Bridal makeup", category: "beauty", q: "makeup" }, { label: "Mehendi artists", q: "mehendi" },
    { label: "Hair stylists", category: "beauty", q: "hair" }, { label: "Groom grooming", q: "grooming" } ] },
  { title: "Invites & Gifting", icon: "planning", kind: "Products", items: [
    { label: "Invitation cards", q: "invitation" }, { label: "Return gifts", q: "gift" },
    { label: "Trousseau packing", q: "trousseau" }, { label: "Gift hampers", q: "hamper" } ] },
  { title: "Planning & Services", icon: "planning", kind: "Services", items: [
    { label: "Wedding planners", category: "planning" }, { label: "Pandits & priests", q: "pandit" },
    { label: "DJ, bands & anchors", q: "dj" }, { label: "Baraat & transport", q: "transport" } ] },
];

export function directoryHref(item: { category?: string; q?: string }) {
  const params = new URLSearchParams();
  if (item.category) params.set("category", item.category);
  else if (item.q) params.set("q", item.q);
  return `/search?${params}`;
}

/** Extra services/products a buyer can ask for beyond the core categories. */
export const EXTRA_NEEDS = ["Bridal wear", "Jewellery", "Invitations", "Return gifts", "Tent & lighting", "DJ & entertainment"];

export function categoryMeta(title?: string): CategoryMeta {
  const key = (title || "").toLowerCase();
  return CATEGORIES.find((c) => c.slug === key || c.title.toLowerCase() === key) ?? CATEGORIES[0];
}

export function formatINR(value: number | null | undefined): string {
  if (value == null) return "On request";
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatCompactINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(value % 10000000 ? 1 : 0)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 ? 1 : 0)} L`;
  return formatINR(value);
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Category photos shipped in /public/images (no file-system lookups, so it works on Vercel). */
export const CATEGORY_PHOTOS: Record<string, string> = {
  venues: "/images/category-venues.webp",
  photography: "/images/category-photography.webp",
  catering: "/images/category-catering.webp",
  decoration: "/images/category-decoration.webp",
  beauty: "/images/category-beauty.webp",
  planning: "/images/category-planning.webp",
};

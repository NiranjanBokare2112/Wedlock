import Link from "next/link";
import { categoryMeta, formatINR, type Listing } from "@/lib/site";
import { EnquiryButton } from "./EnquiryButton";
import { CategoryIcon, PinIcon, ShieldIcon, StarIcon } from "./icons";
import { Blossom, Leaf, Marigold, Rose } from "./ornaments";

export function ListingCard({ listing }: { listing: Listing }) {
  const meta = categoryMeta(listing.category);
  const supplier = listing.supplier;
  const perPlate = listing.transaction_type === "PRICE_PER_PLATE";
  const profileHref = supplier ? `/supplier/${supplier.id}` : "/search";
  const assured = supplier?.plan === "ASSURED";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_2px_0_0_#ebe6e3,0_18px_40px_-28px_rgba(122,28,61,0.35)] ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_2px_0_0_#ebe6e3,0_30px_60px_-30px_rgba(122,28,61,0.45)]">
      <Link href={profileHref} className={`relative block h-44 overflow-hidden bg-gradient-to-br ${meta.gradient}`} aria-label={`View ${listing.title}`}>
        <svg viewBox="0 0 160 120" className="absolute -right-4 -top-3 h-32 w-40 transition duration-700 group-hover:rotate-6" aria-hidden="true">
          <Leaf x={92} y={46} size={34} angle={-160} />
          <Leaf x={100} y={42} size={30} angle={-80} dark />
          <Leaf x={104} y={50} size={30} angle={10} />
          <Rose x={100} y={46} r={15} />
          <Marigold x={128} y={30} r={10} />
          <Blossom x={76} y={30} r={8} />
          <Marigold x={122} y={70} r={7} />
        </svg>
        <span className="absolute bottom-4 left-5 grid h-16 w-16 place-items-center rounded-full bg-white/80 shadow-sm backdrop-blur">
          <CategoryIcon name={meta.icon} className={`h-8 w-8 ${meta.tone}`} strokeWidth={1.4} />
        </span>
        <span className={`absolute left-5 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold ${meta.tone}`}>{meta.title}</span>
        {assured && (
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-wine-800 px-2.5 py-1 text-[11px] font-semibold text-petal-200">
            <ShieldIcon className="h-3.5 w-3.5" /> {supplier?.plan_badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-1 text-muted">
            <PinIcon className="h-4 w-4 text-petal-500" /> {listing.city}
          </span>
          {listing.rating != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-marigold-soft px-2 py-0.5 text-xs font-semibold text-ink">
              <StarIcon className="h-3.5 w-3.5 text-marigold" /> {listing.rating.toFixed(1)}
              <span className="font-normal text-muted">· {listing.review_count ?? 0} reviews</span>
            </span>
          )}
        </div>
        <h3 className="mt-2 text-2xl font-semibold leading-tight text-wine-800">
          <Link href={profileHref} className="hover:text-petal-600">{listing.title}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-12 text-sm leading-6 text-muted">{listing.description}</p>

        {supplier && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {supplier.verified && <span className="inline-flex items-center gap-1 font-semibold text-[#4f7a45]"><ShieldIcon className="h-3.5 w-3.5" /> Verified</span>}
            <span>{supplier.years_in_business} years</span>
            <span aria-hidden="true">·</span>
            <span>Replies to {supplier.response_rate}%</span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-muted">{perPlate ? "per plate from" : "starting at"}</p>
            <p className="font-serif text-2xl font-semibold text-wine-800">{formatINR(listing.starting_price)}</p>
          </div>
          <EnquiryButton
            listingId={listing.id}
            listingTitle={listing.title}
            supplierName={supplier?.business_name}
            label="Get quote"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-wine-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-wine-700"
          />
        </div>
      </div>
    </article>
  );
}

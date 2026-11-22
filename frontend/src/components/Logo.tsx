import Link from "next/link";

/**
 * Wedlock mark: two interlocking wedding rings (gold & wine) with a small diamond.
 * The gold ring passes over the wine ring at the top crossing, so they read as linked.
 */
export function LogoMark({ light = false, className = "h-10 w-10" }: { light?: boolean; className?: string }) {
  const gold = light ? "#f6d58e" : "#c9973a";
  const wine = light ? "#ffffff" : "#7a1c3d";
  return (
    <svg viewBox="0 0 44 40" className={className} aria-hidden="true">
      {/* wine ring (back) */}
      <circle cx="26" cy="23" r="10" fill="none" stroke={wine} strokeWidth="3.4" />
      {/* gold ring */}
      <circle cx="16" cy="23" r="10" fill="none" stroke={gold} strokeWidth="3.4" />
      {/* wine ring crosses over the gold one at the bottom crossing (21, 31.66) */}
      <path d="M23.41 32.66 A10 10 0 0 1 18.93 30.07" fill="none" stroke={wine} strokeWidth="3.4" />
      {/* diamond on the wine ring */}
      <path d="M26 4.2 L29.6 8.4 L26 13 L22.4 8.4 Z" fill={light ? "#ffffff" : "#fde6ec"} stroke={light ? "#f9cdd8" : "#c4466b"} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M22.4 8.4 H29.6 M26 4.2 L24.6 8.4 L26 13 L27.4 8.4 Z" fill="none" stroke={light ? "#f9cdd8" : "#c4466b"} strokeWidth="0.8" strokeLinejoin="round" />
      {/* sparkle */}
      <path d="M34.5 3.5v3.4M32.8 5.2h3.4" stroke={gold} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ light = false, suffix }: { light?: boolean; suffix?: string }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Wedlock home">
      <span className="transition duration-500 group-hover:-rotate-6 group-hover:scale-105">
        <LogoMark light={light} className="h-10 w-11" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-[1.8rem] font-semibold tracking-tight ${light ? "text-white" : "text-wine-800"}`}>
          Wed<span className={`font-normal italic ${light ? "text-petal-200" : "text-petal-600"}`}>lock</span>
        </span>
        {suffix && (
          <span className={`mt-0.5 font-hand text-base leading-none ${light ? "text-petal-200" : "text-petal-600"}`}>
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}

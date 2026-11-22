import Link from "next/link";
import { CATEGORIES, CITIES } from "@/lib/site";
import { Logo } from "./Logo";
import { FloralSpray } from "./ornaments";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-wine-950 text-cream">
      <div className="bg-jaali absolute inset-0 opacity-30" />
      <FloralSpray className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-7 text-cream/70">
              Everything for your big day, from the roka to the reception, with suppliers you can trust.
            </p>
            <p className="mt-6 font-hand text-2xl text-petal-300">made with love, for Indian weddings ♥</p>
          </div>
          <FooterCol title="Explore" links={CATEGORIES.map((c) => ({ href: `/search?category=${c.slug}`, label: c.title }))} />
          <FooterCol title="Destinations" links={CITIES.map((city) => ({ href: `/search?city=${city}`, label: city }))} />
          <FooterCol
            title="Plan & grow"
            links={[
              { href: "/requirements", label: "Post a requirement" },
              { href: "/customer", label: "My enquiries" },
              { href: "/vendor", label: "Vendor dashboard" },
              { href: "/admin", label: "Administration" },
            ]}
          />
        </div>
        <div className="mt-14 border-t border-cream/10 pt-6 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} Wedlock. Demo build: listings are sample data.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-serif text-lg font-semibold text-petal-300">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-cream/70 transition hover:text-petal-300">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

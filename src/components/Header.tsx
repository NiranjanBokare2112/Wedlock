"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, CITIES, type IconName } from "@/lib/site";
import { Logo } from "./Logo";
import { ArrowRightIcon, CategoryIcon, CloseIcon, MenuIcon, PinIcon } from "./icons";

type NavLink = { href: string; label: string; icon?: IconName; hint?: string };
type NavItem = { label: string; href: string; items?: NavLink[] };

const NAV: NavItem[] = [
  {
    label: "Browse",
    href: "/search",
    items: [
      { href: "/search", label: "All suppliers", hint: "Every category, every city" },
      ...CATEGORIES.map((c) => ({ href: `/search?category=${c.slug}`, label: c.title, icon: c.icon, hint: c.blurb })),
    ],
  },
  {
    label: "Destinations",
    href: "/search",
    items: CITIES.map((city) => ({ href: `/search?city=${city}`, label: city })),
  },
  { label: "Post requirement", href: "/requirements" },
  { label: "My enquiries", href: "/customer" },
  { label: "For vendors", href: "/vendor" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState(pathname);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close menus when the route changes (state adjustment during render, no effect needed).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setActive(null);
  }

  // Solid header once the visitor scrolls past the top of the page.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Outside click and Escape close menus; Escape returns focus to the trigger.
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setActive(null);
        setMobileOpen(false);
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (active) {
        triggers.current[active]?.focus();
        setActive(null);
      } else if (mobileOpen) {
        setMobileOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
    };
  }, [active, mobileOpen]);

  // Always solid now that no page places a photo behind the header.
  const transparent = false;
  const isCurrent = (item: NavItem) =>
    item.items ? item.label === "Browse" && pathname === "/search" : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const close = () => {
    setActive(null);
    setMobileOpen(false);
  };

  return (
    <header
      ref={root}
      className={`sticky top-0 z-50 transition-[background-color,color,box-shadow] duration-500 ${
        scrolled || mobileOpen
          ? "bg-white/95 text-ink shadow-[0_1px_0_0_#ebe6e3,0_10px_30px_-24px_rgba(43,33,36,0.45)] backdrop-blur-xl"
          : "bg-white text-ink"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-6 px-5 lg:px-8">
        <Logo light={transparent} suffix={pathname.startsWith("/vendor") ? "Business" : pathname.startsWith("/admin") ? "Admin" : undefined} />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => {
              const current = isCurrent(item);
              if (!item.items) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className="group relative flex min-h-11 items-center text-[14px] font-medium tracking-[0.01em]"
                    >
                      {item.label}
                      <span className={`absolute bottom-1.5 left-0 h-px bg-current transition-all duration-300 ${current ? "w-full" : "w-0 group-hover:w-full"}`} />
                    </Link>
                  </li>
                );
              }
              const expanded = active === item.label;
              const id = `menu-${item.label.toLowerCase()}`;
              return (
                <li
                  key={item.label}
                  className="relative"
                  onPointerEnter={(e) => { if (e.pointerType === "mouse") setActive(item.label); }}
                  onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive(null); }}
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(null); }}
                >
                  <button
                    ref={(el) => { triggers.current[item.label] = el; }}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={id}
                    onClick={() => setActive(expanded ? null : item.label)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActive(item.label);
                        requestAnimationFrame(() => document.querySelector<HTMLElement>(`#${id} a`)?.focus());
                      }
                    }}
                    className={`flex min-h-11 items-center gap-1.5 text-[14px] font-medium tracking-[0.01em] ${current ? "underline decoration-1 underline-offset-8" : ""}`}
                  >
                    {item.label}
                    <svg viewBox="0 0 20 20" className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div
                    id={id}
                    inert={!expanded}
                    className={`absolute left-1/2 top-full z-40 -translate-x-1/2 pt-2 transition-[opacity,transform,visibility] duration-200 ease-out ${
                      expanded ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1.5 opacity-0"
                    }`}
                  >
                    <ul className={`rounded-2xl bg-white p-2 text-ink shadow-[0_24px_50px_-20px_rgba(122,28,61,0.45)] ring-1 ring-line ${item.items.length > 6 ? "grid w-[540px] grid-cols-2 gap-x-1" : "w-60"}`}>
                      {item.items.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            onClick={close}
                            className="group/link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-blush hover:pl-4"
                          >
                            {link.icon ? (
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-petal-200 text-petal-600 transition group-hover/link:bg-wine-800 group-hover/link:text-petal-200">
                                <CategoryIcon name={link.icon} className="h-4 w-4" />
                              </span>
                            ) : (
                              <PinIcon className="h-4 w-4 shrink-0 text-petal-500" />
                            )}
                            <span className="min-w-0">
                              <span className="block font-medium text-wine-800">{link.label}</span>
                              {link.hint && <span className="block truncate text-xs text-muted">{link.hint}</span>}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/requirements"
          className={`ml-auto hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 sm:inline-flex lg:ml-2 ${
            transparent ? "bg-white/15 text-white ring-1 ring-white/50 backdrop-blur hover:bg-white hover:text-wine-800" : "bg-wine-800 text-white hover:bg-wine-700"
          }`}
        >
          Get free quotes <ArrowRightIcon className="h-4 w-4" />
        </Link>

        <button
          ref={toggle}
          type="button"
          onClick={() => { setMobileOpen((v) => !v); setActive(null); }}
          className="ml-auto grid h-11 w-11 place-items-center rounded-full sm:ml-0 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile floating menu: scales in from the top-right corner */}
      <nav
        id="mobile-menu"
        aria-label="Mobile"
        inert={!mobileOpen}
        className={`absolute right-4 top-[calc(100%+8px)] max-h-[calc(100dvh-110px)] w-[min(340px,calc(100vw-32px))] origin-top-right overflow-y-auto overscroll-contain rounded-3xl bg-white p-3 text-ink shadow-[0_24px_60px_-20px_rgba(122,28,61,0.5)] ring-1 ring-line transition-[opacity,transform,visibility] duration-[260ms] ease-[cubic-bezier(.22,1,.36,1)] lg:hidden ${
          mobileOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1.5 scale-[0.98] opacity-0"
        }`}
      >
        <ul>
          {NAV.map((item) => {
            if (!item.items) {
              return (
                <li key={item.label} className="border-b border-line/70 last:border-0">
                  <Link href={item.href} onClick={close} className="flex min-h-12 items-center justify-between px-3 text-[17px] font-medium text-wine-800">
                    {item.label}
                  </Link>
                </li>
              );
            }
            const expanded = active === item.label;
            return (
              <li key={item.label} className="border-b border-line/70">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setActive(expanded ? null : item.label)}
                  className="flex min-h-12 w-full items-center justify-between px-3 text-[17px] font-medium text-wine-800"
                >
                  {item.label}
                  <span className={`text-xl leading-none text-petal-500 transition-transform duration-200 ${expanded ? "rotate-45" : ""}`}>+</span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)] ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <ul className="min-h-0 overflow-hidden" inert={!expanded}>
                    {item.items.map((link) => (
                      <li key={link.href + link.label}>
                        <Link href={link.href} onClick={close} className="flex min-h-11 items-center gap-2.5 rounded-xl px-4 text-[15px] text-muted transition-all hover:bg-blush hover:pl-5 hover:text-wine-800">
                          {link.icon ? <CategoryIcon name={link.icon} className="h-4 w-4 text-petal-500" /> : <PinIcon className="h-4 w-4 text-petal-500" />}
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/requirements" onClick={close} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-wine-800 font-semibold text-white">
          Get free quotes <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </nav>
    </header>
  );
}

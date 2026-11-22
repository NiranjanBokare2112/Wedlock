"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "static" | "hidden" | "shown";

/**
 * Fades and lifts its children in as they scroll into view.
 * Content is visible by default (server render, no JS, slow devices); the animation is only
 * armed after mount for elements that are still below the fold, so nothing can get stuck hidden.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at load: leave it as is, no animation needed.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setPhase("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    // Safety net: never leave content hidden if the observer doesn't fire.
    const fallback = window.setTimeout(() => setPhase("shown"), 4000);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const motion =
    phase === "static"
      ? ""
      : `transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] ${phase === "shown" ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`;

  return (
    <div ref={ref} style={phase === "static" ? undefined : { transitionDelay: `${delay}ms` }} className={`${motion} ${className}`}>
      {children}
    </div>
  );
}

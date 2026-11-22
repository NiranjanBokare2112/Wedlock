"use client";

import { useEffect, useRef, useState } from "react";

export type Slide = { src: string; alt: string; position?: string; caption: string };

const INTERVAL = 6500;

/** Full-bleed crossfading photos with a slow "drift" zoom on the active slide. */
export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => {
      mq.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible || reduced || slides.length < 2) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [index, visible, reduced, slides.length]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden" aria-roledescription="carousel" aria-label="Wedding moments">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== index}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.src}
            alt={slide.alt}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
            className={`h-full w-full object-cover ${i === index && !reduced ? "animate-hero-drift" : ""}`}
            style={{ objectPosition: slide.position ?? "50% 35%" }}
          />
        </div>
      ))}

      <div className="absolute bottom-7 right-5 z-10 flex items-center gap-3 sm:right-8 lg:right-12">
        <span className="font-hand text-xl text-white/90">{slides[index]?.caption}</span>
        <div className="flex gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}: ${slide.caption}`}
              aria-current={i === index}
              className="group grid h-6 place-items-center"
            >
              <span className={`block h-[3px] rounded-full transition-all duration-500 ${i === index ? "w-8 bg-white" : "w-4 bg-white/45 group-hover:bg-white/80"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

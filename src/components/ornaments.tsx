import type { SVGProps } from "react";

/* ─────────────────────────── Flower primitives ─────────────────────────── */

/** Round to 2 decimals so server and browser render identical SVG (avoids hydration mismatches). */
const q = (n: number) => Math.round(n * 100) / 100;

const C = {
  rose: "#e2668a",
  roseDark: "#b83a60",
  roseLight: "#f5a5ba",
  blush: "#fbd3dc",
  marigold: "#f4a83a",
  marigoldDark: "#e0801f",
  marigoldLight: "#f9c867",
  leaf: "#7f9c6e",
  leafDark: "#5f7d52",
  white: "#fff6f2",
};

export function Marigold({ x, y, r }: { x: number; y: number; r: number }) {
  const outer = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2);
  const inner = Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2 + 0.3);
  return (
    <g>
      {outer.map((a, i) => <circle key={`o${i}`} cx={q(x + Math.cos(a) * r * 0.72)} cy={q(y + Math.sin(a) * r * 0.72)} r={r * 0.36} fill={C.marigoldLight} />)}
      <circle cx={x} cy={y} r={r * 0.78} fill={C.marigold} />
      {inner.map((a, i) => <circle key={`i${i}`} cx={q(x + Math.cos(a) * r * 0.42)} cy={q(y + Math.sin(a) * r * 0.42)} r={r * 0.26} fill={C.marigoldLight} opacity="0.9" />)}
      <circle cx={x} cy={y} r={r * 0.3} fill={C.marigoldDark} />
    </g>
  );
}

export function Rose({ x, y, r, light = false }: { x: number; y: number; r: number; light?: boolean }) {
  const fill = light ? C.roseLight : C.rose;
  const line = light ? C.rose : C.roseDark;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} />
      <path
        d={`M${x - r * 0.15} ${y} a${r * 0.18} ${r * 0.18} 0 1 1 ${r * 0.34} ${r * 0.05} a${r * 0.42} ${r * 0.42} 0 1 1 ${-r * 0.78} ${-r * 0.1} a${r * 0.66} ${r * 0.66} 0 1 1 ${r * 1.2} ${r * 0.28}`}
        fill="none"
        stroke={line}
        strokeWidth={Math.max(1, r * 0.11)}
        strokeLinecap="round"
      />
    </g>
  );
}

export function Blossom({ x, y, r, color = C.blush }: { x: number; y: number; r: number; color?: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((d) => {
        const a = (d * Math.PI) / 180;
        return <circle key={d} cx={q(x + Math.cos(a) * r * 0.55)} cy={q(y + Math.sin(a) * r * 0.55)} r={r * 0.5} fill={color} />;
      })}
      <circle cx={x} cy={y} r={r * 0.3} fill={C.marigold} />
    </g>
  );
}

export function Leaf({ x, y, size, angle, dark = false }: { x: number; y: number; size: number; angle: number; dark?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M0 0 C ${size * 0.35} ${-size * 0.32}, ${size * 0.8} ${-size * 0.22}, ${size} 0 C ${size * 0.8} ${size * 0.22}, ${size * 0.35} ${size * 0.32}, 0 0 Z`} fill={dark ? C.leafDark : C.leaf} />
      <path d={`M${size * 0.08} 0 L${size * 0.85} 0`} stroke={C.white} strokeOpacity="0.35" strokeWidth={Math.max(0.6, size * 0.03)} />
    </g>
  );
}

/* ─────────────────────────── Compositions ─────────────────────────── */

/** A loose spray of roses, marigolds and leaves: use in corners. */
export function FloralSpray(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 220 220" aria-hidden="true" {...props}>
      <Leaf x={100} y={110} size={78} angle={-150} />
      <Leaf x={110} y={104} size={70} angle={-95} dark />
      <Leaf x={112} y={112} size={72} angle={-30} />
      <Leaf x={104} y={118} size={60} angle={35} dark />
      <Leaf x={98} y={116} size={64} angle={150} />
      <Rose x={110} y={110} r={30} />
      <Marigold x={70} y={86} r={20} />
      <Rose x={150} y={82} r={18} light />
      <Marigold x={146} y={140} r={16} />
      <Blossom x={78} y={142} r={13} />
      <Blossom x={128} y={58} r={10} color={C.roseLight} />
      <circle cx={52} cy={120} r={4} fill={C.rose} />
      <circle cx={170} cy={112} r={3.5} fill={C.marigold} />
      <circle cx={100} cy={52} r={3} fill={C.rose} />
    </svg>
  );
}

/** Toran: a marigold garland strung across the top of a section. */
export function Toran({ className = "" }: { className?: string }) {
  const strands = Array.from({ length: 13 }, (_, i) => i);
  return (
    <svg viewBox="0 0 1200 140" preserveAspectRatio="xMidYMin meet" className={className} aria-hidden="true">
      <path d="M0 18 Q300 44 600 18 T1200 18" fill="none" stroke={C.marigoldDark} strokeWidth="3" />
      {strands.map((i) => {
        const x = 30 + i * 95;
        const sag = q(18 + Math.sin((x / 1200) * Math.PI * 2) * -13);
        const len = i % 2 === 0 ? 4 : 3;
        return (
          <g key={i}>
            <Leaf x={x} y={sag + 2} size={26} angle={i % 2 ? 60 : 120} />
            {Array.from({ length: len }, (_, j) => <Marigold key={j} x={x} y={sag + 16 + j * 19} r={9.5} />)}
            {i % 2 === 0 && <Rose x={x} y={sag + 16 + len * 19} r={8} />}
          </g>
        );
      })}
    </svg>
  );
}

/** Stylised couple with a varmala, drawn in flat shapes. */
export function Couple(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 260" aria-hidden="true" {...props}>
      {/* ground shadow */}
      <ellipse cx="120" cy="250" rx="92" ry="7" fill="#7a1c3d" opacity="0.12" />
      {/* Groom */}
      <path d="M150 112c16 0 28 10 30 26l8 104h-76l8-104c2-16 14-26 30-26Z" fill="#f7e6cf" />
      <path d="M150 112c16 0 28 10 30 26l8 104h-38z" fill="#efd6b4" />
      <path d="M150 116v126" stroke="#d9b98d" strokeWidth="1.5" />
      {[130, 146, 162, 178].map((y) => <circle key={y} cx="150" cy={y} r="2" fill="#c99a5b" />)}
      <path d="M126 160c-8 14-12 30-12 44" stroke="#efd6b4" strokeWidth="13" strokeLinecap="round" />
      <rect x="140" y="98" width="20" height="16" rx="6" fill="#e5b38e" />
      <circle cx="150" cy="84" r="20" fill="#e9b996" />
      <path d="M128 78c2-18 14-26 22-26 12 0 24 8 24 26-6-4-14-6-23-6s-17 2-23 6Z" fill="#c4466b" />
      <path d="M131 74c6-3 12-4 19-4s14 1 20 4" stroke="#f4a83a" strokeWidth="2.4" fill="none" />
      <path d="M170 64c8-2 14 4 12 14" stroke="#c4466b" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="150" cy="54" r="3.4" fill="#f4a83a" />
      {/* Bride */}
      <path d="M88 118c-14 0-24 9-27 22L36 244h104l-25-104c-3-13-13-22-27-22Z" fill="#c4234f" />
      <path d="M88 118c-14 0-24 9-27 22L36 244h40l12-126Z" fill="#a91a43" />
      <path d="M44 214h88M40 230h96" stroke="#f4a83a" strokeWidth="3" />
      {[52, 68, 84, 100, 116].map((x) => <circle key={x} cx={x} cy="222" r="2.2" fill="#f9c867" />)}
      <path d="M112 156c10 10 14 24 12 40" stroke="#c4234f" strokeWidth="12" strokeLinecap="round" />
      {/* dupatta */}
      <path d="M66 82c4-26 40-30 46-4 4 18 2 42 10 64l-12 4c-10-22-8-46-14-60-6 18-14 32-24 40l-10-6c10-12 4-24 4-38Z" fill="#e2668a" opacity="0.95" />
      <path d="M68 86c6-22 36-26 42-4" stroke="#f4a83a" strokeWidth="2.5" fill="none" />
      <circle cx="88" cy="74" r="2.6" fill="#f4a83a" />
      <rect x="79" y="102" width="18" height="16" rx="6" fill="#e3ab86" />
      <circle cx="88" cy="88" r="19" fill="#e6b28e" />
      <path d="M69 86c0-14 9-24 19-24s20 8 20 22c-6-6-12-9-20-9-7 0-13 4-19 11Z" fill="#3a1a1f" />
      {/* varmala */}
      <path d="M126 150c-8 22-30 22-40 0" fill="none" stroke="#f4a83a" strokeWidth="5" strokeDasharray="0.1 7" strokeLinecap="round" />
      <path d="M118 120c4 26 26 34 52 4" fill="none" stroke="#e2668a" strokeWidth="5" strokeDasharray="0.1 7" strokeLinecap="round" />
      {/* joined hands */}
      <circle cx="120" cy="198" r="7" fill="#e6b28e" />
      {/* hearts */}
      <path d="M120 34c-3-5-11-4-11 2 0 5 11 11 11 11s11-6 11-11c0-6-8-7-11-2Z" fill="#e2668a" />
      <path d="M196 30c-2-3-7-2-7 1 0 3 7 7 7 7s7-4 7-7c0-3-5-4-7-1Z" fill="#f2a0b4" />
      <path d="M38 50c-2-3-7-2-7 1 0 3 7 7 7 7s7-4 7-7c0-3-5-4-7-1Z" fill="#f2a0b4" />
    </svg>
  );
}

/** Arch of flowers framing the couple: the hero illustration. */
export function FloralArch({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  // Points around a rounded arch (semicircle top + straight sides), in a 400x520 box.
  const cx = 200, top = 190, r = 160;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI + (i / 16) * Math.PI;
    pts.push({ x: q(cx + Math.cos(a) * r), y: q(top + Math.sin(a) * r) });
  }
  for (let y = top + 40; y <= 480; y += 46) {
    pts.push({ x: cx - r, y });
    pts.push({ x: cx + r, y });
  }
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 400 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="arch-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde6ec" />
            <stop offset="0.6" stopColor="#fbd3dc" />
            <stop offset="1" stopColor="#f7bccb" />
          </linearGradient>
        </defs>
        <path d={`M${cx - r} 500V${top}a${r} ${r} 0 0 1 ${r * 2} 0V500Z`} fill="url(#arch-fill)" />
        <path d={`M${cx - r + 16} 500V${top}a${r - 16} ${r - 16} 0 0 1 ${(r - 16) * 2} 0V500`} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="2 6" />
        {pts.map((p, i) => <Leaf key={`l${i}`} x={p.x} y={p.y} size={34} angle={(i * 67) % 360} dark={i % 3 === 0} />)}
        {pts.map((p, i) =>
          i % 3 === 0 ? <Rose key={`f${i}`} x={p.x} y={p.y} r={17} />
          : i % 3 === 1 ? <Marigold key={`f${i}`} x={p.x} y={p.y} r={14} />
          : <Blossom key={`f${i}`} x={p.x + 4} y={p.y - 4} r={11} />,
        )}
        <Rose x={cx} y={top - r} r={24} />
        <Marigold x={cx - 30} y={top - r + 8} r={15} />
        <Marigold x={cx + 30} y={top - r + 8} r={15} />
      </svg>
      <div className="absolute inset-x-[16%] bottom-[4%] top-[22%]">{children}</div>
    </div>
  );
}

/** Small handwritten label, used instead of shouty uppercase eyebrows. */
export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`font-hand text-2xl ${light ? "text-petal-300" : "text-petal-600"}`}>{children}</p>;
}

/** A tiny heart-and-petal divider. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-petal-400 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-current" />
      <svg viewBox="0 0 24 22" className="h-4 w-4 text-petal-500" fill="currentColor"><path d="M12 21s-9-5.6-9-12A5 5 0 0 1 12 6a5 5 0 0 1 9 3c0 6.4-9 12-9 12Z" /></svg>
      <span className="h-px w-12 bg-current" />
    </div>
  );
}

/** Kept for backwards compatibility: now a soft floral ring instead of a mandala. */
export function Mandala(props: SVGProps<SVGSVGElement>) {
  const n = 12;
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" {...props}>
      <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 8" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const x = q(200 + Math.cos(a) * 150), y = q(200 + Math.sin(a) * 150);
        return (
          <g key={i} fill="currentColor">
            {[0, 72, 144, 216, 288].map((d) => {
              const b = (d * Math.PI) / 180;
              return <circle key={d} cx={q(x + Math.cos(b) * 7)} cy={q(y + Math.sin(b) * 7)} r={6.5} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

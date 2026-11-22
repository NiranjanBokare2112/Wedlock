import { FloralSpray } from "./ornaments";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={`relative ${dark ? "bg-wine-900 text-cream" : "bg-blush"}`}>
      <div className={`pointer-events-none absolute inset-0 overflow-hidden`}>
        <div className={`bg-jaali absolute inset-0 ${dark ? "opacity-25" : "opacity-60"}`} />
        <FloralSpray className="absolute -right-14 -top-14 h-40 w-40 opacity-70 sm:-right-12 sm:h-80 sm:w-80 sm:opacity-100" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-8 lg:pb-14 lg:pt-14">
        <p className={`font-hand text-2xl ${dark ? "text-petal-300" : "text-petal-600"}`}>{eyebrow}</p>
        <h1 className={`mt-2 max-w-3xl text-balance text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl ${dark ? "text-cream" : "text-wine-800"}`}>
          {title}
        </h1>
        {description && <p className={`mt-4 max-w-2xl text-lg leading-8 ${dark ? "text-cream/75" : "text-muted"}`}>{description}</p>}
        {children}
      </div>
    </section>
  );
}

import Link from "next/link";
import { Mandala } from "@/components/ornaments";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-5 text-center">
      <Mandala className="pointer-events-none absolute h-[600px] w-[600px] animate-spin-slow text-petal-500/15" />
      <div className="relative">
        <p className="font-serif text-8xl font-semibold text-petal-500">404</p>
        <h1 className="mt-2 text-4xl font-semibold text-wine-800">This page wandered off the baraat</h1>
        <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-wine-800 px-7 py-3.5 font-semibold text-cream hover:bg-wine-700">
          Back to home
        </Link>
      </div>
    </section>
  );
}

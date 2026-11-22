import { existsSync } from "node:fs";
import path from "node:path";

const EXTENSIONS = ["webp", "jpg", "jpeg", "png", "avif"];

/** Resolves /public/images/<name>.<ext> if a real photo has been added. */
export function photoSrc(name: string): string | null {
  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(process.cwd(), "public", "images", `${name}.${ext}`))) return `/images/${name}.${ext}`;
  }
  return null;
}

/**
 * Shows a real photograph when one exists in public/images, otherwise the illustrated fallback.
 * Drop e.g. `public/images/hero-couple.jpg` into the project to replace the illustration.
 */
export function Photo({
  name,
  alt,
  className = "",
  children,
}: {
  name: string;
  alt: string;
  className?: string;
  children: React.ReactNode;
}) {
  const src = photoSrc(name);
  if (!src) return <>{children}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
}

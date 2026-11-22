/**
 * Shows a photograph when a `src` is provided, otherwise the illustrated fallback.
 * Paths are known up front (see CATEGORY_PHOTOS), so this works the same locally and on Vercel.
 */
export function Photo({
  src,
  alt,
  className = "",
  children,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!src) return <>{children}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
}

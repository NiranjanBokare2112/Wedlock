/** Continuously gliding strip of real wedding moments. Pauses on hover/focus. */
export function MomentsRail({ photos }: { photos: { src: string; caption: string }[] }) {
  const loop = [...photos, ...photos];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <ul className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        {loop.map((photo, i) => (
          <li key={`${photo.src}-${i}`} aria-hidden={i >= photos.length} className="relative h-72 w-56 shrink-0 overflow-hidden rounded-[1.5rem] sm:h-80 sm:w-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={i < photos.length ? photo.caption : ""} loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-wine-950/70 to-transparent p-4 pt-10 font-hand text-2xl text-white">
              {photo.caption}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

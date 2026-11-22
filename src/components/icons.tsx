import type { SVGProps } from "react";
import type { IconName } from "@/lib/site";

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const VenueIcon = (p: P) => (
  <Base {...p}><path d="M3 21h18M5 21V10.5L12 4l7 6.5V21" /><path d="M9.5 21v-4.5a2.5 2.5 0 0 1 5 0V21" /><path d="M12 4V2" /></Base>
);
export const CameraIcon = (p: P) => (
  <Base {...p}><path d="M3.5 8.5h3l1.8-2.8h7.4l1.8 2.8h3V19h-17z" /><circle cx="12" cy="13.2" r="3.4" /></Base>
);
export const CateringIcon = (p: P) => (
  <Base {...p}><path d="M2.5 18h19M4.5 18a7.5 7.5 0 0 1 15 0" /><path d="M12 10.5V8.5M10 8.5h4" /></Base>
);
export const FlowerIcon = (p: P) => (
  <Base {...p}><circle cx="12" cy="12" r="2.2" /><path d="M12 9.8c-2-2.2-2-5.3 0-6.8 2 1.5 2 4.6 0 6.8ZM14.2 12c2.2-2 5.3-2 6.8 0-1.5 2-4.6 2-6.8 0ZM12 14.2c2 2.2 2 5.3 0 6.8-2-1.5-2-4.6 0-6.8ZM9.8 12c-2.2 2-5.3 2-6.8 0 1.5-2 4.6-2 6.8 0Z" /></Base>
);
export const BeautyIcon = (p: P) => (
  <Base {...p}><path d="M8.5 21h7v-7.5h-7z" /><path d="M9.5 13.5V8.2L14.5 5v8.5" /><path d="M7 21h10" /></Base>
);
export const PlanningIcon = (p: P) => (
  <Base {...p}><rect x="5" y="4.5" width="14" height="16.5" rx="2" /><path d="M9 4.5V3h6v1.5M9 12.5l2 2 4-4.2" /></Base>
);
export const SearchIcon = (p: P) => (
  <Base {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Base>
);
export const PinIcon = (p: P) => (
  <Base {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10" r="2.3" /></Base>
);
export const ArrowRightIcon = (p: P) => (
  <Base {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Base>
);
export const CheckIcon = (p: P) => (
  <Base {...p}><path d="m5 12.5 4.2 4.2L19 7" /></Base>
);
export const MenuIcon = (p: P) => (
  <Base {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Base>
);
export const CloseIcon = (p: P) => (
  <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>
);
export const ShieldIcon = (p: P) => (
  <Base {...p}><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z" /><path d="m9 12 2 2 4-4" /></Base>
);
export const CalendarIcon = (p: P) => (
  <Base {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Base>
);
export const UsersIcon = (p: P) => (
  <Base {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" /><path d="M16 5.6a3 3 0 0 1 0 5.8M18 14.8c1.6.6 2.7 2 3 4.2" /></Base>
);
export const WalletIcon = (p: P) => (
  <Base {...p}><path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5V6a1.5 1.5 0 0 1 1.5-1.5H17" /><circle cx="16" cy="13.8" r="1.2" /></Base>
);
export const QuoteIcon = (p: P) => (
  <Base {...p}><path d="M6 3.5h8.5L19 8v12.5H6z" /><path d="M14 3.5V8h5M9 12.5h6M9 16h6" /></Base>
);
export const SparkleIcon = (p: P) => (
  <Base {...p}><path d="M12 3c.6 4.5 2.5 6.4 7 7-4.5.6-6.4 2.5-7 7-.6-4.5-2.5-6.4-7-7 4.5-.6 6.4-2.5 7-7Z" /><path d="M19 16.5c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2Z" /></Base>
);
export const LockIcon = (p: P) => (
  <Base {...p}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Base>
);
export const StarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="m12 3.2 2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9L3.4 9.4l6-.7z" />
  </svg>
);

const CATEGORY_ICONS: Record<IconName, (p: P) => React.JSX.Element> = {
  venue: VenueIcon,
  camera: CameraIcon,
  catering: CateringIcon,
  flower: FlowerIcon,
  beauty: BeautyIcon,
  planning: PlanningIcon,
};

export function CategoryIcon({ name, ...props }: P & { name: IconName }) {
  const Icon = CATEGORY_ICONS[name];
  return <Icon {...props} />;
}

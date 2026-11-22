export function StatCard({
  icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border p-4 sm:p-6 ${accent ? "border-wine-800 bg-wine-800 text-cream" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between">
        <p className={`text-sm font-medium ${accent ? "text-cream/70" : "text-muted"}`}>{label}</p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10 ${accent ? "bg-petal-500 text-white" : "bg-blush text-petal-600"}`}>{icon}</span>
      </div>
      <p className={`mt-3 font-serif text-4xl font-semibold leading-none sm:text-5xl ${accent ? "text-cream" : "text-wine-800"}`}>{value}</p>
      {hint && <p className={`mt-3 text-xs ${accent ? "text-petal-300" : "text-muted"}`}>{hint}</p>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-petal-300/40 text-petal-600",
  OPEN: "bg-petal-300/40 text-petal-600",
  UNLOCKED: "bg-[#3a6584]/10 text-[#2d4f6b]",
  QUOTATION_SENT: "bg-wine-800/10 text-wine-700",
  SENT: "bg-wine-800/10 text-wine-700",
  PUBLISHED: "bg-wine-800/10 text-wine-700",
  WON: "bg-wine-800 text-petal-300",
  ACCEPTED: "bg-wine-800 text-petal-300",
  QUOTE_ACCEPTED: "bg-wine-800 text-petal-300",
  PENDING_APPROVAL: "bg-maroon/10 text-maroon",
};

export function StatusBadge({ status }: { status?: string }) {
  const value = status || "UNKNOWN";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${STATUS_STYLES[value] ?? "bg-line text-muted"}`}>
      {value.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-[1.75rem] border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line px-6 py-5">
        <h2 className="text-2xl font-semibold text-wine-800">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-petal-400/40 bg-white/70 px-4 py-1.5 text-xs text-muted backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-petal-500" />
      {children}
    </p>
  );
}

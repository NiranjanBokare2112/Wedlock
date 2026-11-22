"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { IconName } from "@/lib/site";
import { CategoryIcon, CheckIcon } from "./icons";

export type SelectOption = { value: string; label: string; hint?: string; icon?: IconName };

type Variant = "field" | "bare" | "dark" | "compact";

type Props = {
  options: SelectOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  leading?: React.ReactNode;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  align?: "left" | "right";
};

const TRIGGER: Record<Variant, string> = {
  field: "h-12 w-full rounded-2xl border border-line bg-cream/70 px-4 hover:border-petal-400 data-[open=true]:border-petal-500 data-[open=true]:bg-white data-[open=true]:ring-4 data-[open=true]:ring-petal-300/40",
  bare: "h-12 w-full rounded-2xl px-4 hover:bg-blush/60 data-[open=true]:bg-blush/70",
  dark: "h-9 rounded-full bg-white/10 px-4 text-cream hover:bg-white/15",
  compact: "h-9 rounded-xl border border-line bg-white px-3 text-sm hover:border-petal-400",
};

export function Select({
  options,
  name,
  value,
  defaultValue = "",
  onChange,
  placeholder = "Select",
  ariaLabel,
  leading,
  variant = "field",
  className = "",
  disabled = false,
  align = "left",
}: Props) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const id = useId();
  const selected = options.find((o) => o.value === current);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === current)));
    setOpen(true);
  }

  function choose(option: SelectOption) {
    if (value === undefined) setInternal(option.value);
    onChange?.(option.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)); break;
      case "ArrowUp": e.preventDefault(); setActive((i) => Math.max(0, i - 1)); break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End": e.preventDefault(); setActive(options.length - 1); break;
      case "Enter":
      case " ": e.preventDefault(); if (options[active]) choose(options[active]); break;
      case "Escape": e.preventDefault(); setOpen(false); break;
      case "Tab": setOpen(false); break;
      default:
        if (e.key.length === 1) {
          const now = Date.now();
          typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : "") + e.key.toLowerCase(), at: now };
          const match = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
          if (match >= 0) setActive(match);
        }
    }
  }

  return (
    <div ref={root} className={`relative ${variant === "dark" || variant === "compact" ? "inline-block" : "w-full"} ${className}`}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        disabled={disabled}
        data-open={open}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex items-center gap-2.5 text-left text-[15px] outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${TRIGGER[variant]}`}
      >
        {leading && <span className={variant === "dark" ? "text-petal-300" : "text-petal-500"}>{leading}</span>}
        {selected?.icon && !leading && <CategoryIcon name={selected.icon} className="h-[18px] w-[18px] shrink-0 text-petal-500" />}
        <span className={`min-w-0 flex-1 truncate ${selected ? "" : variant === "dark" ? "text-cream/60" : "text-muted/80"} ${variant === "dark" ? "font-semibold" : ""}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""} ${variant === "dark" ? "text-petal-300" : "text-petal-500"}`} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 mt-2 max-h-72 min-w-full overflow-auto rounded-2xl border border-line bg-white p-1.5 text-ink shadow-[0_24px_50px_-20px_rgba(122,28,61,0.45)] ${align === "right" ? "right-0" : "left-0"} ${variant === "dark" || variant === "compact" ? "w-max max-w-[min(320px,90vw)]" : ""}`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === current;
            return (
              <li
                key={option.value || `empty-${index}`}
                id={`${id}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(option)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${index === active ? "bg-blush" : ""} ${isSelected ? "font-semibold text-wine-800" : ""}`}
              >
                {option.icon && (
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isSelected ? "bg-wine-800 text-petal-200" : "bg-petal-200 text-petal-600"}`}>
                    <CategoryIcon name={option.icon} className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  {option.hint && <span className="block truncate text-xs font-normal text-muted">{option.hint}</span>}
                </span>
                {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-petal-500" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

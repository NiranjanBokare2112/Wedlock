"use client";

import { useState } from "react";
import { resetDemo } from "@/lib/demo/client";

/** Restores the original demo data (clears this browser's requirements, leads, quotes and plan changes). */
export function ResetDemoButton({ className = "" }: { className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (!window.confirm("Reset the demo? This clears requirements, enquiries, unlocked leads, quotes and plan changes made in this browser.")) return;
        resetDemo();
        setDone(true);
        window.setTimeout(() => setDone(false), 2500);
      }}
      className={`font-semibold underline-offset-4 hover:underline ${className}`}
    >
      {done ? "Demo data reset ✓" : "Reset demo data"}
    </button>
  );
}

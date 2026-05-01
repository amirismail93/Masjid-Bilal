"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="bg-gold/10 border-y border-gold/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold shrink-0">
            <Bell className="size-4" />
          </div>
          <p className="text-sm text-charcoal truncate">
            <span className="font-semibold">Announcement:</span>{" "}
            Ramadan 2026 begins on February 28th, insha&apos;Allah. View the full Ramadan schedule and
            Taraweeh times on our Prayer Times page.
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gold/15 text-charcoal/50 hover:text-charcoal transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="size-4" />
        </button>
      </div>
    </section>
  );
}

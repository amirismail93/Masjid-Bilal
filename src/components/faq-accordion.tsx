"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-warm-gray/30 transition-colors"
            >
              <span className="font-medium text-sm text-charcoal pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

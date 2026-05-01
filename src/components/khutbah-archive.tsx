"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Play, Clock } from "lucide-react";

interface Khutbah {
  title: string;
  imam: string;
  date: string;
  duration: string;
}

const khutbahs: Khutbah[] = [
  { title: "The Mercy of Allah", imam: "Imam Ahmad Hassan", date: "Mar 7, 2026", duration: "32 min" },
  { title: "Patience in Times of Trial", imam: "Imam Ahmad Hassan", date: "Feb 28, 2026", duration: "28 min" },
  { title: "Community & Brotherhood in Islam", imam: "Sheikh Omar Farooq", date: "Feb 21, 2026", duration: "35 min" },
  { title: "Purification of the Heart", imam: "Imam Ahmad Hassan", date: "Feb 14, 2026", duration: "30 min" },
  { title: "Lessons from Surah Yusuf", imam: "Dr. Fatima Ali", date: "Feb 7, 2026", duration: "40 min" },
  { title: "The Rights of Neighbors", imam: "Imam Ahmad Hassan", date: "Jan 31, 2026", duration: "27 min" },
];

export function KhutbahArchive() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return khutbahs;
    const q = query.toLowerCase();
    return khutbahs.filter(
      (k) =>
        k.title.toLowerCase().includes(q) ||
        k.imam.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search khutbahs by title or speaker…"
          className="w-full rounded-xl border border-border bg-warm-white pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
        />
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((k) => (
            <Card
              key={k.title}
              className="bg-card border-border/60 hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                {/* Play button */}
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white transition-colors shrink-0">
                  <Play className="size-4 ml-0.5" />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-sm font-semibold text-charcoal truncate group-hover:text-sage transition-colors">
                    {k.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{k.imam}</p>
                </div>

                {/* Meta */}
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {k.date}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {k.duration}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No khutbahs match your search.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="text-center mt-5">
          <Button
            variant="outline"
            className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-sm"
          >
            Load More Khutbahs
          </Button>
        </div>
      )}
    </div>
  );
}

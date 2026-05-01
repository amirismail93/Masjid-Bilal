"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sunrise } from "lucide-react";
import type { PrayerEntry } from "@/lib/masjidal";
import { getNextPrayerIndex } from "@/lib/masjidal";

interface Props {
  prayers: PrayerEntry[];
  hijriDate: string;
  hijriMonth: string;
  sunrise: string;
}

export function LivePrayerGrid({ prayers, hijriDate, hijriMonth, sunrise }: Props) {
  const nextIdx = getNextPrayerIndex(prayers);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-charcoal">
              Today&apos;s Prayer Times
            </h2>
            <p className="text-xs text-muted-foreground">
              {hijriDate} {hijriMonth}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sunrise className="size-3.5" />
          Sunrise: {sunrise}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {prayers.map((p, i) => {
          const isNext = i === nextIdx;
          return (
            <Card
              key={p.name}
              className={`border overflow-hidden transition-shadow ${
                isNext
                  ? "bg-gold/10 ring-2 ring-gold/40 border-gold/30 shadow-md"
                  : "bg-card border-border/60"
              }`}
            >
              <CardContent className="p-4 text-center">
                {isNext && (
                  <Badge className="bg-gold text-white border-0 text-[10px] mb-2 mx-auto">
                    Next
                  </Badge>
                )}
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                    isNext ? "text-gold-dark" : "text-sage"
                  }`}
                >
                  {p.name}
                </p>
                <p className="font-heading text-lg font-bold text-charcoal">
                  {p.adhan}
                </p>
                <p className="font-heading text-lg font-bold text-sage mt-0.5">
                  {p.iqama}
                </p>
                <p className="text-[10px] text-muted-foreground">Iqama</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

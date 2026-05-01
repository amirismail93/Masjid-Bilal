"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Trash2, Users } from "lucide-react";
import type { EventPage, EventRegistration } from "@/types/database";

export default function RegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [event, setEvent] = useState<EventPage | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  const fetchData = useCallback(async () => {
    const [{ data: ev }, { data: regs }] = await Promise.all([
      supabase.from("event_pages").select("*").eq("id", id).single(),
      supabase
        .from("event_registrations")
        .select("*")
        .eq("event_page_id", id)
        .order("created_at", { ascending: false }),
    ]);
    setEvent(ev as EventPage | null);
    setRegistrations((regs as EventRegistration[]) ?? []);
  }, [supabase, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteReg = async (regId: string) => {
    await supabase.from("event_registrations").delete().eq("id", regId);
    setRegistrations((prev) => prev.filter((r) => r.id !== regId));
  };

  const exportCsv = () => {
    if (!event || registrations.length === 0) return;
    const fields = event.registration_fields;
    const header = ["#", ...fields.map((f) => f.label), "Submitted At"].join(
      ","
    );
    const rows = registrations.map((r, i) =>
      [
        i + 1,
        ...fields.map((f) => `"${(r.data[f.key] ?? "").replace(/"/g, '""')}"`),
        new Date(r.created_at).toLocaleString(),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  const fields = event.registration_fields;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/event-pages">
          <Button
            variant="outline"
            className="rounded-full h-8 w-8 p-0 border-border"
          >
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-charcoal">
            {event.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            /events/{event.slug} · Registrations
          </p>
        </div>
        <Badge className="bg-sage/10 text-sage border-0 text-xs">
          <Users className="size-3 mr-1" />
          {registrations.length}
          {event.max_registrations ? ` / ${event.max_registrations}` : ""}
        </Badge>
        <Button
          variant="outline"
          onClick={exportCsv}
          disabled={registrations.length === 0}
          className="rounded-full text-xs h-8 px-4 border-sage text-sage hover:bg-sage hover:text-white"
        >
          <Download className="size-3.5 mr-1" />
          Export CSV
        </Button>
      </div>

      {registrations.length === 0 ? (
        <Card className="bg-card border-border/60">
          <CardContent className="p-10 text-center text-muted-foreground text-sm">
            No registrations yet.
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-warm-white">
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  {fields.map((f) => (
                    <th
                      key={f.key}
                      className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {f.label}
                    </th>
                  ))}
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {registrations.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/30 hover:bg-warm-white/50"
                  >
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {i + 1}
                    </td>
                    {fields.map((f) => (
                      <td
                        key={f.key}
                        className="px-4 py-2.5 text-charcoal"
                      >
                        {r.data[f.key] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-2.5">
                      <button
                        onClick={() => deleteReg(r.id)}
                        className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

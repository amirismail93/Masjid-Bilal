"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { NikahRequest } from "@/types/database";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Cancelled"] as const;

const statusColors: Record<string, string> = {
  Pending: "bg-gold/10 text-gold-dark",
  Confirmed: "bg-sage/10 text-sage",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default function NikahRequestsAdmin() {
  const supabase = createClient();
  const [rows, setRows] = useState<NikahRequest[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("nikah_requests")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (filter !== "All") {
      query = query.eq("status", filter);
    }
    const { data } = await query;
    setRows((data as NikahRequest[]) ?? []);
    setLoading(false);
  }, [filter, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from("nikah_requests").update({ status: newStatus }).eq("id", id);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">
            Nikah Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage nikah ceremony requests
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-warm-gray rounded-lg p-1 w-fit mb-6">
        {["All", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === s
                ? "bg-card text-charcoal shadow-sm"
                : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Loading…</p>
      ) : rows.length === 0 ? (
        <Card className="bg-card border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            No nikah requests found.
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-warm-gray/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Bride
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Groom
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isOpen = expandedId === r.id;
                    return (
                      <>
                        <tr
                          key={r.id}
                          onClick={() => setExpandedId(isOpen ? null : r.id)}
                          className="border-b border-border/20 hover:bg-warm-gray/20 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 text-charcoal text-xs">
                            {r.submitted_at
                              ? new Date(r.submitted_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-charcoal font-medium">
                            {r.bride_name}
                          </td>
                          <td className="px-4 py-3 text-charcoal font-medium">
                            {r.groom_name}
                          </td>
                          <td className="px-4 py-3 text-charcoal">
                            {r.requested_date}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={r.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleStatusChange(r.id, e.target.value)
                              }
                              className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${
                                statusColors[r.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {isOpen ? (
                              <ChevronUp className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={r.id + "-details"}>
                            <td
                              colSpan={6}
                              className="px-6 py-4 bg-warm-gray/30 border-b border-border/20"
                            >
                              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                <Detail label="Bride's Wali" value={r.wali_name} />
                                <Detail label="Wali Phone" value={r.wali_phone} />
                                <Detail label="Groom Phone" value={r.groom_phone} />
                                <Detail label="Email" value={r.user_email} />
                                <Detail label="Time" value={r.requested_time} />
                                <Detail label="Location" value={r.location_preference} />
                                <Detail
                                  label="Notes"
                                  value={r.additional_notes || "—"}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-charcoal font-medium">{value}</p>
    </div>
  );
}

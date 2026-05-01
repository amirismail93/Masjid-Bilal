"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, TrendingUp, Calendar, Download, Filter,
  CheckCircle2, XCircle, Clock, RefreshCw,
  Users, Repeat,
} from "lucide-react";
import type { Payment } from "@/types/database";

/* ── Helpers ──────────────────────────────────────── */
function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-sage/10 text-sage",
  pending: "bg-gold/10 text-gold-dark",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="size-3.5" />,
  pending: <Clock className="size-3.5" />,
  failed: <XCircle className="size-3.5" />,
  refunded: <RefreshCw className="size-3.5" />,
};

type DateRange = "7d" | "30d" | "90d" | "12m" | "all";

function dateRangeFilter(range: DateRange): Date | null {
  const now = new Date();
  switch (range) {
    case "7d": return new Date(now.getTime() - 7 * 86400000);
    case "30d": return new Date(now.getTime() - 30 * 86400000);
    case "90d": return new Date(now.getTime() - 90 * 86400000);
    case "12m": return new Date(now.getTime() - 365 * 86400000);
    default: return null;
  }
}

export default function AdminPaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("payments").select("*").order("created_at", { ascending: false });
    const rangeDate = dateRangeFilter(dateRange);
    if (rangeDate) {
      query = query.gte("created_at", rangeDate.toISOString());
    }
    const { data } = await query;
    setPayments((data as Payment[]) ?? []);
    setLoading(false);
  }, [supabase, dateRange]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  /* ── Derived data ──────────────────────────────── */
  const filtered = useMemo(() => {
    let result = payments;
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);
    return result;
  }, [payments, statusFilter, categoryFilter]);

  const categories = useMemo(() =>
    Array.from(new Set(payments.map((p) => p.category))).sort(),
    [payments]
  );

  const completedPayments = useMemo(() => filtered.filter((p) => p.status === "completed"), [filtered]);
  const totalRevenue = useMemo(() => completedPayments.reduce((s, p) => s + p.amount, 0), [completedPayments]);
  const avgDonation = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;
  const recurringCount = completedPayments.filter((p) => p.is_recurring).length;
  const uniqueDonors = new Set(completedPayments.map((p) => p.donor_email).filter(Boolean)).size;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    completedPayments.forEach((p) => {
      if (!map[p.category]) map[p.category] = { total: 0, count: 0 };
      map[p.category].total += p.amount;
      map[p.category].count += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [completedPayments]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    completedPayments.forEach((p) => {
      const d = new Date(p.created_at);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (key in months) months[key] += p.amount;
    });
    return Object.entries(months);
  }, [completedPayments]);

  const maxMonthly = Math.max(...monthlyTrend.map(([, v]) => v), 1);

  /* ── CSV Export ─────────────────────────────────── */
  const exportCSV = () => {
    const rows = [
      ["Date", "Status", "Amount", "Category", "Designation", "Donor Name", "Donor Email", "Recurring", "Stripe ID"],
      ...filtered.map((p) => [
        shortDate(p.created_at),
        p.status,
        (p.amount / 100).toFixed(2),
        p.category,
        p.designation || "",
        p.donor_name || "",
        p.donor_email || "",
        p.is_recurring ? "Yes" : "No",
        p.stripe_payment_id || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-report-${dateRange}.csv`;
    a.click();
    showToast("CSV exported.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">Payments Report</h1>
        <p className="text-sm text-muted-foreground">Track donations, view trends, and manage payment records.</p>
      </div>

      {toast && <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium"><CheckCircle2 className="size-4" />{toast}</div>}

      {/* ── Filters ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-xl p-1">
          {(["7d", "30d", "90d", "12m", "all"] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                dateRange === r ? "bg-sage text-white shadow-sm" : "text-muted-foreground hover:text-charcoal"
              }`}
            >
              {r === "all" ? "All Time" : r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-warm-white px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-warm-white px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <Button onClick={exportCSV} variant="outline" className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs px-5 h-9">
            <Download className="size-3.5 mr-1.5" />Export CSV
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <DollarSign className="size-4" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
            </div>
            <p className="font-heading text-2xl font-bold text-charcoal">{fmt(totalRevenue)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{completedPayments.length} completed payments</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <TrendingUp className="size-4" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Avg Donation</p>
            </div>
            <p className="font-heading text-2xl font-bold text-charcoal">{fmt(avgDonation)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">per completed payment</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Repeat className="size-4" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recurring</p>
            </div>
            <p className="font-heading text-2xl font-bold text-charcoal">{recurringCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1">active subscriptions</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Users className="size-4" />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Unique Donors</p>
            </div>
            <p className="font-heading text-2xl font-bold text-charcoal">{uniqueDonors}</p>
            <p className="text-[10px] text-muted-foreground mt-1">by email address</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Monthly Trend (bar chart) ──────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-6">
          <h2 className="font-heading text-base font-bold text-charcoal mb-4">Monthly Trend</h2>
          <div className="flex items-end gap-3 h-40">
            {monthlyTrend.map(([label, value]) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-charcoal">{fmt(value)}</span>
                <div className="w-full rounded-t-lg bg-sage/20 relative" style={{ height: `${Math.max((value / maxMonthly) * 100, 4)}%` }}>
                  <div className="absolute inset-0 rounded-t-lg bg-sage" style={{ height: "100%" }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Category Breakdown ─────────────────────── */}
      {categoryBreakdown.length > 0 && (
        <Card className="bg-card border-border/60">
          <CardContent className="p-6">
            <h2 className="font-heading text-base font-bold text-charcoal mb-4">By Category</h2>
            <div className="space-y-3">
              {categoryBreakdown.map(([cat, { total, count }]) => {
                const pct = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-charcoal capitalize">{cat.replace(/_/g, " ")}</span>
                      <span className="text-sm font-bold text-charcoal">{fmt(total)} <span className="text-[10px] text-muted-foreground font-normal">({count})</span></span>
                    </div>
                    <div className="h-2 bg-warm-gray/50 rounded-full overflow-hidden">
                      <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Transactions List ──────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-bold text-charcoal">
              Transactions ({filtered.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground text-sm py-10">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-10">No payments found for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Donor</th>
                    <th className="text-left py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-right py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-center py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-center py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-warm-gray/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span className="text-xs text-charcoal">{shortDate(p.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-xs font-medium text-charcoal truncate max-w-[150px]">{p.donor_name || "Anonymous"}</p>
                          {p.donor_email && <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{p.donor_email}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className="text-[9px] bg-warm-gray/60 text-muted-foreground border-0 capitalize">
                          {(p.designation || p.category).replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`text-sm font-bold ${p.status === "refunded" ? "text-muted-foreground line-through" : "text-charcoal"}`}>
                          {fmt(p.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={`text-[9px] border-0 inline-flex items-center gap-1 ${STATUS_COLORS[p.status] || ""}`}>
                          {STATUS_ICONS[p.status]}{p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {p.is_recurring ? (
                          <Badge className="text-[9px] bg-sage/10 text-sage border-0 inline-flex items-center gap-0.5">
                            <Repeat className="size-2.5" />{p.recurring_interval || "monthly"}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">one-time</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

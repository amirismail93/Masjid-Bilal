"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, CheckCircle2, Mail, Building2, FileText, Filter } from "lucide-react";
import type { ContactSubmission, RentalSubmission, FormSubmission } from "@/types/database";

type Tab = "contact" | "rental" | "all";

export default function AdminSubmissionsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("contact");
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [rentals, setRentals] = useState<RentalSubmission[]>([]);
  const [generic, setGeneric] = useState<FormSubmission[]>([]);
  const [slugFilter, setSlugFilter] = useState<string>("all");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    setContacts((data as ContactSubmission[]) ?? []);
  }, [supabase]);

  const fetchRentals = useCallback(async () => {
    const { data } = await supabase.from("rental_submissions").select("*").order("created_at", { ascending: false });
    setRentals((data as RentalSubmission[]) ?? []);
  }, [supabase]);

  const fetchGeneric = useCallback(async () => {
    const { data } = await supabase.from("form_submissions").select("*").order("created_at", { ascending: false });
    setGeneric((data as FormSubmission[]) ?? []);
  }, [supabase]);

  useEffect(() => { fetchContacts(); fetchRentals(); fetchGeneric(); }, [fetchContacts, fetchRentals, fetchGeneric]);

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await supabase.from("contact_submissions").delete().eq("id", id);
    fetchContacts(); showToast("Deleted.");
  };

  const deleteRental = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await supabase.from("rental_submissions").delete().eq("id", id);
    fetchRentals(); showToast("Deleted.");
  };

  const deleteGeneric = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await supabase.from("form_submissions").delete().eq("id", id);
    fetchGeneric(); showToast("Deleted.");
  };

  const exportCSV = (type: Tab) => {
    let csv = "";
    if (type === "contact") {
      csv = [["Name","Email","Phone","Subject","Message","Date"],
        ...contacts.map(c => [c.full_name, c.email, c.phone ?? "", c.subject, c.message.replace(/"/g,"'"), new Date(c.created_at).toLocaleDateString()])
      ].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    } else {
      csv = [["Name","Email","Phone","Event Type","Date","Guests","Notes","Submitted"],
        ...rentals.map(r => [r.full_name, r.email, r.phone, r.event_type, r.preferred_date, r.expected_guests, r.notes ?? "", new Date(r.created_at).toLocaleDateString()])
      ].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${type}-submissions.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">Form Submissions</h1>
        <p className="text-sm text-muted-foreground">View contact messages and rental requests from the public site.</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />{toast}
        </div>
      )}

      <div className="flex gap-1 bg-warm-gray/50 rounded-xl p-1">
        <button onClick={() => setTab("contact")} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${tab === "contact" ? "bg-white text-charcoal shadow-sm" : "text-muted-foreground hover:text-charcoal"}`}>
          <Mail className="size-3.5" />Contact Messages
          {contacts.length > 0 && <Badge className="text-[9px] bg-sage/10 text-sage border-0">{contacts.length}</Badge>}
        </button>
        <button onClick={() => setTab("rental")} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${tab === "rental" ? "bg-white text-charcoal shadow-sm" : "text-muted-foreground hover:text-charcoal"}`}>
          <Building2 className="size-3.5" />Rental Requests
          {rentals.length > 0 && <Badge className="text-[9px] bg-sage/10 text-sage border-0">{rentals.length}</Badge>}
        </button>
        <button onClick={() => setTab("all")} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${tab === "all" ? "bg-white text-charcoal shadow-sm" : "text-muted-foreground hover:text-charcoal"}`}>
          <FileText className="size-3.5" />All Forms
          {generic.length > 0 && <Badge className="text-[9px] bg-sage/10 text-sage border-0">{generic.length}</Badge>}
        </button>
      </div>

      {tab === "contact" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => exportCSV("contact")} variant="outline" className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs px-5 h-9">
              <Download className="size-3.5 mr-1.5" />Export CSV
            </Button>
          </div>
          {contacts.length === 0 ? (
            <Card className="bg-card border-border/60"><CardContent className="p-10 text-center text-muted-foreground text-sm">No contact submissions yet.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <Card key={c.id} className="bg-card border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-heading text-sm font-bold text-charcoal">{c.full_name}</p>
                          <Badge className="text-[9px] bg-warm-gray/60 text-muted-foreground border-0">{c.subject}</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                        <p className="text-sm text-charcoal whitespace-pre-wrap">{c.message}</p>
                      </div>
                      <button onClick={() => deleteContact(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "rental" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => exportCSV("rental")} variant="outline" className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs px-5 h-9">
              <Download className="size-3.5 mr-1.5" />Export CSV
            </Button>
          </div>
          {rentals.length === 0 ? (
            <Card className="bg-card border-border/60"><CardContent className="p-10 text-center text-muted-foreground text-sm">No rental requests yet.</CardContent></Card>
          ) : (
            <Card className="bg-card border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-warm-gray/50">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Event</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Guests</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-[60px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map((r) => (
                        <tr key={r.id} className="border-b border-border/20 hover:bg-warm-gray/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-charcoal">{r.full_name}</td>
                          <td className="px-4 py-3"><p className="text-xs text-charcoal">{r.email}</p><p className="text-[10px] text-muted-foreground">{r.phone}</p></td>
                          <td className="px-4 py-3 text-charcoal text-xs">{r.event_type}</td>
                          <td className="px-4 py-3 text-charcoal text-xs">{r.preferred_date}</td>
                          <td className="px-4 py-3 text-charcoal text-xs">{r.expected_guests}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => deleteRental(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {tab === "all" && (() => {
        const slugs = Array.from(new Set(generic.map((g) => g.form_slug))).sort();
        const filtered = slugFilter === "all" ? generic : generic.filter((g) => g.form_slug === slugFilter);
        return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-muted-foreground" />
              <select
                value={slugFilter}
                onChange={(e) => setSlugFilter(e.target.value)}
                className="rounded-lg border border-border bg-warm-white px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
              >
                <option value="all">All Forms ({generic.length})</option>
                {slugs.map((s) => (
                  <option key={s} value={s}>{s} ({generic.filter((g) => g.form_slug === s).length})</option>
                ))}
              </select>
            </div>
            <Button onClick={() => {
              const csv = [["Form","Date","Data"], ...filtered.map(g => [g.form_slug, new Date(g.created_at).toLocaleDateString(), JSON.stringify(g.data).replace(/"/g, "'")])].
                map(r => r.map(c => `"${c}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `form-submissions${slugFilter !== "all" ? "-" + slugFilter : ""}.csv`; a.click();
            }} variant="outline" className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs px-5 h-9">
              <Download className="size-3.5 mr-1.5" />Export CSV
            </Button>
          </div>
          {filtered.length === 0 ? (
            <Card className="bg-card border-border/60"><CardContent className="p-10 text-center text-muted-foreground text-sm">{generic.length === 0 ? "No form submissions yet." : "No submissions match this filter."}</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((g) => (
                <Card key={g.id} className="bg-card border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge className="text-[9px] bg-sage/10 text-sage border-0">{g.form_slug}</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                          {Object.entries(g.data).filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} className="flex gap-1.5 text-xs">
                              <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}:</span>
                              <span className="text-charcoal font-medium truncate">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => deleteGeneric(g.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        );
      })()}
    </div>
  );
}

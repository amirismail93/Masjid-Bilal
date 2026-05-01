"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CheckCircle2, Trash2, DollarSign } from "lucide-react";
import Link from "next/link";
import type { ClassItem, ClassEnrollment } from "@/types/database";

export default function ClassEnrollmentsPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [cls, setCls] = useState<ClassItem | null>(null);
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetch = useCallback(async () => {
    const [{ data: classData }, { data: enrollData }] = await Promise.all([
      supabase.from("classes").select("*").eq("id", id).single(),
      supabase.from("class_enrollments").select("*").eq("class_id", id).order("created_at", { ascending: false }),
    ]);
    setCls(classData as ClassItem);
    setEnrollments((enrollData as ClassEnrollment[]) ?? []);
  }, [supabase, id]);

  useEffect(() => { fetch(); }, [fetch]);

  const updatePayment = async (enrollId: string, status: "paid" | "unpaid" | "waived") => {
    await supabase.from("class_enrollments").update({ payment_status: status }).eq("id", enrollId);
    fetch();
    showToast(`Payment marked as ${status}`);
  };

  const deleteEnrollment = async (enrollId: string) => {
    if (!confirm("Remove this student?")) return;
    await supabase.from("class_enrollments").delete().eq("id", enrollId);
    fetch();
    showToast("Student removed.");
  };

  const exportCSV = () => {
    const headers = ["Student Name", "Email", "Phone", "Payment Status", "Amount", "Registered"];
    const rows = enrollments.map((e) => [
      e.student_name, e.student_email, e.student_phone, e.payment_status,
      e.payment_amount?.toString() ?? "", new Date(e.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `enrollments-${cls?.title ?? id}.csv`; a.click();
  };

  if (!cls) return <div className="text-center py-20 text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/classes" className="p-2 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-charcoal">{cls.title}</h1>
          <p className="text-sm text-muted-foreground">{enrollments.length} enrolled{cls.capacity ? ` / ${cls.capacity} capacity` : ""} · ${cls.cost} per student</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs px-5 h-9">
          <Download className="size-3.5 mr-1.5" />Export CSV
        </Button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />{toast}
        </div>
      )}

      {enrollments.length === 0 ? (
        <Card className="bg-card border-border/60">
          <CardContent className="p-10 text-center text-muted-foreground text-sm">No enrollments yet.</CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-warm-gray/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Registered</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id} className="border-b border-border/20 hover:bg-warm-gray/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-charcoal">{e.student_name}</td>
                      <td className="px-4 py-3">
                        <p className="text-charcoal text-xs">{e.student_email}</p>
                        <p className="text-muted-foreground text-[10px]">{e.student_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] border-0 ${
                          e.payment_status === "paid" ? "bg-sage/10 text-sage" :
                          e.payment_status === "waived" ? "bg-blue-50 text-blue-600" :
                          "bg-gold/10 text-gold-dark"
                        }`}>{e.payment_status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {e.payment_status !== "paid" && (
                            <button onClick={() => updatePayment(e.id, "paid")} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors" title="Mark Paid">
                              <DollarSign className="size-3.5" />
                            </button>
                          )}
                          {e.payment_status === "paid" && (
                            <button onClick={() => updatePayment(e.id, "unpaid")} className="p-1.5 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold-dark transition-colors" title="Mark Unpaid">
                              <DollarSign className="size-3.5" />
                            </button>
                          )}
                          <button onClick={() => deleteEnrollment(e.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
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
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Send, Clock, MapPin, User, DollarSign, Users } from "lucide-react";
import type { ClassItem } from "@/types/database";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

export function ClassRegistrationCard({ classItem }: { classItem: ClassItem }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ student_name: "", student_email: "", student_phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: enrollRow, error: dbError } = await supabase.from("class_enrollments").insert({
        class_id: classItem.id,
        ...form,
        payment_status: classItem.cost > 0 ? "unpaid" : "waived",
        payment_amount: classItem.cost > 0 ? classItem.cost : 0,
      }).select("id").single();
      if (dbError) throw dbError;

      // Redirect to payment page if class has a cost
      if (classItem.cost > 0 && enrollRow?.id) {
        window.location.href = `/pay/class_${enrollRow.id}`;
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border/60 hover:border-sage/40 transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-heading text-lg font-bold text-charcoal">{classItem.title}</h3>
              {classItem.cost > 0 ? (
                <Badge className="text-[10px] bg-gold/10 text-gold-dark border-0">
                  <DollarSign className="size-2.5 mr-0.5" />{classItem.cost}
                </Badge>
              ) : (
                <Badge className="text-[10px] bg-sage/10 text-sage border-0">Free</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{classItem.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {classItem.instructor && <span className="flex items-center gap-1"><User className="size-3" />{classItem.instructor}</span>}
              {classItem.schedule && <span className="flex items-center gap-1"><Clock className="size-3" />{classItem.schedule}</span>}
              {classItem.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{classItem.location}</span>}
              {classItem.capacity && <span className="flex items-center gap-1"><Users className="size-3" />{classItem.capacity} spots</span>}
            </div>
          </div>
          {!showForm && !submitted && (
            <Button onClick={() => setShowForm(true)} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm whitespace-nowrap flex-shrink-0">
              Register
            </Button>
          )}
        </div>

        {submitted && (
          <div className="mt-4 p-4 bg-sage/5 rounded-xl text-center">
            <CheckCircle2 className="size-8 text-sage mx-auto mb-2" />
            <p className="font-heading font-bold text-charcoal text-sm">Registration Submitted!</p>
            <p className="text-xs text-muted-foreground">
              {classItem.cost > 0
                ? "We'll reach out with payment details."
                : "You're all set. See you in class!"}
            </p>
          </div>
        )}

        {showForm && !submitted && (
          <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border/60 space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Full Name *</label>
                <input required value={form.student_name} onChange={(e) => setForm((p) => ({ ...p, student_name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Email *</label>
                <input required type="email" value={form.student_email} onChange={(e) => setForm((p) => ({ ...p, student_email: e.target.value }))} placeholder="email@example.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Phone *</label>
                <input required type="tel" value={form.student_phone} onChange={(e) => setForm((p) => ({ ...p, student_phone: e.target.value }))} placeholder="(555) 555-5555" className={inputClass} />
              </div>
            </div>
            {error && <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm">
                <Send className="size-3 mr-1.5" />{loading ? "Submitting…" : "Submit Registration"}
              </Button>
              <button type="button" onClick={() => setShowForm(false)} className="text-xs text-muted-foreground hover:text-charcoal">Cancel</button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

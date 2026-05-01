"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PaymentInfo {
  amount: number;         // cents
  label: string;
  category: string;
  linked_type: string;    // form_submission | class_enrollment | nikah_request
  linked_id: string;
  donor_name?: string;
  donor_email?: string;
  required: boolean;
}

export default function PayPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      // Parse the id format: {type}_{uuid}
      // e.g. form_abc123, class_xyz789, nikah_def456
      const sep = id.indexOf("_");
      if (sep === -1) { setError("Invalid payment link."); setLoading(false); return; }

      const type = id.slice(0, sep);
      const recordId = id.slice(sep + 1);

      // Check if already paid
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("linked_type", type === "form" ? "form_submission" : type === "class" ? "class_enrollment" : "nikah_request")
        .eq("linked_id", recordId)
        .eq("status", "completed")
        .limit(1);

      if (existingPayment && existingPayment.length > 0) {
        setAlreadyPaid(true);
        setLoading(false);
        return;
      }

      if (type === "form") {
        // Fetch the submission and template
        const { data: sub } = await supabase.from("form_submissions").select("*").eq("id", recordId).single();
        if (!sub) { setError("Submission not found."); setLoading(false); return; }

        const { data: template } = await supabase.from("form_templates").select("*").eq("slug", sub.form_slug).single();
        if (!template || !template.payment_amount) { setError("No payment configured for this form."); setLoading(false); return; }

        setInfo({
          amount: template.payment_amount,
          label: template.payment_label || template.name,
          category: sub.form_slug,
          linked_type: "form_submission",
          linked_id: recordId,
          donor_name: sub.data?.full_name || sub.data?.bride_name || sub.data?.groom_name || "",
          donor_email: sub.data?.email || sub.data?.user_email || sub.data?.bride_email || "",
          required: template.payment_required ?? false,
        });

      } else if (type === "class") {
        const { data: enrollment } = await supabase.from("class_enrollments").select("*, classes(title, cost)").eq("id", recordId).single();
        if (!enrollment) { setError("Enrollment not found."); setLoading(false); return; }

        const classData = (enrollment as unknown as { classes: { title: string; cost: number } }).classes;
        if (!classData?.cost || classData.cost <= 0) { setError("No payment required for this class."); setLoading(false); return; }

        setInfo({
          amount: Math.round(classData.cost * 100),
          label: `Class Tuition: ${classData.title}`,
          category: "class",
          linked_type: "class_enrollment",
          linked_id: recordId,
          donor_name: enrollment.student_name,
          donor_email: enrollment.student_email,
          required: true,
        });

      } else if (type === "nikah") {
        const { data: req } = await supabase.from("nikah_requests").select("*").eq("id", recordId).single();
        if (!req) { setError("Nikah request not found."); setLoading(false); return; }

        // Get payment amount from nikah template
        const { data: template } = await supabase.from("form_templates").select("payment_amount, payment_label, payment_required").eq("slug", "nikah").single();
        const amount = template?.payment_amount || 20000; // default $200

        setInfo({
          amount,
          label: template?.payment_label || "Nikah Fee",
          category: "nikah",
          linked_type: "nikah_request",
          linked_id: recordId,
          donor_name: `${req.groom_name} & ${req.bride_name}`,
          donor_email: req.user_email,
          required: template?.payment_required ?? true,
        });

      } else {
        setError("Invalid payment type.");
      }

      setLoading(false);
    })();
  }, [id, supabase]);

  const handlePay = async () => {
    if (!info) return;
    setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: info.amount / 100, // API expects dollars
          category: info.category,
          designation: info.label,
          donor_name: info.donor_name,
          donor_email: info.donor_email,
          is_recurring: false,
          linked_type: info.linked_type,
          linked_id: info.linked_id,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to initiate payment. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-warm-white py-16 px-4">
        <Loader2 className="size-8 animate-spin text-sage" />
      </section>
    );
  }

  if (alreadyPaid) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-warm-white py-16 px-4">
        <Card className="bg-card border-border/60 max-w-md w-full">
          <CardContent className="p-8 sm:p-10 text-center">
            <CheckCircle2 className="size-12 text-sage mx-auto mb-4" />
            <h1 className="font-heading text-xl font-bold text-charcoal mb-2">Payment Already Received</h1>
            <p className="text-muted-foreground text-sm">This item has already been paid for. JazakAllahu Khayran!</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-warm-white py-16 px-4">
        <Card className="bg-card border-border/60 max-w-md w-full">
          <CardContent className="p-8 sm:p-10 text-center">
            <XCircle className="size-12 text-destructive mx-auto mb-4" />
            <h1 className="font-heading text-xl font-bold text-charcoal mb-2">Payment Error</h1>
            <p className="text-muted-foreground text-sm">{error}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!info) return null;

  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-warm-white py-16 px-4">
      <Card className="bg-card border-border/60 max-w-md w-full">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold mx-auto mb-4">
              <DollarSign className="size-6" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-charcoal mb-1">
              Complete Your Payment
            </h1>
            <p className="text-muted-foreground text-sm">
              {info.label}
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-warm-gray/30 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount Due</span>
              <span className="font-heading text-2xl font-bold text-charcoal">
                ${(info.amount / 100).toFixed(2)}
              </span>
            </div>
            {info.donor_name && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Name</span>
                <span className="text-xs text-charcoal font-medium">{info.donor_name}</span>
              </div>
            )}
            {info.donor_email && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Email</span>
                <span className="text-xs text-charcoal font-medium">{info.donor_email}</span>
              </div>
            )}
          </div>

          <Button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-gold hover:bg-gold-dark text-white font-semibold rounded-full h-12 text-base shadow-md"
          >
            {paying ? (
              <><Loader2 className="size-4 mr-2 animate-spin" />Processing…</>
            ) : (
              <><CreditCard className="size-4 mr-2" />Pay ${(info.amount / 100).toFixed(2)}</>
            )}
          </Button>

          {!info.required && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Payment is optional. You may close this page if you prefer to pay later.
            </p>
          )}

          <p className="text-center text-[10px] text-muted-foreground mt-4">
            Secure payment powered by Stripe. Masjid Bilal is a 501(c)(3) non-profit.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Send } from "lucide-react";
import type { FormTemplate, FormField } from "@/types/database";

/* ── Default fields (fallback when no form_templates row exists) ── */
const defaultFields: FormField[] = [
  // Bride Information
  { name: "bride_name", label: "Bride's Full Name", type: "text", required: true, width: "half", section: "Bride Information" },
  { name: "bride_phone", label: "Bride's Phone", type: "tel", required: true, placeholder: "(555) 555-5555", width: "half" },
  { name: "bride_email", label: "Bride's Email", type: "email", required: true, placeholder: "email@example.com", width: "half" },
  { name: "bride_address", label: "Bride's Address", type: "text", required: true, placeholder: "Street, City, State, ZIP", width: "half" },
  // Groom Information
  { name: "groom_name", label: "Groom's Full Name", type: "text", required: true, width: "half", section: "Groom Information" },
  { name: "groom_phone", label: "Groom's Phone", type: "tel", required: true, placeholder: "(555) 555-5555", width: "half" },
  { name: "groom_email", label: "Groom's Email", type: "email", required: true, placeholder: "email@example.com", width: "half" },
  { name: "groom_address", label: "Groom's Address", type: "text", required: true, placeholder: "Street, City, State, ZIP", width: "half" },
  // Wali Information
  { name: "wali_name", label: "Wali's Full Name", type: "text", required: true, width: "third", section: "Wali (Guardian) Information" },
  { name: "wali_phone", label: "Wali's Phone", type: "tel", required: true, placeholder: "(555) 555-5555", width: "third" },
  { name: "wali_relation", label: "Relationship to Bride", type: "select", required: true, options: ["Father", "Brother", "Uncle", "Grandfather", "Other"], width: "third" },
  // Event Details
  { name: "requested_date", label: "Preferred Date", type: "date", required: true, width: "half", section: "Event Details" },
  { name: "requested_time", label: "Preferred Time", type: "time", required: true, width: "half" },
  { name: "location_preference", label: "Location Preference", type: "select", required: true, options: ["At the Masjid", "Off-site"], width: "third" },
  { name: "num_guests", label: "Number of Guests", type: "number", required: false, placeholder: "e.g. 50", width: "third" },
  { name: "has_marriage_license", label: "Marriage License Obtained?", type: "select", required: true, options: ["Yes", "No", "In Progress"], width: "third" },
  // Contact & Notes
  { name: "user_email", label: "Your Email Address (for confirmation)", type: "email", required: true, placeholder: "email@example.com", width: "full", section: "Contact & Additional Info" },
  { name: "additional_notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Any special requests, questions, or details…", width: "full" },
];

export function NikahRequestForm() {
  const supabase = createClient();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("form_templates").select("*").eq("slug", "nikah").eq("is_active", true).single();
      if (data) {
        const t = { ...data, fields: data.fields ?? [] } as FormTemplate;
        setTemplate(t);
        const init: Record<string, string> = {};
        t.fields.forEach((f: FormField) => { init[f.name] = ""; });
        setValues(init);
      } else {
        const init: Record<string, string> = {};
        defaultFields.forEach((f) => { init[f.name] = ""; });
        setValues(init);
      }
    })();
  }, [supabase]);

  const fields = template?.fields?.length ? template.fields : defaultFields;
  const set = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Save to dedicated nikah_requests table (for backward compat)
      const { data: nikahRow } = await supabase.from("nikah_requests").insert({
        bride_name: values.bride_name ?? "",
        bride_phone: values.bride_phone ?? "",
        bride_email: values.bride_email ?? "",
        bride_address: values.bride_address ?? "",
        groom_name: values.groom_name ?? "",
        groom_phone: values.groom_phone ?? "",
        groom_email: values.groom_email ?? "",
        groom_address: values.groom_address ?? "",
        wali_name: values.wali_name ?? "",
        wali_phone: values.wali_phone ?? "",
        wali_relation: values.wali_relation ?? "",
        requested_date: values.requested_date ?? "",
        requested_time: values.requested_time ?? "",
        location_preference: values.location_preference ?? "",
        num_guests: values.num_guests ? parseInt(values.num_guests) : null,
        has_marriage_license: values.has_marriage_license ?? "",
        additional_notes: values.additional_notes || null,
        user_email: values.user_email ?? "",
        status: "Pending",
      }).select("id").single();

      // Also save to generic form_submissions
      await supabase.from("form_submissions").insert({ form_slug: "nikah", data: values });

      // Send dedicated Nikah confirmation emails (user + admin)
      try {
        await fetch("/api/send-nikah-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } catch { console.warn("Nikah email send failed, but request was saved."); }

      // Send generic notification if configured
      if (template?.notification_emails) {
        try {
          await fetch("/api/send-form-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form_name: template.name || "Nikah Request",
              form_slug: "nikah",
              notification_emails: template.notification_emails,
              fields,
              data: values,
            }),
          });
        } catch { /* non-blocking */ }
      }

      // Redirect to payment page if payment is configured on the nikah template
      if (template?.payment_amount && template.payment_amount > 0 && nikahRow?.id) {
        window.location.href = `/pay/nikah_${nikahRow.id}`;
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again or contact the masjid directly.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-card border-border/60">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="size-12 text-sage mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-charcoal mb-2">
            {template?.success_title || "Request Submitted!"}
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {template?.success_message || "JazakAllahu Khayran! Your Nikah request has been received. Please check your email for a confirmation and next steps."}
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ── Field renderer ──────────────────────────────── */
  const renderField = (field: FormField) => {
    const widthClass =
      field.width === "full" ? "col-span-6" :
      field.width === "third" ? "col-span-6 sm:col-span-2" : "col-span-6 sm:col-span-3";

    const fieldInput = () => {
      switch (field.type) {
        case "textarea":
          return <textarea rows={3} required={field.required} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass + " resize-none"} />;
        case "select":
          return (
            <select required={field.required} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass}>
              <option value="">{field.placeholder || "Select\u2026"}</option>
              {(field.options ?? []).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          );
        case "radio":
          return (
            <div className="flex flex-wrap gap-4 py-1">
              {(field.options ?? []).filter(Boolean).map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                  <input type="radio" name={field.name} value={o} checked={values[field.name] === o} onChange={() => set(field.name, o)} required={field.required} className="accent-sage" />{o}
                </label>
              ))}
            </div>
          );
        case "checkbox":
          return (
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer py-1">
              <input type="checkbox" checked={values[field.name] === "true"} onChange={(e) => set(field.name, e.target.checked ? "true" : "false")} className="accent-sage" />
              {field.placeholder || field.label}
            </label>
          );
        default:
          return <input type={field.type} required={field.required} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} min={field.type === "number" ? "0" : undefined} className={inputClass} />;
      }
    };

    return (
      <div key={field.name} className={widthClass}>
        {field.type !== "checkbox" && (
          <label className="block text-xs font-medium text-charcoal mb-1.5">
            {field.label}{field.required ? " *" : ""}
          </label>
        )}
        {fieldInput()}
      </div>
    );
  };

  // Group fields into sections
  const sections: { header: string | null; fields: FormField[] }[] = [];
  let currentSection: { header: string | null; fields: FormField[] } = { header: null, fields: [] };
  fields.forEach((field) => {
    if (field.section && field.section !== currentSection.header) {
      if (currentSection.fields.length > 0) sections.push(currentSection);
      currentSection = { header: field.section, fields: [field] };
    } else {
      currentSection.fields.push(field);
    }
  });
  if (currentSection.fields.length > 0) sections.push(currentSection);

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="p-6 sm:p-8">
        <h2 className="font-heading text-xl font-bold text-charcoal mb-1">
          {template?.name || "Nikah Request Form"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {template?.description || "Please fill out all required fields. We will reach out to confirm details."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map((section, sIdx) => (
            <fieldset key={sIdx} className="space-y-4">
              {section.header && (
                <legend className="text-sm font-bold text-charcoal border-b border-border/60 pb-1 mb-2 w-full">
                  {section.header}
                </legend>
              )}
              <div className="grid grid-cols-6 gap-4">
                {section.fields.map((field) => renderField(field))}
              </div>
            </fieldset>
          ))}

          {error && (
            <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-sage hover:bg-sage-dark text-white font-semibold rounded-full h-11 shadow-sm"
          >
            <Send className="size-4 mr-2" />
            {loading ? "Submitting…" : (template?.submit_label || "Submit Nikah Request")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

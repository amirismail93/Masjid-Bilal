"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";
import type { FormTemplate, FormField } from "@/types/database";

const defaultFields: FormField[] = [
  { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "Your full name", width: "half" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com", width: "half" },
  { name: "phone", label: "Phone", type: "tel", required: false, placeholder: "(713) 555-0000", width: "half" },
  { name: "subject", label: "Subject", type: "select", required: true, placeholder: "Select a topic…", options: ["General Inquiry", "Volunteer", "Nikah Services", "Facility Rental", "Imam Meeting Request", "Other"], width: "half" },
  { name: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help you?", width: "full" },
];

export function ContactForm() {
  const supabase = createClient();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  // Fetch template on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("form_templates").select("*").eq("slug", "contact").eq("is_active", true).single();
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
  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save to dedicated table
      await supabase.from("contact_submissions").insert({
        full_name: values.full_name ?? "",
        email: values.email ?? "",
        phone: values.phone ?? "",
        subject: values.subject ?? "",
        message: values.message ?? "",
      });
      // Also save to generic submissions
      await supabase.from("form_submissions").insert({ form_slug: "contact", data: values });
      // Send notification
      if (template?.notification_emails) {
        try {
          await fetch("/api/send-form-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form_name: template.name || "Contact Form",
              form_slug: "contact",
              notification_emails: template.notification_emails,
              fields,
              data: values,
            }),
          });
        } catch { /* non-blocking */ }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

  if (submitted) {
    return (
      <Card className="bg-sage/5 border-sage/20">
        <CardContent className="p-8 sm:p-10 text-center">
          <CheckCircle className="size-10 text-sage mx-auto mb-3" />
          <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
            {template?.success_title || "Message Sent"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {template?.success_message || "Thank you for reaching out! We\u2019ll get back to you within 1\u20132 business days, insha\u2019Allah."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderField = (field: FormField) => {
    const widthClass = field.width === "full" ? "sm:col-span-2" : "";
    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className={`${widthClass}`}>
            <label className="block text-xs font-medium text-charcoal mb-1.5">
              {field.label}{field.required ? " *" : ""}{!field.required ? <span className="text-muted-foreground"> (optional)</span> : ""}
            </label>
            <textarea rows={5} required={field.required} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass + " resize-none"} />
          </div>
        );
      case "select":
        return (
          <div key={field.name} className={`${widthClass}`}>
            <label className="block text-xs font-medium text-charcoal mb-1.5">
              {field.label}{field.required ? " *" : ""}
            </label>
            <select required={field.required} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass}>
              <option value="">{field.placeholder || "Select…"}</option>
              {(field.options ?? []).filter(Boolean).map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        );
      default:
        return (
          <div key={field.name} className={`${widthClass}`}>
            <label className="block text-xs font-medium text-charcoal mb-1.5">
              {field.label}{field.required ? " *" : ""}{!field.required ? <span className="text-muted-foreground"> (optional)</span> : ""}
            </label>
            <input type={field.type} required={field.required} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass} />
          </div>
        );
    }
  };

  // Group: full-width fields get their own row, half-width fields are paired
  const fullFields = fields.filter((f) => f.width === "full");
  const halfFields = fields.filter((f) => f.width !== "full");

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="p-6 sm:p-8">
        <h2 className="font-heading text-xl font-bold text-charcoal mb-5">
          {template?.name || "Send a Message"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {halfFields.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {halfFields.map(renderField)}
            </div>
          )}
          {fullFields.map(renderField)}

          <Button type="submit" disabled={loading} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-7 h-11 shadow-sm">
            <Send className="size-4 mr-2" />
            {loading ? "Sending…" : (template?.submit_label || "Send Message")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";
import type { FormTemplate, FormField } from "@/types/database";

interface Props {
  template: FormTemplate;
}

export function DynamicForm({ template }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    template.fields.forEach((f) => { init[f.name] = ""; });
    return init;
  });

  const set = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // Save to generic form_submissions table
      const { data: insertedRow, error: dbError } = await supabase.from("form_submissions").insert({
        form_slug: template.slug,
        data: values,
      }).select("id").single();
      if (dbError) throw dbError;

      // Send notification emails if configured
      if (template.notification_emails) {
        try {
          await fetch("/api/send-form-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form_name: template.name,
              form_slug: template.slug,
              notification_emails: template.notification_emails,
              fields: template.fields,
              data: values,
            }),
          });
        } catch {
          // Email failure shouldn't block submission
          console.warn("Notification email failed to send");
        }
      }

      // Redirect to payment page if payment is configured
      if (template.payment_amount && template.payment_amount > 0 && insertedRow?.id) {
        window.location.href = `/pay/form_${insertedRow.id}`;
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

  if (submitted) {
    return (
      <Card className="bg-sage/5 border-sage/20">
        <CardContent className="p-8 sm:p-10 text-center">
          <CheckCircle className="size-10 text-sage mx-auto mb-3" />
          <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
            {template.success_title || "Thank You!"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {template.success_message || "Your submission has been received."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group fields by section
  const renderField = (field: FormField) => {
    const widthClass =
      field.width === "full" ? "sm:col-span-6" :
      field.width === "third" ? "sm:col-span-2" : "sm:col-span-3";

    const fieldInput = () => {
      switch (field.type) {
        case "textarea":
          return (
            <textarea
              rows={4}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => set(field.name, e.target.value)}
              className={inputClass + " resize-none"}
            />
          );

        case "select":
          return (
            <select
              required={field.required}
              value={values[field.name] ?? ""}
              onChange={(e) => set(field.name, e.target.value)}
              className={inputClass}
            >
              <option value="">{field.placeholder || "Select…"}</option>
              {(field.options ?? []).filter(Boolean).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );

        case "radio":
          return (
            <div className="flex flex-wrap gap-4 py-1">
              {(field.options ?? []).filter(Boolean).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                  <input
                    type="radio"
                    name={field.name}
                    value={opt}
                    checked={values[field.name] === opt}
                    onChange={() => set(field.name, opt)}
                    required={field.required}
                    className="accent-sage"
                  />
                  {opt}
                </label>
              ))}
            </div>
          );

        case "checkbox":
          return (
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer py-1">
              <input
                type="checkbox"
                checked={values[field.name] === "true"}
                onChange={(e) => set(field.name, e.target.checked ? "true" : "false")}
                className="accent-sage"
              />
              {field.placeholder || field.label}
            </label>
          );

        default:
          return (
            <input
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => set(field.name, e.target.value)}
              className={inputClass}
            />
          );
      }
    };

    return (
      <div key={field.name} className={`col-span-6 ${widthClass}`}>
        {field.type !== "checkbox" && (
          <label className="block text-xs font-medium text-charcoal mb-1.5">
            {field.label}{field.required ? " *" : ""}
          </label>
        )}
        {fieldInput()}
      </div>
    );
  };

  // Organize fields into sections
  const sections: { header: string | null; fields: FormField[] }[] = [];
  let currentSection: { header: string | null; fields: FormField[] } = { header: null, fields: [] };

  template.fields.forEach((field) => {
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
        {template.name && (
          <h2 className="font-heading text-xl font-bold text-charcoal mb-1">{template.name}</h2>
        )}
        {template.description && (
          <p className="text-sm text-muted-foreground mb-6">{template.description}</p>
        )}

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
            <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-7 h-11 shadow-sm"
          >
            <Send className="size-4 mr-2" />
            {loading ? "Submitting…" : (template.submit_label || "Submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

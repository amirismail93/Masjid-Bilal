"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "email" | "date" | "time" | "textarea" | "select" | "checkbox" | "url" | "number";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface Props {
  title: string;
  fields: FieldDef[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}

export function AdminFormModal({
  title,
  fields,
  values,
  onChange,
  onSave,
  onClose,
  saving,
}: Props) {
  const inputClass =
    "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-card border-border/60 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-bold text-charcoal">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-warm-gray text-muted-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field) => {
              if (field.type === "checkbox") {
                return (
                  <label
                    key={field.key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(values[field.key])}
                      onChange={(e) => onChange(field.key, e.target.checked)}
                      className="rounded border-border text-sage focus:ring-sage/30 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-charcoal">
                      {field.label}
                    </span>
                  </label>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-charcoal mb-1.5">
                      {field.label}
                      {field.required && " *"}
                    </label>
                    <textarea
                      rows={3}
                      value={(values[field.key] as string) ?? ""}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={inputClass + " resize-none"}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-charcoal mb-1.5">
                      {field.label}
                      {field.required && " *"}
                    </label>
                    <select
                      value={(values[field.key] as string) ?? ""}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select…</option>
                      {field.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">
                    {field.label}
                    {field.required && " *"}
                  </label>
                  <input
                    type={field.type || "text"}
                    value={(values[field.key] as string) ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border/40">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-full px-5 h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 shadow-sm"
            >
              <Save className="size-4 mr-1.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

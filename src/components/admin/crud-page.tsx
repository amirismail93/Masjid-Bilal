"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminTable } from "./admin-table";
import { AdminFormModal, type FieldDef } from "./admin-form-modal";
import { Badge } from "@/components/ui/badge";

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface CrudPageProps {
  table: string;
  title: string;
  description: string;
  columns: Column[];
  fields: FieldDef[];
  defaultValues: Record<string, unknown>;
  orderBy?: string;
  orderAsc?: boolean;
  idField?: string;
}

export function CrudPage({
  table,
  title,
  description,
  columns,
  fields,
  defaultValues,
  orderBy,
  orderAsc = true,
  idField = "id",
}: CrudPageProps) {
  const supabase = createClient();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(defaultValues);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select("*");
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderAsc });
    }
    const { data } = await query;
    setRows((data as Record<string, unknown>[]) ?? []);
    setLoading(false);
  }, [table, orderBy, orderAsc, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditing(null);
    setForm({ ...defaultValues });
    setShowModal(true);
  };

  const handleEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    setForm({ ...row });
    setShowModal(true);
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    await supabase.from(table).delete().eq(idField, row[idField] as string);
    fetchData();
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form };
    delete payload[idField];
    delete payload.created_at;
    delete payload.updated_at;

    if (editing) {
      await supabase
        .from(table)
        .update(payload)
        .eq(idField, editing[idField] as string);
    } else {
      await supabase.from(table).insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <>
      <AdminTable
        title={title}
        description={description}
        columns={columns}
        rows={rows}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <AdminFormModal
          title={editing ? `Edit ${title.replace(/s$/, "")}` : `Add ${title.replace(/s$/, "")}`}
          fields={fields}
          values={form}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
        />
      )}
    </>
  );
}

// Helper renderers
export function BoolBadge(val: unknown) {
  return val ? (
    <Badge className="bg-sage/10 text-sage border-0 text-[11px]">Yes</Badge>
  ) : (
    <Badge variant="secondary" className="text-[11px]">No</Badge>
  );
}

export function Truncate(val: unknown) {
  const str = (val as string) ?? "";
  return (
    <span className="max-w-[200px] truncate block" title={str}>
      {str || "—"}
    </span>
  );
}

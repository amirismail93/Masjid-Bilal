"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  title: string;
  description: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  onAdd: () => void;
  onEdit: (row: Record<string, unknown>) => void;
  onDelete: (row: Record<string, unknown>) => void;
}

export function AdminTable({
  title,
  description,
  columns,
  rows,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          onClick={onAdd}
          className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 shadow-sm"
        >
          <Plus className="size-4 mr-1.5" />
          Add New
        </Button>
      </div>

      <Card className="bg-card border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-warm-gray/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No records found. Click &ldquo;Add New&rdquo; to create
                      one.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <tr
                      key={(row.id as string) ?? (row.key as string) ?? i}
                      className="border-b border-border/20 hover:bg-warm-gray/20 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-charcoal">
                          {col.render
                            ? col.render(row[col.key], row)
                            : (row[col.key] as string) ?? "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

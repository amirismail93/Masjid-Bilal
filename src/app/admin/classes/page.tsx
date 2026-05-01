"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2, X, Pencil, Eye, EyeOff, Users, CheckCircle2, DollarSign } from "lucide-react";
import type { ClassItem } from "@/types/database";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

export default function AdminClassesPage() {
  const supabase = createClient();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase.from("classes").select("*").order("display_order", { ascending: true });
    setClasses((data as ClassItem[]) ?? []);
  }, [supabase]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const startNew = () => {
    setEditing({
      id: "", title: "", description: "", instructor: "", schedule: "",
      cost: 0, capacity: null, location: "", start_date: null, end_date: null,
      is_active: true, display_order: classes.length + 1, created_at: "",
    });
    setIsNew(true);
  };

  const saveItem = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      title: editing.title, description: editing.description, instructor: editing.instructor,
      schedule: editing.schedule, cost: editing.cost, capacity: editing.capacity,
      location: editing.location, start_date: editing.start_date || null,
      end_date: editing.end_date || null, is_active: editing.is_active,
      display_order: editing.display_order,
    };
    if (isNew) await supabase.from("classes").insert(payload);
    else await supabase.from("classes").update(payload).eq("id", editing.id);
    setSaving(false); setEditing(null); setIsNew(false); fetchClasses();
    showToast(isNew ? "Class added!" : "Class updated!");
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this class and all its enrollments?")) return;
    await supabase.from("class_enrollments").delete().eq("class_id", id);
    await supabase.from("classes").delete().eq("id", id);
    fetchClasses(); showToast("Class deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">Classes</h1>
          <p className="text-sm text-muted-foreground">Manage classes, schedules, and costs. Click a class to view enrollments.</p>
        </div>
        <Button onClick={startNew} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 text-xs shadow-sm">
          <Plus className="size-3.5 mr-1.5" />Add Class
        </Button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />{toast}
        </div>
      )}

      {editing && (
        <Card className="bg-card border-sage/30 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-charcoal">{isNew ? "New Class" : "Edit Class"}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }}><X className="size-5 text-muted-foreground hover:text-charcoal" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Title *</label>
                <input value={editing.title} onChange={(e) => setEditing((p) => p && { ...p, title: e.target.value })} placeholder="e.g. Quran Tajweed" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Instructor</label>
                <input value={editing.instructor} onChange={(e) => setEditing((p) => p && { ...p, instructor: e.target.value })} placeholder="Sheikh Ahmad" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Description</label>
              <textarea rows={2} value={editing.description} onChange={(e) => setEditing((p) => p && { ...p, description: e.target.value })} className={inputClass + " resize-y"} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Schedule</label>
                <input value={editing.schedule} onChange={(e) => setEditing((p) => p && { ...p, schedule: e.target.value })} placeholder="Mon & Wed, 7–8 PM" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Location</label>
                <input value={editing.location} onChange={(e) => setEditing((p) => p && { ...p, location: e.target.value })} placeholder="Room 101" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Cost ($)</label>
                <input type="number" min="0" value={editing.cost} onChange={(e) => setEditing((p) => p && { ...p, cost: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Capacity</label>
                <input type="number" min="1" value={editing.capacity ?? ""} onChange={(e) => setEditing((p) => p && { ...p, capacity: e.target.value ? parseInt(e.target.value) : null })} placeholder="Unlimited" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">Start Date</label>
                <input type="date" value={editing.start_date ?? ""} onChange={(e) => setEditing((p) => p && { ...p, start_date: e.target.value || null })} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">End Date</label>
                <input type="date" value={editing.end_date ?? ""} onChange={(e) => setEditing((p) => p && { ...p, end_date: e.target.value || null })} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing((p) => p && { ...p, is_active: e.target.checked })} className="accent-sage" />Active
              </label>
              <Button onClick={saveItem} disabled={saving || !editing.title} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm">
                <Save className="size-3.5 mr-1.5" />{saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {classes.length === 0 && !editing ? (
        <Card className="bg-card border-border/60">
          <CardContent className="p-10 text-center text-muted-foreground text-sm">No classes yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {classes.map((cls) => (
            <Card key={cls.id} className="bg-card border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading text-sm font-bold text-charcoal">{cls.title}</p>
                    {cls.cost > 0 && <Badge className="text-[9px] bg-gold/10 text-gold-dark border-0"><DollarSign className="size-2.5 mr-0.5" />{cls.cost}</Badge>}
                    {cls.capacity && <Badge className="text-[9px] bg-warm-gray/60 text-muted-foreground border-0"><Users className="size-2.5 mr-0.5" />{cls.capacity} max</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{cls.instructor} · {cls.schedule}</p>
                </div>
                <Badge className={`text-[10px] border-0 flex-shrink-0 ${cls.is_active ? "bg-sage/10 text-sage" : "bg-muted text-muted-foreground"}`}>
                  {cls.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a href={`/admin/classes/${cls.id}/enrollments`} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors text-xs font-medium">
                    <Users className="size-3.5" />
                  </a>
                  <button onClick={() => { setEditing({ ...cls }); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => deleteItem(cls.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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
}

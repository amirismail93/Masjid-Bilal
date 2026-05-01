"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, X, Pencil, CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

type Tab = "board" | "stats" | "social" | "donations";

const ICON_OPTIONS = [
  "Calendar", "Users", "BookOpen", "Clock", "Heart", "Building", "Utensils",
  "Globe", "MessageCircle", "Play", "ExternalLink", "Target", "Eye",
  "ShieldCheck", "Handshake", "Hospital", "Building2", "Sparkles",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AdminAboutPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("board");
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const tableMap: Record<Tab, string> = {
    board: "board_members", stats: "community_stats", social: "social_links", donations: "donation_categories",
  };

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from(tableMap[tab]).select("*").order("display_order", { ascending: true });
    setItems(data ?? []);
  }, [supabase, tab]);

  useEffect(() => { fetchItems(); setEditing(null); setIsNew(false); }, [fetchItems, tab]);

  const defaultFor = (t: Tab): any => {
    const base = { id: "", display_order: items.length + 1 };
    switch (t) {
      case "board": return { ...base, name: "", role: "" };
      case "stats": return { ...base, icon: "Calendar", value: "", label: "" };
      case "social": return { ...base, label: "", icon: "Globe", href: "" };
      case "donations": return { ...base, icon: "Heart", title: "", description: "", is_active: true };
    }
  };

  const saveItem = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = { ...editing };
    delete payload.id; delete payload.created_at;
    if (isNew) await supabase.from(tableMap[tab]).insert(payload);
    else await supabase.from(tableMap[tab]).update(payload).eq("id", editing.id);
    setSaving(false); setEditing(null); setIsNew(false); fetchItems();
    showToast(isNew ? "Added!" : "Updated!");
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from(tableMap[tab]).delete().eq("id", id);
    fetchItems(); showToast("Deleted.");
  };

  const set = (k: string, v: any) => setEditing((p: any) => p && { ...p, [k]: v });

  const tabs: { key: Tab; label: string }[] = [
    { key: "board", label: "Board Members" },
    { key: "stats", label: "Stats" },
    { key: "social", label: "Social Links" },
    { key: "donations", label: "Donation Categories" },
  ];

  const renderFields = () => {
    if (!editing) return null;
    switch (tab) {
      case "board":
        return (<div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Name *</label><input value={editing.name} onChange={(e) => set("name", e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Role *</label><input value={editing.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Board Chair" className={inputClass} /></div>
        </div>);
      case "stats":
        return (<div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Value *</label><input value={editing.value} onChange={(e) => set("value", e.target.value)} placeholder="e.g. 2,500+" className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Label *</label><input value={editing.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Community Members" className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Icon</label>
            <select value={editing.icon} onChange={(e) => set("icon", e.target.value)} className={inputClass}>{ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}</select>
          </div>
        </div>);
      case "social":
        return (<div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Label *</label><input value={editing.label} onChange={(e) => set("label", e.target.value)} placeholder="Facebook" className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">URL *</label><input value={editing.href} onChange={(e) => set("href", e.target.value)} placeholder="https://..." className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Icon</label>
            <select value={editing.icon} onChange={(e) => set("icon", e.target.value)} className={inputClass}>{ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}</select>
          </div>
        </div>);
      case "donations":
        return (<div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Title *</label><input value={editing.title} onChange={(e) => set("title", e.target.value)} placeholder="General Fund" className={inputClass} /></div>
            <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Icon</label>
              <select value={editing.icon} onChange={(e) => set("icon", e.target.value)} className={inputClass}>{ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}</select>
            </div>
          </div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Description</label><input value={editing.description} onChange={(e) => set("description", e.target.value)} className={inputClass} /></div>
        </div>);
    }
  };

  const renderRow = (item: any) => {
    switch (tab) {
      case "board": return <><span className="font-bold text-charcoal text-sm">{item.name}</span><span className="text-[10px] text-muted-foreground ml-2">{item.role}</span></>;
      case "stats": return <><span className="font-bold text-charcoal text-sm">{item.value}</span><span className="text-[10px] text-muted-foreground ml-2">{item.label} [{item.icon}]</span></>;
      case "social": return <><span className="font-bold text-charcoal text-sm">{item.label}</span><span className="text-[10px] text-muted-foreground ml-2">{item.href}</span></>;
      case "donations": return <><span className="font-bold text-charcoal text-sm">{item.title}</span><span className="text-[10px] text-muted-foreground ml-2">{item.description}</span></>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">About & Site Content</h1>
        <p className="text-sm text-muted-foreground">Manage board members, community stats, social links, and donation categories.</p>
      </div>

      {toast && <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium"><CheckCircle2 className="size-4" />{toast}</div>}

      <div className="flex gap-1 bg-warm-gray/50 rounded-xl p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${tab === t.key ? "bg-white text-charcoal shadow-sm" : "text-muted-foreground hover:text-charcoal"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => { setEditing(defaultFor(tab)); setIsNew(true); }} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 text-xs shadow-sm">
            <Plus className="size-3.5 mr-1.5" />Add
          </Button>
        </div>

        {editing && (
          <Card className="bg-card border-sage/30 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-charcoal">{isNew ? "Add" : "Edit"}</h2>
                <button onClick={() => { setEditing(null); setIsNew(false); }}><X className="size-5 text-muted-foreground hover:text-charcoal" /></button>
              </div>
              {renderFields()}
              <div className="flex justify-end">
                <Button onClick={saveItem} disabled={saving} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm">
                  <Save className="size-3.5 mr-1.5" />{saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {items.length === 0 && !editing ? (
          <Card className="bg-card border-border/60"><CardContent className="p-10 text-center text-muted-foreground text-sm">No items yet.</CardContent></Card>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => (
              <Card key={item.id} className="bg-card border-border/60">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0 truncate">{renderRow(item)}</div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setEditing({ ...item }); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors"><Pencil className="size-3.5" /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

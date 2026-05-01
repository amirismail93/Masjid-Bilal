"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, X, Pencil, CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

type Tab = "restaurants" | "businesses" | "apps" | "books" | "faqs" | "downloads";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AdminResourcesPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("restaurants");
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const tableMap: Record<Tab, string> = {
    restaurants: "halal_restaurants",
    businesses: "muslim_businesses",
    apps: "recommended_apps",
    books: "recommended_books",
    faqs: "faq_items",
    downloads: "downloadable_resources",
  };

  const orderCol: Record<Tab, string> = {
    restaurants: "display_order", businesses: "display_order", apps: "display_order",
    books: "display_order", faqs: "display_order", downloads: "display_order",
  };

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from(tableMap[tab]).select("*").order(orderCol[tab], { ascending: true });
    setItems(data ?? []);
  }, [supabase, tab]);

  useEffect(() => { fetchItems(); setEditing(null); setIsNew(false); }, [fetchItems, tab]);

  const defaultFor = (t: Tab): any => {
    const base = { id: "", display_order: items.length + 1 };
    switch (t) {
      case "restaurants": return { ...base, name: "", cuisine: "", area: "" };
      case "businesses": return { ...base, name: "", type: "", area: "" };
      case "apps": return { ...base, name: "", description: "" };
      case "books": return { ...base, name: "", description: "" };
      case "faqs": return { ...base, category: "general", question: "", answer: "" };
      case "downloads": return { ...base, name: "", format: "PDF", size: "", url: "" };
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
    { key: "restaurants", label: "Halal Restaurants" },
    { key: "businesses", label: "Muslim Businesses" },
    { key: "apps", label: "Apps" },
    { key: "books", label: "Books" },
    { key: "faqs", label: "FAQs" },
    { key: "downloads", label: "Downloads" },
  ];

  const renderFields = () => {
    if (!editing) return null;
    switch (tab) {
      case "restaurants":
        return (<div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Name *</label><input value={editing.name} onChange={(e) => set("name", e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Cuisine</label><input value={editing.cuisine} onChange={(e) => set("cuisine", e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Area</label><input value={editing.area} onChange={(e) => set("area", e.target.value)} className={inputClass} /></div>
        </div>);
      case "businesses":
        return (<div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Name *</label><input value={editing.name} onChange={(e) => set("name", e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Type</label><input value={editing.type} onChange={(e) => set("type", e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Area</label><input value={editing.area} onChange={(e) => set("area", e.target.value)} className={inputClass} /></div>
        </div>);
      case "apps":
      case "books":
        return (<div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Name *</label><input value={editing.name} onChange={(e) => set("name", e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Description</label><input value={editing.description} onChange={(e) => set("description", e.target.value)} className={inputClass} /></div>
        </div>);
      case "faqs":
        return (<div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Category</label>
              <select value={editing.category} onChange={(e) => set("category", e.target.value)} className={inputClass}>
                <option value="zakat">Zakat & Sadaqah</option><option value="visitor">Visitor FAQ</option><option value="general">General</option>
              </select>
            </div>
            <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Question *</label><input value={editing.question} onChange={(e) => set("question", e.target.value)} className={inputClass} /></div>
          </div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Answer *</label><textarea rows={3} value={editing.answer} onChange={(e) => set("answer", e.target.value)} className={inputClass + " resize-y"} /></div>
        </div>);
      case "downloads":
        return (<div className="grid sm:grid-cols-4 gap-4">
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Name *</label><input value={editing.name} onChange={(e) => set("name", e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Format</label><input value={editing.format} onChange={(e) => set("format", e.target.value)} placeholder="PDF" className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">Size</label><input value={editing.size} onChange={(e) => set("size", e.target.value)} placeholder="120 KB" className={inputClass} /></div>
          <div><label className="block text-[10px] font-medium text-muted-foreground mb-1">URL</label><input value={editing.url ?? ""} onChange={(e) => set("url", e.target.value)} className={inputClass} /></div>
        </div>);
    }
  };

  const renderRow = (item: any) => {
    switch (tab) {
      case "restaurants": return <><span className="font-bold text-charcoal text-sm">{item.name}</span><span className="text-[10px] text-muted-foreground ml-2">{item.cuisine} · {item.area}</span></>;
      case "businesses": return <><span className="font-bold text-charcoal text-sm">{item.name}</span><span className="text-[10px] text-muted-foreground ml-2">{item.type} · {item.area}</span></>;
      case "apps": case "books": return <><span className="font-bold text-charcoal text-sm">{item.name}</span><span className="text-[10px] text-muted-foreground ml-2">{item.description}</span></>;
      case "faqs": return <><span className="font-bold text-charcoal text-sm">{item.question}</span><span className="text-[10px] text-muted-foreground ml-2">[{item.category}]</span></>;
      case "downloads": return <><span className="font-bold text-charcoal text-sm">{item.name}</span><span className="text-[10px] text-muted-foreground ml-2">{item.format} · {item.size}</span></>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">Resources Manager</h1>
        <p className="text-sm text-muted-foreground">Edit halal restaurants, businesses, apps, books, FAQs, and downloads.</p>
      </div>

      {toast && <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium"><CheckCircle2 className="size-4" />{toast}</div>}

      <div className="flex flex-wrap gap-1 bg-warm-gray/50 rounded-xl p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 min-w-[100px] text-xs font-medium py-2 rounded-lg transition-colors ${tab === t.key ? "bg-white text-charcoal shadow-sm" : "text-muted-foreground hover:text-charcoal"}`}>
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

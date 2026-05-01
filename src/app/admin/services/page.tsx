"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Save,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import type { ServiceItem, JanazahStep, RentalTier, FormTemplate } from "@/types/database";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

const ICON_OPTIONS = [
  "ShieldCheck",
  "Heart",
  "Users",
  "Handshake",
  "Hospital",
  "Building2",
  "Sparkles",
  "BookOpen",
  "Phone",
  "Stethoscope",
  "Baby",
  "GraduationCap",
  "HandHeart",
  "Globe",
];

type Tab = "services" | "janazah" | "rentals";

export default function AdminServicesPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("services");
  const [toast, setToast] = useState("");
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);

  // Fetch active form templates for the link picker
  const fetchFormTemplates = useCallback(async () => {
    const { data } = await supabase
      .from("form_templates")
      .select("*")
      .eq("is_active", true)
      .order("name");
    setFormTemplates((data as FormTemplate[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchFormTemplates();
  }, [fetchFormTemplates]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ================================================================== */
  /*  SERVICES                                                           */
  /* ================================================================== */
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editingSvc, setEditingSvc] = useState<ServiceItem | null>(null);
  const [isNewSvc, setIsNewSvc] = useState(false);
  const [savingSvc, setSavingSvc] = useState(false);
  const svcDragIdx = useRef<number | null>(null);
  const [svcDragOver, setSvcDragOver] = useState<number | null>(null);

  const fetchServices = useCallback(async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });
    setServices((data as ServiceItem[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const startNewSvc = () => {
    setEditingSvc({
      id: "",
      icon: "Heart",
      title: "",
      description: "",
      cta_label: "Learn More",
      cta_href: "/contact",
      display_order: services.length + 1,
      is_active: true,
    });
    setIsNewSvc(true);
  };

  const saveSvc = async () => {
    if (!editingSvc) return;
    setSavingSvc(true);
    const payload = {
      icon: editingSvc.icon,
      title: editingSvc.title,
      description: editingSvc.description,
      cta_label: editingSvc.cta_label,
      cta_href: editingSvc.cta_href,
      display_order: editingSvc.display_order,
      is_active: editingSvc.is_active,
    };
    if (isNewSvc) {
      await supabase.from("services").insert(payload);
    } else {
      await supabase.from("services").update(payload).eq("id", editingSvc.id);
    }
    setSavingSvc(false);
    setEditingSvc(null);
    setIsNewSvc(false);
    fetchServices();
    showToast(isNewSvc ? "Service added!" : "Service updated!");
  };

  const deleteSvc = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchServices();
    showToast("Service deleted.");
  };

  const onSvcDrop = async (targetIdx: number) => {
    const fromIdx = svcDragIdx.current;
    setSvcDragOver(null);
    svcDragIdx.current = null;
    if (fromIdx === null || fromIdx === targetIdx) return;
    const updated = [...services];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(targetIdx, 0, moved);
    const withOrder = updated.map((s, i) => ({ ...s, display_order: i + 1 }));
    setServices(withOrder);
    await Promise.all(
      withOrder.map((s) =>
        supabase.from("services").update({ display_order: s.display_order }).eq("id", s.id)
      )
    );
    showToast("Order updated!");
  };

  /* ================================================================== */
  /*  JANAZAH STEPS                                                      */
  /* ================================================================== */
  const [steps, setSteps] = useState<JanazahStep[]>([]);
  const [editingStep, setEditingStep] = useState<JanazahStep | null>(null);
  const [isNewStep, setIsNewStep] = useState(false);
  const [savingStep, setSavingStep] = useState(false);

  const fetchSteps = useCallback(async () => {
    const { data } = await supabase
      .from("janazah_steps")
      .select("*")
      .order("step_number", { ascending: true });
    setSteps((data as JanazahStep[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const saveStep = async () => {
    if (!editingStep) return;
    setSavingStep(true);
    const payload = {
      step_number: editingStep.step_number,
      description: editingStep.description,
    };
    if (isNewStep) {
      await supabase.from("janazah_steps").insert(payload);
    } else {
      await supabase.from("janazah_steps").update(payload).eq("id", editingStep.id);
    }
    setSavingStep(false);
    setEditingStep(null);
    setIsNewStep(false);
    fetchSteps();
    showToast(isNewStep ? "Step added!" : "Step updated!");
  };

  const deleteStep = async (id: string) => {
    if (!confirm("Delete this step?")) return;
    await supabase.from("janazah_steps").delete().eq("id", id);
    fetchSteps();
    showToast("Step deleted.");
  };

  /* ================================================================== */
  /*  RENTAL TIERS                                                       */
  /* ================================================================== */
  const [tiers, setTiers] = useState<RentalTier[]>([]);
  const [editingTier, setEditingTier] = useState<RentalTier | null>(null);
  const [isNewTier, setIsNewTier] = useState(false);
  const [savingTier, setSavingTier] = useState(false);

  const fetchTiers = useCallback(async () => {
    const { data } = await supabase
      .from("rental_tiers")
      .select("*")
      .order("display_order", { ascending: true });
    setTiers((data as RentalTier[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const saveTier = async () => {
    if (!editingTier) return;
    setSavingTier(true);
    const payload = {
      name: editingTier.name,
      capacity: editingTier.capacity,
      price: editingTier.price,
      display_order: editingTier.display_order,
    };
    if (isNewTier) {
      await supabase.from("rental_tiers").insert(payload);
    } else {
      await supabase.from("rental_tiers").update(payload).eq("id", editingTier.id);
    }
    setSavingTier(false);
    setEditingTier(null);
    setIsNewTier(false);
    fetchTiers();
    showToast(isNewTier ? "Tier added!" : "Tier updated!");
  };

  const deleteTier = async (id: string) => {
    if (!confirm("Delete this rental tier?")) return;
    await supabase.from("rental_tiers").delete().eq("id", id);
    fetchTiers();
    showToast("Tier deleted.");
  };

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */
  const tabs: { key: Tab; label: string }[] = [
    { key: "services", label: "Services" },
    { key: "janazah", label: "Janazah Steps" },
    { key: "rentals", label: "Rental Tiers" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">
          Services Manager
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit the services, janazah process steps, and rental tiers shown on the public Services page.
        </p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />
          {toast}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-warm-gray/50 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              tab === t.key
                ? "bg-white text-charcoal shadow-sm"
                : "text-muted-foreground hover:text-charcoal"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SERVICES TAB ──────────────────────────────────────── */}
      {tab === "services" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={startNewSvc}
              className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 text-xs shadow-sm"
            >
              <Plus className="size-3.5 mr-1.5" />
              Add Service
            </Button>
          </div>

          {/* Service Editor */}
          {editingSvc && (
            <Card className="bg-card border-sage/30 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-charcoal">
                    {isNewSvc ? "New Service" : "Edit Service"}
                  </h2>
                  <button onClick={() => { setEditingSvc(null); setIsNewSvc(false); }}>
                    <X className="size-5 text-muted-foreground hover:text-charcoal" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Title *</label>
                    <input
                      value={editingSvc.title}
                      onChange={(e) => setEditingSvc((p) => p && { ...p, title: e.target.value })}
                      placeholder="e.g. Nikah Services"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Icon</label>
                    <select
                      value={editingSvc.icon}
                      onChange={(e) => setEditingSvc((p) => p && { ...p, icon: e.target.value })}
                      className={inputClass}
                    >
                      {ICON_OPTIONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={editingSvc.description}
                    onChange={(e) => setEditingSvc((p) => p && { ...p, description: e.target.value })}
                    className={inputClass + " resize-y"}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Button Label</label>
                    <input
                      value={editingSvc.cta_label}
                      onChange={(e) => setEditingSvc((p) => p && { ...p, cta_label: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Button Link</label>
                    <select
                      value={
                        // Check if the current value matches a known option
                        ["/contact", "/donate", "/services/nikah-request", "/programs", "/resources"]
                          .includes(editingSvc.cta_href) ||
                        editingSvc.cta_href.startsWith("/forms/")
                          ? editingSvc.cta_href
                          : "__custom__"
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "__custom__") {
                          setEditingSvc((p) => p && { ...p, cta_href: "/" });
                        } else {
                          setEditingSvc((p) => p && { ...p, cta_href: v });
                        }
                      }}
                      className={inputClass}
                    >
                      <optgroup label="Pages">
                        <option value="/contact">Contact Page</option>
                        <option value="/donate">Donate Page</option>
                        <option value="/services/nikah-request">Nikah Request (legacy)</option>
                        <option value="/programs">Programs Page</option>
                        <option value="/resources">Resources Page</option>
                      </optgroup>
                      {formTemplates.length > 0 && (
                        <optgroup label="Forms">
                          {formTemplates.map((ft) => (
                            <option key={ft.id} value={`/forms/${ft.slug}`}>
                              {ft.name} (/forms/{ft.slug})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Other">
                        <option value="__custom__">Custom URL…</option>
                      </optgroup>
                    </select>
                    {/* Show text input for custom URLs */}
                    {!["__custom__", "/contact", "/donate", "/services/nikah-request", "/programs", "/resources"]
                      .includes(editingSvc.cta_href) &&
                      !editingSvc.cta_href.startsWith("/forms/") && (
                      <input
                        value={editingSvc.cta_href}
                        onChange={(e) => setEditingSvc((p) => p && { ...p, cta_href: e.target.value })}
                        placeholder="/custom-path"
                        className={inputClass + " mt-2"}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSvc.is_active}
                      onChange={(e) => setEditingSvc((p) => p && { ...p, is_active: e.target.checked })}
                      className="accent-sage"
                    />
                    Active
                  </label>
                  <Button
                    onClick={saveSvc}
                    disabled={savingSvc || !editingSvc.title}
                    className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
                  >
                    <Save className="size-3.5 mr-1.5" />
                    {savingSvc ? "Saving…" : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service List (drag-and-drop) */}
          {services.length === 0 && !editingSvc ? (
            <Card className="bg-card border-border/60">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                No services yet. Click &quot;Add Service&quot; to create one.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {services.map((svc, idx) => (
                <Card
                  key={svc.id}
                  draggable
                  onDragStart={() => { svcDragIdx.current = idx; }}
                  onDragOver={(e) => { e.preventDefault(); setSvcDragOver(idx); }}
                  onDragLeave={() => setSvcDragOver(null)}
                  onDrop={() => onSvcDrop(idx)}
                  onDragEnd={() => { svcDragIdx.current = null; setSvcDragOver(null); }}
                  className={`bg-card border-border/60 cursor-grab active:cursor-grabbing transition-all ${
                    svcDragOver === idx ? "border-sage ring-2 ring-sage/20" : ""
                  }`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <GripVertical className="size-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground w-6 text-center flex-shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-sm font-bold text-charcoal truncate">{svc.title}</p>
                        <Badge className="text-[9px] bg-warm-gray/60 text-muted-foreground border-0">{svc.icon}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{svc.description}</p>
                      <p className="text-[10px] text-sage truncate">→ {svc.cta_href}</p>
                    </div>
                    <Badge className={`text-[10px] border-0 flex-shrink-0 ${svc.is_active ? "bg-sage/10 text-sage" : "bg-muted text-muted-foreground"}`}>
                      {svc.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingSvc({ ...svc }); setIsNewSvc(false); }} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => deleteSvc(svc.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── JANAZAH STEPS TAB ─────────────────────────────────── */}
      {tab === "janazah" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingStep({ id: "", step_number: steps.length + 1, description: "" });
                setIsNewStep(true);
              }}
              className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 text-xs shadow-sm"
            >
              <Plus className="size-3.5 mr-1.5" />
              Add Step
            </Button>
          </div>

          {editingStep && (
            <Card className="bg-card border-sage/30 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-charcoal">
                    {isNewStep ? "New Step" : "Edit Step"}
                  </h2>
                  <button onClick={() => { setEditingStep(null); setIsNewStep(false); }}>
                    <X className="size-5 text-muted-foreground hover:text-charcoal" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-[80px_1fr] gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Step #</label>
                    <input
                      type="number"
                      min="1"
                      value={editingStep.step_number}
                      onChange={(e) => setEditingStep((p) => p && { ...p, step_number: parseInt(e.target.value) || 1 })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Description *</label>
                    <input
                      value={editingStep.description}
                      onChange={(e) => setEditingStep((p) => p && { ...p, description: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={saveStep}
                    disabled={savingStep || !editingStep.description}
                    className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
                  >
                    <Save className="size-3.5 mr-1.5" />
                    {savingStep ? "Saving…" : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {steps.length === 0 && !editingStep ? (
            <Card className="bg-card border-border/60">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                No janazah steps defined yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {steps.map((step) => (
                <Card key={step.id} className="bg-card border-border/60">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage/10 text-sage text-xs font-bold flex-shrink-0">
                      {step.step_number}
                    </span>
                    <p className="flex-1 text-sm text-charcoal">{step.description}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingStep({ ...step }); setIsNewStep(false); }} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => deleteStep(step.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RENTAL TIERS TAB ──────────────────────────────────── */}
      {tab === "rentals" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingTier({ id: "", name: "", capacity: "", price: "", display_order: tiers.length + 1 });
                setIsNewTier(true);
              }}
              className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 text-xs shadow-sm"
            >
              <Plus className="size-3.5 mr-1.5" />
              Add Tier
            </Button>
          </div>

          {editingTier && (
            <Card className="bg-card border-sage/30 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-charcoal">
                    {isNewTier ? "New Rental Tier" : "Edit Rental Tier"}
                  </h2>
                  <button onClick={() => { setEditingTier(null); setIsNewTier(false); }}>
                    <X className="size-5 text-muted-foreground hover:text-charcoal" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Name *</label>
                    <input
                      value={editingTier.name}
                      onChange={(e) => setEditingTier((p) => p && { ...p, name: e.target.value })}
                      placeholder="e.g. Main Hall"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Capacity</label>
                    <input
                      value={editingTier.capacity}
                      onChange={(e) => setEditingTier((p) => p && { ...p, capacity: e.target.value })}
                      placeholder="Up to 200 guests"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Price</label>
                    <input
                      value={editingTier.price}
                      onChange={(e) => setEditingTier((p) => p && { ...p, price: e.target.value })}
                      placeholder="$500 / half day"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={saveTier}
                    disabled={savingTier || !editingTier.name}
                    className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
                  >
                    <Save className="size-3.5 mr-1.5" />
                    {savingTier ? "Saving…" : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tiers.length === 0 && !editingTier ? (
            <Card className="bg-card border-border/60">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                No rental tiers defined yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {tiers.map((tier) => (
                <Card key={tier.id} className="bg-card border-border/60">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold text-charcoal">{tier.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tier.capacity}</p>
                    </div>
                    <p className="font-heading text-sm font-bold text-sage flex-shrink-0">{tier.price}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingTier({ ...tier }); setIsNewTier(false); }} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => deleteTier(tier.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Info,
  Save,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import type { JumuahTime, RamadanSchedule } from "@/types/database";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

export default function PrayerTimesAdmin() {
  const supabase = createClient();
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ── Jumu'ah ─────────────────────────────────────────────────── */
  const [jumuah, setJumuah] = useState<JumuahTime[]>([]);
  const [savingJ, setSavingJ] = useState(false);

  const fetchJumuah = useCallback(async () => {
    const { data } = await supabase
      .from("jumuah_times")
      .select("*")
      .order("khutbah_time");
    setJumuah((data as JumuahTime[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchJumuah();
  }, [fetchJumuah]);

  const updateJ = (id: string, key: string, val: string) =>
    setJumuah((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: val } : r))
    );

  const saveJumuah = async () => {
    setSavingJ(true);
    for (const jt of jumuah) {
      await supabase
        .from("jumuah_times")
        .update({
          session_label: jt.session_label,
          khutbah_time: jt.khutbah_time,
          iqama_time: jt.iqama_time,
        })
        .eq("id", jt.id);
    }
    setSavingJ(false);
    showToast("Jumu'ah times saved!");
  };

  /* ── Ramadan Qiyam ───────────────────────────────────────────── */
  const [ramadan, setRamadan] = useState<RamadanSchedule[]>([]);
  const [savingR, setSavingR] = useState(false);

  const fetchRamadan = useCallback(async () => {
    const { data } = await supabase
      .from("ramadan_schedule")
      .select("*")
      .order("date");
    setRamadan((data as RamadanSchedule[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchRamadan();
  }, [fetchRamadan]);

  const updateR = (id: string, key: string, val: string) =>
    setRamadan((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: val } : r))
    );

  const addRamadanRow = async () => {
    const { data } = await supabase
      .from("ramadan_schedule")
      .insert({ date: "", qiyam_time: "", suhoor_end: "", iftar_time: "", tarawih_time: "" })
      .select()
      .single();
    if (data) setRamadan((prev) => [...prev, data as RamadanSchedule]);
  };

  const deleteRamadanRow = async (id: string) => {
    await supabase.from("ramadan_schedule").delete().eq("id", id);
    setRamadan((prev) => prev.filter((r) => r.id !== id));
  };

  const saveRamadan = async () => {
    setSavingR(true);
    for (const row of ramadan) {
      await supabase
        .from("ramadan_schedule")
        .update({ date: row.date, qiyam_time: row.qiyam_time })
        .eq("id", row.id);
    }
    setSavingR(false);
    showToast("Ramadan schedule saved!");
  };

  /* ── Eid Settings ────────────────────────────────────────────── */
  const [eid, setEid] = useState({
    eid_fitr_date: "",
    eid_fitr_time: "",
    eid_fitr_location: "",
    eid_adha_date: "",
    eid_adha_time: "",
    eid_adha_location: "",
  });
  const [savingE, setSavingE] = useState(false);

  const fetchEid = useCallback(async () => {
    const keys = Object.keys(eid);
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .in("key", keys);
    if (data) {
      const map: Record<string, string> = {};
      for (const r of data) map[r.key] = r.value;
      setEid((prev) => ({ ...prev, ...map }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchEid();
  }, [fetchEid]);

  const saveEid = async () => {
    setSavingE(true);
    for (const [key, value] of Object.entries(eid)) {
      await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });
    }
    setSavingE(false);
    showToast("Eid settings saved!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">
          Prayer Times
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage Jumu&apos;ah, Ramadan, and Eid settings
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />
          {toast}
        </div>
      )}

      {/* ── Masjidal Banner ───────────────────────────────────────── */}
      <Card className="bg-sage/5 border-sage/20">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/15 text-sage shrink-0">
            <Info className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-charcoal">
              Daily Adhan &amp; Iqama Times
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily prayer times are synced automatically from Masjidal. To
              update them, log into your Masjidal portal.
            </p>
          </div>
          <a
            href="https://portal.masjidal.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs h-9 px-5"
            >
              <ExternalLink className="size-3.5 mr-1.5" />
              Open Masjidal Portal
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* ── Jumu'ah Section ───────────────────────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-heading text-lg font-bold text-charcoal">
              Jumu&apos;ah Times
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              Static — rarely changes
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            These times are stored in Supabase and do not come from Masjidal.
          </p>
          {jumuah.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No Jumu&apos;ah rows found. Add them in the Jumu&apos;ah admin
              page.
            </p>
          ) : (
            <div className="space-y-3">
              {jumuah.map((jt) => (
                <div
                  key={jt.id}
                  className="grid grid-cols-3 gap-3"
                >
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Session Label
                    </label>
                    <input
                      value={jt.session_label}
                      onChange={(e) =>
                        updateJ(jt.id, "session_label", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Khutbah Time
                    </label>
                    <input
                      value={jt.khutbah_time}
                      onChange={(e) =>
                        updateJ(jt.id, "khutbah_time", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Iqama Time
                    </label>
                    <input
                      value={jt.iqama_time}
                      onChange={(e) =>
                        updateJ(jt.id, "iqama_time", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={saveJumuah}
                  disabled={savingJ}
                  className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
                >
                  <Save className="size-3.5 mr-1.5" />
                  {savingJ ? "Saving…" : "Save Jumu'ah"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Ramadan Qiyam Section ─────────────────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-heading text-lg font-bold text-charcoal">
              Ramadan — Qiyam al-Layl
            </h2>
            <Button
              variant="outline"
              onClick={addRamadanRow}
              className="rounded-full text-xs h-8 px-4 border-sage text-sage hover:bg-sage hover:text-white"
            >
              <Plus className="size-3.5 mr-1" />
              Add Row
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Tarawih time comes from Masjidal. Only Qiyam times are managed here.
          </p>
          {ramadan.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No Ramadan rows yet. Click &quot;+ Add Row&quot; to start.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_40px] gap-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                <span>Date</span>
                <span>Qiyam Time</span>
                <span />
              </div>
              {ramadan.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center"
                >
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateR(row.id, "date", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="time"
                    value={row.qiyam_time}
                    onChange={(e) =>
                      updateR(row.id, "qiyam_time", e.target.value)
                    }
                    className={inputClass}
                  />
                  <button
                    onClick={() => deleteRamadanRow(row.id)}
                    className="flex items-center justify-center h-10 w-10 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={saveRamadan}
                  disabled={savingR}
                  className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
                >
                  <Save className="size-3.5 mr-1.5" />
                  {savingR ? "Saving…" : "Save Ramadan"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Eid Settings Section ──────────────────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-5">
          <h2 className="font-heading text-lg font-bold text-charcoal mb-1">
            Eid Prayers
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Update Eid prayer details shown on the Prayer Times page.
          </p>
          <div className="space-y-5">
            {/* Eid al-Fitr */}
            <div>
              <Badge className="bg-sage/10 text-sage border-0 text-[10px] font-semibold mb-2">
                Eid al-Fitr
              </Badge>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eid.eid_fitr_date}
                    onChange={(e) =>
                      setEid((p) => ({ ...p, eid_fitr_date: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Time
                  </label>
                  <input
                    value={eid.eid_fitr_time}
                    onChange={(e) =>
                      setEid((p) => ({ ...p, eid_fitr_time: e.target.value }))
                    }
                    placeholder="e.g. 8:00 AM & 9:30 AM"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Location
                  </label>
                  <input
                    value={eid.eid_fitr_location}
                    onChange={(e) =>
                      setEid((p) => ({
                        ...p,
                        eid_fitr_location: e.target.value,
                      }))
                    }
                    placeholder="Masjid Bilal Main Hall"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Eid al-Adha */}
            <div>
              <Badge className="bg-sage/10 text-sage border-0 text-[10px] font-semibold mb-2">
                Eid al-Adha
              </Badge>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eid.eid_adha_date}
                    onChange={(e) =>
                      setEid((p) => ({ ...p, eid_adha_date: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Time
                  </label>
                  <input
                    value={eid.eid_adha_time}
                    onChange={(e) =>
                      setEid((p) => ({ ...p, eid_adha_time: e.target.value }))
                    }
                    placeholder="e.g. 8:00 AM & 9:30 AM"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                    Location
                  </label>
                  <input
                    value={eid.eid_adha_location}
                    onChange={(e) =>
                      setEid((p) => ({
                        ...p,
                        eid_adha_location: e.target.value,
                      }))
                    }
                    placeholder="Masjid Bilal Main Hall"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={saveEid}
                disabled={savingE}
                className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
              >
                <Save className="size-3.5 mr-1.5" />
                {savingE ? "Saving…" : "Save Eid Settings"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

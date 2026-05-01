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
} from "lucide-react";
import type { YouTubePlaylist } from "@/types/database";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

export default function PlaylistsAdmin() {
  const supabase = createClient();
  const [items, setItems] = useState<YouTubePlaylist[]>([]);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<YouTubePlaylist | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Drag state
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("youtube_playlists")
      .select("*")
      .order("display_order", { ascending: true });
    setItems((data as YouTubePlaylist[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ── Drag-and-drop handlers ─────────────────────────── */
  const onDragStart = (idx: number) => {
    dragIdx.current = idx;
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };

  const onDragLeave = () => setDragOver(null);

  const onDrop = async (targetIdx: number) => {
    const fromIdx = dragIdx.current;
    setDragOver(null);
    dragIdx.current = null;
    if (fromIdx === null || fromIdx === targetIdx) return;

    // Reorder locally
    const updated = [...items];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(targetIdx, 0, moved);

    // Update display_order sequentially
    const withOrder = updated.map((item, i) => ({
      ...item,
      display_order: i + 1,
    }));
    setItems(withOrder);

    // Persist all orders
    await Promise.all(
      withOrder.map((item) =>
        supabase
          .from("youtube_playlists")
          .update({ display_order: item.display_order })
          .eq("id", item.id)
      )
    );
    showToast("Order updated!");
  };

  /* ── CRUD ───────────────────────────────────────────── */
  const startNew = () => {
    setEditing({
      id: "",
      label: "",
      playlist_url: "",
      description: "",
      display_order: items.length + 1,
      is_active: true,
      created_at: "",
    });
    setIsNew(true);
  };

  const startEdit = (p: YouTubePlaylist) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setIsNew(false);
  };

  const saveItem = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      label: editing.label,
      playlist_url: editing.playlist_url,
      description: editing.description,
      display_order: editing.display_order,
      is_active: editing.is_active,
    };
    if (isNew) {
      await supabase.from("youtube_playlists").insert(payload);
    } else {
      await supabase
        .from("youtube_playlists")
        .update(payload)
        .eq("id", editing.id);
    }
    setSaving(false);
    setEditing(null);
    setIsNew(false);
    fetchItems();
    showToast(isNew ? "Playlist added!" : "Playlist updated!");
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this playlist?")) return;
    await supabase.from("youtube_playlists").delete().eq("id", id);
    fetchItems();
    showToast("Playlist deleted.");
  };

  const toggleActive = async (p: YouTubePlaylist) => {
    await supabase
      .from("youtube_playlists")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">
            YouTube Playlists
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Changes save automatically.
          </p>
        </div>
        <Button
          onClick={startNew}
          className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 text-xs shadow-sm"
        >
          <Plus className="size-3.5 mr-1.5" />
          Add Playlist
        </Button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />
          {toast}
        </div>
      )}

      {/* Editor */}
      {editing && (
        <Card className="bg-card border-sage/30 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-charcoal">
                {isNew ? "New Playlist" : "Edit Playlist"}
              </h2>
              <button onClick={cancelEdit}>
                <X className="size-5 text-muted-foreground hover:text-charcoal" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Label *
                </label>
                <input
                  value={editing.label}
                  onChange={(e) =>
                    setEditing((p) => p && { ...p, label: e.target.value })
                  }
                  placeholder="e.g. Friday Khutbahs"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  YouTube Playlist URL *
                </label>
                <input
                  value={editing.playlist_url}
                  onChange={(e) =>
                    setEditing((p) =>
                      p && { ...p, playlist_url: e.target.value }
                    )
                  }
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editing.description}
                onChange={(e) =>
                  setEditing((p) =>
                    p && { ...p, description: e.target.value }
                  )
                }
                className={inputClass + " resize-y"}
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) =>
                    setEditing((p) =>
                      p && { ...p, is_active: e.target.checked }
                    )
                  }
                  className="accent-sage"
                />
                Active
              </label>
              <Button
                onClick={saveItem}
                disabled={saving || !editing.label || !editing.playlist_url}
                className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
              >
                <Save className="size-3.5 mr-1.5" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag-and-drop list */}
      {items.length === 0 && !editing ? (
        <Card className="bg-card border-border/60">
          <CardContent className="p-10 text-center text-muted-foreground text-sm">
            No playlists yet. Click &quot;Add Playlist&quot; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <Card
              key={item.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(idx)}
              onDragEnd={() => {
                dragIdx.current = null;
                setDragOver(null);
              }}
              className={`bg-card border-border/60 cursor-grab active:cursor-grabbing transition-all ${
                dragOver === idx
                  ? "border-sage ring-2 ring-sage/20"
                  : ""
              }`}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <GripVertical className="size-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground w-6 text-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm font-bold text-charcoal truncate">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item.playlist_url}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] border-0 flex-shrink-0 ${
                    item.is_active
                      ? "bg-sage/10 text-sage"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(item)}
                    className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors"
                  >
                    {item.is_active ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
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

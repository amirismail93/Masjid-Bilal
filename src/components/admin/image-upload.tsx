"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "uploads",
  folder = "images",
  label,
}: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError("");
    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    onChange(urlData.publicUrl);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-charcoal mb-1.5">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-warm-gray/30">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 text-charcoal hover:bg-white rounded-full h-8 px-3 text-xs"
            >
              <Upload className="size-3 mr-1" />
              Replace
            </Button>
            <Button
              type="button"
              onClick={handleRemove}
              className="bg-destructive/90 text-white hover:bg-destructive rounded-full h-8 px-3 text-xs"
            >
              <X className="size-3 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-sage/40 bg-warm-gray/20 hover:bg-sage/5 transition-colors cursor-pointer py-8 px-4"
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 text-sage animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <ImageIcon className="size-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-medium text-sage">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPG, WebP up to 5 MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Fallback: paste URL manually */}
      <div className="mt-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full rounded-lg border border-border bg-warm-white px-3 py-1.5 text-xs text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

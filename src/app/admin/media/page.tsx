"use client";

import { CrudPage, BoolBadge } from "@/components/admin/crud-page";

const columns = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "imam_name", label: "Imam / Speaker" },
  { key: "recorded_date", label: "Recorded" },
  { key: "is_featured", label: "Featured", render: BoolBadge },
];

const fields = [
  { key: "title", label: "Title", required: true },
  {
    key: "type",
    label: "Type",
    type: "select" as const,
    options: ["Khutbah", "Lecture", "Quran Recitation", "Live Stream", "Other"],
    required: true,
  },
  { key: "url", label: "Media URL", type: "url" as const, required: true, placeholder: "YouTube or audio link" },
  { key: "imam_name", label: "Imam / Speaker", placeholder: "e.g. Imam Ahmad Hassan" },
  { key: "recorded_date", label: "Recorded Date", type: "date" as const },
  { key: "is_featured", label: "Featured", type: "checkbox" as const },
];

const defaultValues = {
  title: "",
  type: "",
  url: "",
  imam_name: "",
  recorded_date: "",
  is_featured: false,
};

export default function MediaAdmin() {
  return (
    <CrudPage
      table="media"
      title="Media"
      description="Manage khutbahs, lectures, and media content"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="created_at"
      orderAsc={false}
    />
  );
}

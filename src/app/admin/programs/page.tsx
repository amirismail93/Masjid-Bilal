"use client";

import { CrudPage, BoolBadge } from "@/components/admin/crud-page";

const columns = [
  { key: "title", label: "Title" },
  { key: "schedule", label: "Schedule" },
  { key: "audience", label: "Audience" },
  { key: "is_active", label: "Active", render: BoolBadge },
];

const fields = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea" as const, required: true },
  { key: "schedule", label: "Schedule", placeholder: "e.g. Saturdays 10 AM – 12 PM" },
  {
    key: "audience",
    label: "Audience",
    type: "select" as const,
    options: ["All", "Youth", "Sisters", "Brothers", "Children", "Converts", "Seniors"],
  },
  { key: "is_active", label: "Active", type: "checkbox" as const },
];

const defaultValues = {
  title: "",
  description: "",
  schedule: "",
  audience: "All",
  is_active: true,
};

export default function ProgramsAdmin() {
  return (
    <CrudPage
      table="programs"
      title="Programs"
      description="Manage educational and community programs"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="title"
    />
  );
}

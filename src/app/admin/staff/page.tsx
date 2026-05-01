"use client";

import { CrudPage, BoolBadge } from "@/components/admin/crud-page";

const columns = [
  { key: "name", label: "Name" },
  { key: "title", label: "Title" },
  { key: "email", label: "Email" },
  { key: "display_order", label: "Order" },
  { key: "is_active", label: "Active", render: BoolBadge },
];

const fields = [
  { key: "name", label: "Full Name", required: true },
  { key: "title", label: "Title / Role", required: true, placeholder: "e.g. Resident Imam" },
  { key: "email", label: "Email", type: "email" as const },
  { key: "photo_url", label: "Photo URL", type: "url" as const },
  { key: "display_order", label: "Display Order", type: "number" as const },
  { key: "is_active", label: "Active", type: "checkbox" as const },
];

const defaultValues = {
  name: "",
  title: "",
  email: "",
  photo_url: "",
  display_order: 0,
  is_active: true,
};

export default function StaffAdmin() {
  return (
    <CrudPage
      table="staff"
      title="Staff"
      description="Manage staff directory listings"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="display_order"
    />
  );
}

"use client";

import { CrudPage, BoolBadge, Truncate } from "@/components/admin/crud-page";

const columns = [
  { key: "message", label: "Message", render: Truncate },
  { key: "is_active", label: "Active", render: BoolBadge },
  { key: "expires_at", label: "Expires" },
];

const fields = [
  { key: "message", label: "Message", type: "textarea" as const, required: true },
  { key: "is_active", label: "Active", type: "checkbox" as const },
  { key: "expires_at", label: "Expires At", type: "date" as const },
];

const defaultValues = {
  message: "",
  is_active: true,
  expires_at: "",
};

export default function AnnouncementsAdmin() {
  return (
    <CrudPage
      table="announcements"
      title="Announcements"
      description="Manage site-wide announcement banners"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="created_at"
      orderAsc={false}
    />
  );
}

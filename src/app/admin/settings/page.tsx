"use client";

import { CrudPage } from "@/components/admin/crud-page";

const columns = [
  { key: "key", label: "Key" },
  { key: "value", label: "Value" },
];

const fields = [
  { key: "key", label: "Setting Key", required: true, placeholder: "e.g. masjid_phone" },
  { key: "value", label: "Value", type: "textarea" as const, required: true },
];

const defaultValues = {
  key: "",
  value: "",
};

export default function SettingsAdmin() {
  return (
    <CrudPage
      table="site_settings"
      title="Site Settings"
      description="Manage key-value site configuration"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="key"
      idField="key"
    />
  );
}

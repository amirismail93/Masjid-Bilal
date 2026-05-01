"use client";

import { CrudPage } from "@/components/admin/crud-page";
import { to12hr } from "@/lib/format-time";

const TimeFmt = (v: unknown) => to12hr(v as string);

const columns = [
  { key: "session_label", label: "Session" },
  { key: "khutbah_time", label: "Khutbah", render: TimeFmt },
  { key: "iqama_time", label: "Iqama", render: TimeFmt },
];

const fields = [
  { key: "session_label", label: "Session Label", placeholder: "e.g. 1st Jumu'ah", required: true },
  { key: "khutbah_time", label: "Khutbah Time", type: "time" as const, required: true },
  { key: "iqama_time", label: "Iqama Time", type: "time" as const, required: true },
];

const defaultValues = { session_label: "", khutbah_time: "", iqama_time: "" };

export default function JumuahAdmin() {
  return (
    <CrudPage
      table="jumuah_times"
      title="Jumu'ah Times"
      description="Manage Friday prayer sessions"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="khutbah_time"
    />
  );
}

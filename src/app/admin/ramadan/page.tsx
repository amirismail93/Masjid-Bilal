"use client";

import { CrudPage } from "@/components/admin/crud-page";
import { to12hr } from "@/lib/format-time";

const TimeFmt = (v: unknown) => to12hr(v as string);

const columns = [
  { key: "date", label: "Date" },
  { key: "suhoor_end", label: "Suhoor End", render: TimeFmt },
  { key: "iftar_time", label: "Iftar", render: TimeFmt },
  { key: "tarawih_time", label: "Tarawih", render: TimeFmt },
  { key: "qiyam_time", label: "Qiyam", render: TimeFmt },
];

const fields = [
  { key: "date", label: "Date", type: "date" as const, required: true },
  { key: "suhoor_end", label: "Suhoor End", type: "time" as const, required: true },
  { key: "iftar_time", label: "Iftar Time", type: "time" as const, required: true },
  { key: "tarawih_time", label: "Tarawih Time", type: "time" as const, required: true },
  { key: "qiyam_time", label: "Qiyam Time", type: "time" as const },
];

const defaultValues = {
  date: "",
  suhoor_end: "",
  iftar_time: "",
  tarawih_time: "",
  qiyam_time: "",
};

export default function RamadanAdmin() {
  return (
    <CrudPage
      table="ramadan_schedule"
      title="Ramadan Schedule"
      description="Manage Ramadan fasting and prayer times"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="date"
    />
  );
}

"use client";

import { CrudPage, BoolBadge, Truncate } from "@/components/admin/crud-page";

const columns = [
  { key: "title", label: "Title" },
  { key: "event_date", label: "Date" },
  { key: "event_time", label: "Time" },
  { key: "category", label: "Category" },
  { key: "is_featured", label: "Featured", render: BoolBadge },
  { key: "is_published", label: "Published", render: BoolBadge },
];

const fields = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea" as const, required: true },
  { key: "event_date", label: "Event Date", type: "date" as const, required: true },
  { key: "event_time", label: "Event Time", type: "time" as const, required: true },
  { key: "location", label: "Location", placeholder: "e.g. Main Hall" },
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    options: ["Community", "Education", "Youth", "Sisters", "Fundraiser", "Interfaith", "Sports"],
    required: true,
  },
  { key: "flyer_url", label: "Flyer URL", type: "url" as const },
  { key: "rsvp_link", label: "RSVP Link", type: "url" as const },
  { key: "is_featured", label: "Featured event", type: "checkbox" as const },
  { key: "is_published", label: "Published", type: "checkbox" as const },
];

const defaultValues = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  location: "",
  category: "",
  flyer_url: "",
  rsvp_link: "",
  is_featured: false,
  is_published: true,
};

export default function EventsAdmin() {
  return (
    <CrudPage
      table="events"
      title="Events"
      description="Manage community events and calendars"
      columns={columns}
      fields={fields}
      defaultValues={defaultValues}
      orderBy="event_date"
      orderAsc={false}
    />
  );
}

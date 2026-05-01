export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  cta_label: string;
  cta_href: string;
  display_order: number;
  is_active: boolean;
}

export interface JanazahStep {
  id: string;
  step_number: number;
  description: string;
}

export interface RentalTier {
  id: string;
  name: string;
  capacity: string;
  price: string;
  display_order: number;
}

export interface PrayerTime {
  id: string;
  prayer_name: string;
  adhan_time: string;
  iqama_time: string;
  updated_at: string;
}

export interface JumuahTime {
  id: string;
  session_label: string;
  khutbah_time: string;
  iqama_time: string;
  updated_at: string;
}

export interface RamadanSchedule {
  id: string;
  date: string;
  suhoor_end: string;
  iftar_time: string;
  tarawih_time: string;
  qiyam_time: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  category: string;
  flyer_url: string | null;
  rsvp_link: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  schedule: string;
  audience: string;
  is_active: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  email: string;
  photo_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  type: string;
  url: string;
  imam_name: string;
  recorded_date: string;
  is_featured: boolean;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface PageSection {
  id: string;
  page: string;
  section_key: string;
  label: string;
  content: string;
  updated_at: string;
}

export interface YouTubePlaylist {
  id: string;
  label: string;
  playlist_url: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface RegistrationField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "textarea";
  required: boolean;
  options?: string[];
}

export interface EventPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  banner_image_url: string | null;
  registration_enabled: boolean;
  registration_fields: RegistrationField[];
  max_registrations: number | null;
  is_published: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_page_id: string;
  data: Record<string, string>;
  created_at: string;
}

/* ── Classes & Enrollment ─────────────────────────── */

export interface ClassItem {
  id: string;
  title: string;
  description: string;
  instructor: string;
  schedule: string;
  cost: number;
  capacity: number | null;
  location: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  payment_status: "unpaid" | "paid" | "waived";
  payment_amount: number | null;
  notes: string | null;
  created_at: string;
}

/* ── Form Submissions ────────────────────────────── */

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
}

export interface RentalSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  preferred_date: string;
  expected_guests: string;
  notes: string | null;
  created_at: string;
}

/* ── Donation ────────────────────────────────────── */

export interface DonationCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

/* ── Resources ───────────────────────────────────── */

export interface HalalRestaurant {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  display_order: number;
}

export interface MuslimBusiness {
  id: string;
  name: string;
  type: string;
  area: string;
  display_order: number;
}

export interface RecommendedApp {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

export interface RecommendedBook {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
}

export interface DownloadableResource {
  id: string;
  name: string;
  format: string;
  size: string;
  url: string | null;
  display_order: number;
}

/* ── About Page ──────────────────────────────────── */

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  display_order: number;
}

export interface CommunityStat {
  id: string;
  icon: string;
  value: string;
  label: string;
  display_order: number;
}

/* ── Social Links ────────────────────────────────── */

export interface SocialLink {
  id: string;
  label: string;
  icon: string;
  href: string;
  display_order: number;
}

/* ── Nikah ────────────────────────────────────────── */

export interface NikahRequest {
  id: string;
  bride_name: string;
  bride_phone: string;
  bride_email: string;
  bride_address: string;
  groom_name: string;
  groom_phone: string;
  groom_email: string;
  groom_address: string;
  wali_name: string;
  wali_phone: string;
  wali_relation: string;
  requested_date: string;
  requested_time: string;
  location_preference: string;
  num_guests: number | null;
  has_marriage_license: string;
  additional_notes: string | null;
  user_email: string;
  payment_link: string | null;
  status: string;
  submitted_at: string;
}

/* ── Dynamic Forms ───────────────────────────────── */

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "time" | "number" | "textarea" | "select" | "radio" | "checkbox";
  required: boolean;
  placeholder?: string;
  options?: string[];
  width: "full" | "half" | "third";
  section?: string;
}

export interface FormTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  fields: FormField[];
  notification_emails: string;
  success_title: string;
  success_message: string;
  submit_label: string;
  is_active: boolean;
  payment_amount: number | null;
  payment_label: string | null;
  payment_required: boolean;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_slug: string;
  data: Record<string, string>;
  created_at: string;
}

/* ── Payments (Stripe) ───────────────────────────── */

export interface Payment {
  id: string;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  category: string;
  designation: string | null;
  donor_name: string | null;
  donor_email: string | null;
  is_recurring: boolean;
  recurring_interval: string | null;
  stripe_subscription_id: string | null;
  metadata: Record<string, unknown>;
  linked_type: string | null;
  linked_id: string | null;
  created_at: string;
}

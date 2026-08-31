// Hand-written mirrors of the backend Pydantic models. Keep both sides in sync in one edit.

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "super_admin";
  plan: "free" | "pro" | "business";
  title: string;
  company: string;
  phone: string;
  avatar_url: string;
  networking_goal: string;
  onboarded: boolean;
}

export interface Social {
  label: string;
  url: string;
}

export interface CardInput {
  label: string;
  template: string;
  orientation: "portrait" | "landscape";
  accent: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  avatar_url: string;
  logo_url: string;
  services: string[];
  socials: Social[];
  booking_url: string;
  published: boolean;
}

export interface DigitalCard extends CardInput {
  id: string;
  slug: string;
  views: number;
}

export interface PublicCardData extends DigitalCard {
  owner_plan: string;
}

export interface CardExport {
  slug: string;
  wallet_pass_url: string;
  qr_url: string;
  note: string;
}

export interface RelationshipInput {
  name: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  website: string;
  avatar_url: string;
  met_at: string;
  event: string;
  date_met: string;
  category: string;
  tags: string[];
  interest: string;
  status: string;
  notes: string;
  opportunity_value: number;
  health: number;
}

export interface Relationship extends RelationshipInput {
  id: string;
  source: string;
  last_interaction: string | null;
  next_action: string | null;
  next_action_due: string | null;
}

export interface Interaction {
  id: string;
  relationship_id: string;
  kind: string;
  summary: string;
  created_at: string;
}

export interface FollowUpInput {
  relationship_id: string;
  title: string;
  kind: string;
  due_date: string;
  notes: string;
  status: "Pending" | "In Progress" | "Completed";
}

export interface FollowUp extends FollowUpInput {
  id: string;
  contact_name: string;
  contact_company: string;
  overdue: boolean;
}

export interface DashboardSummary {
  connections: number;
  new_connections_30d: number;
  active_relationships: number;
  dormant_relationships: number;
  followups_due: number;
  followups_overdue: number;
  followups_completed: number;
  opportunities: number;
  opportunity_value: number;
  card_views: number;
  relationship_health: number;
  plan: string;
}

export interface TrendPoint {
  label: string;
  connections: number;
  followups: number;
}

export interface StatusSlice {
  status: string;
  count: number;
}

export interface EventSlice {
  event: string;
  count: number;
}

export interface BadgeItem {
  name: string;
  description: string;
  earned: boolean;
}

export interface Analytics {
  summary: DashboardSummary;
  trend: TrendPoint[];
  by_status: StatusSlice[];
  by_event: EventSlice[];
  badges: BadgeItem[];
  completion_rate: number;
  conversion_rate: number;
  insights: string[];
}

export interface BlogPostInput {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  cover_url: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
}

export interface BlogPost extends BlogPostInput {
  id: string;
  slug: string;
  created_at: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  onboarded: boolean;
  connections: number;
}

export interface AdminStats {
  users: number;
  paid_users: number;
  cards: number;
  relationships: number;
  followups: number;
  posts: number;
  published_posts: number;
}

export interface Entitlement {
  feature: string;
  allowed: boolean;
  reason: string | null;
}

export interface PlanOption {
  id: string;
  label: string;
  amount: number;
  period: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface PaymentStatus {
  session_id: string;
  status: string;
  payment_status: string;
}

export const RELATIONSHIP_STATUSES = [
  "New",
  "Connected",
  "Qualified",
  "Follow Up",
  "In Progress",
  "Active",
  "Partner",
  "Customer",
  "Prospect",
  "Opportunity",
  "Dormant",
] as const;

export const PIPELINE_STAGES = [
  "New",
  "Connected",
  "Qualified",
  "Follow Up",
  "Opportunity",
  "Active",
  "Partner",
] as const;

export const CARD_TEMPLATES = [
  { id: "founder", name: "Founder", hint: "Bold identity, story-first" },
  { id: "sales", name: "Sales", hint: "Contact-forward, fast to act on" },
  { id: "recruitment", name: "Recruitment", hint: "Roles and services up front" },
  { id: "company", name: "Company", hint: "Logo-led, corporate tone" },
  { id: "event", name: "Event", hint: "Built for booths and badges" },
  { id: "services", name: "Professional Services", hint: "Services and booking" },
] as const;

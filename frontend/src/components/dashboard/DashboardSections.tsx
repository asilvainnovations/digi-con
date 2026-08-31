import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CreditCard,
  PlusCircle,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import CardCanvas from "@/components/cards/CardCanvas";
import {
  Avatar,
  EmptyState,
  ErrorState,
  HealthBar,
  LoadingState,
  MetricCard,
  QuickAction,
  SectionHeading,
  StatusBadge,
} from "@/components/kit";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardSummary, DigitalCard, FollowUp, Relationship } from "@/types";

export function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <SectionHeading eyebrow="Do next" title="Quick actions" testId="dashboard-quick-actions-heading" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        <QuickAction icon={<PlusCircle className="h-4 w-4" />} label="Create Card" to="/cards/new" testId="quick-create-card" />
        <QuickAction icon={<Share2 className="h-4 w-4" />} label="Share Card" to="/share" testId="quick-share-card" />
        <QuickAction icon={<UserPlus className="h-4 w-4" />} label="Add Contact" to="/contacts?new=1" testId="quick-add-contact" />
        <QuickAction icon={<CalendarClock className="h-4 w-4" />} label="Add Follow-up" to="/followups?new=1" testId="quick-add-followup" />
        <QuickAction icon={<Users className="h-4 w-4" />} label="View Network" to="/contacts" testId="quick-view-network" />
        <QuickAction icon={<BarChart3 className="h-4 w-4" />} label="Analytics" to="/analytics" testId="quick-view-analytics" />
      </div>
    </section>
  );
}

export function AttentionMetrics({ query }: { query: UseQueryResult<DashboardSummary> }) {
  const s = query.data;
  return (
    <section aria-label="Network at a glance">
      <SectionHeading eyebrow="Your network at a glance" title="What needs attention" testId="dashboard-metrics-heading" />
      {query.isLoading && <LoadingState testId="dashboard-metrics-loading" />}
      {query.isError && <ErrorState testId="dashboard-metrics-error" />}
      {s && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Connections" value={s.connections} hint={`${s.new_connections_30d} new in 30 days`} testId="metric-connections" />
          <MetricCard
            label="Follow-ups due"
            value={s.followups_due}
            hint={s.followups_overdue > 0 ? `${s.followups_overdue} overdue` : "All on schedule"}
            tone={s.followups_overdue > 0 ? "danger" : "cyan"}
            testId="metric-followups-due"
          />
          <MetricCard label="Opportunities" value={s.opportunities} hint={`$${s.opportunity_value.toLocaleString()} in play`} tone="gold" testId="metric-opportunities" />
          <MetricCard label="Card views" value={s.card_views} hint="Across your published cards" tone="cyan" testId="metric-card-views" />
        </div>
      )}
    </section>
  );
}

export function FollowUpsPanel({ query }: { query: UseQueryResult<FollowUp[]> }) {
  const open = (query.data ?? []).filter((f) => f.status !== "Completed").slice(0, 4);
  return (
    <section className="glass rounded-xl p-5" aria-label="Follow-ups due">
      <SectionHeading
        eyebrow="Follow up"
        title="What should I do next?"
        action={
          <Link to="/followups" className="dense text-sm text-sky hover:underline" data-testid="dashboard-followups-link">
            View all
          </Link>
        }
      />
      {query.isLoading && <LoadingState testId="dashboard-followups-loading" />}
      {query.isError && <ErrorState testId="dashboard-followups-error" />}
      {query.data && open.length === 0 && (
        <EmptyState
          title="You're all caught up."
          body="No open follow-ups. Capture a new connection and set the next action while it's fresh."
          action={
            <Link to="/contacts?new=1" className={buttonVariants({ size: "sm" })} data-testid="dashboard-empty-add-contact">
              Add Your First Connection
            </Link>
          }
          testId="dashboard-followups-empty"
        />
      )}
      <ul className="space-y-2.5">
        {open.map((f) => (
          <li key={f.id}>
            <Link
              to={`/contacts/${f.relationship_id}`}
              className="glass-soft flex items-center gap-3 rounded-lg p-3 transition-colors duration-200 hover:border-primary/40"
              data-testid={`dashboard-followup-${f.id}`}
            >
              <Avatar name={f.contact_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.title}</p>
                <p className="dense truncate text-xs text-muted-foreground">
                  {f.contact_name}
                  {f.contact_company ? ` · ${f.contact_company}` : ""} · due {f.due_date}
                </p>
              </div>
              <StatusBadge status={f.overdue ? "Overdue" : f.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RecentRelationshipsPanel({ query }: { query: UseQueryResult<Relationship[]> }) {
  const recent = (query.data ?? []).slice(0, 4);
  return (
    <section className="glass rounded-xl p-5" aria-label="Recent relationships">
      <SectionHeading
        eyebrow="Remember"
        title="Recent relationships"
        action={
          <Link to="/contacts" className="dense text-sm text-sky hover:underline" data-testid="dashboard-contacts-link">
            Open network
          </Link>
        }
      />
      {query.isError && <ErrorState testId="dashboard-contacts-error" />}
      {query.data && recent.length === 0 && (
        <EmptyState
          title="You haven't added anyone yet."
          body="Every conversation can become a relationship. Start with the last person you met."
          action={
            <Link to="/contacts?new=1" className={buttonVariants({ size: "sm" })} data-testid="dashboard-empty-contacts-cta">
              Add Your First Connection
            </Link>
          }
          testId="dashboard-contacts-empty"
        />
      )}
      <ul className="space-y-2.5">
        {recent.map((r) => (
          <li key={r.id}>
            <Link
              to={`/contacts/${r.id}`}
              className="glass-soft flex items-center gap-3 rounded-lg p-3 transition-colors duration-200 hover:border-primary/40"
              data-testid={`dashboard-contact-${r.id}`}
            >
              <Avatar name={r.name} url={r.avatar_url || undefined} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="dense truncate text-xs text-muted-foreground">
                  {r.position}
                  {r.company ? ` @ ${r.company}` : ""} · met at {r.event || r.met_at || "—"}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CardPanel({ query }: { query: UseQueryResult<DigitalCard[]> }) {
  const card = query.data?.[0];
  return (
    <section className="glass rounded-xl p-5" aria-label="Your DigiCon card">
      <SectionHeading
        eyebrow="Identity"
        title="Your DigiCon"
        action={
          card ? (
            <Link to={`/cards/${card.id}`} className="dense text-sm text-sky hover:underline" data-testid="dashboard-edit-card">
              Edit
            </Link>
          ) : undefined
        }
      />
      {query.isLoading && <LoadingState testId="dashboard-card-loading" />}
      {card ? (
        <>
          <CardCanvas card={card} testId="dashboard-card-preview" />
          <Link
            to={`/c/${card.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 w-full")}
            data-testid="dashboard-view-public-card"
          >
            View public card
            <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </>
      ) : (
        !query.isLoading && (
          <EmptyState
            icon={<CreditCard className="h-5 w-5" />}
            title="No card yet"
            body="Create your digital identity — it's the entry point to everything else."
            action={
              <Link to="/cards/new" className={buttonVariants({ size: "sm" })} data-testid="dashboard-create-card-cta">
                Create Card
              </Link>
            }
            testId="dashboard-card-empty"
          />
        )
      )}
    </section>
  );
}

export function HealthPanel({ summary, isPaid }: { summary: DashboardSummary; isPaid: boolean }) {
  const rows = [
    { label: "Active relationships", value: summary.active_relationships, testId: "dashboard-active-count" },
    { label: "Going quiet", value: summary.dormant_relationships, testId: "dashboard-dormant-count" },
    { label: "Follow-ups completed", value: summary.followups_completed, testId: "dashboard-completed-count" },
  ];
  return (
    <section className="glass rounded-xl p-5" aria-label="Relationship health">
      <SectionHeading eyebrow="Grow" title="Relationship health" />
      <HealthBar value={summary.relationship_health} testId="dashboard-health-bar" />
      <dl className="dense mt-4 space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd data-testid={row.testId}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <Link
        to="/analytics"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
        data-testid="dashboard-analytics-cta"
      >
        {isPaid ? "Open analytics" : "See what Pro unlocks"}
      </Link>
    </section>
  );
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { DashboardSummary, DigitalCard, FollowUp, Relationship } from "@/types";

export default function Dashboard() {
  const { user, isPaid } = useAuth();
  const summary = useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<DashboardSummary>("/dashboard") });
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards") });
  const followups = useQuery({ queryKey: ["followups", ""], queryFn: () => apiGet<FollowUp[]>("/followups") });
  const contacts = useQuery({ queryKey: ["relationships", "", "", ""], queryFn: () => apiGet<Relationship[]>("/relationships") });

  const s = summary.data;
  const openFollowups = (followups.data ?? []).filter((f) => f.status !== "Completed").slice(0, 4);
  const recent = (contacts.data ?? []).slice(0, 4);
  const primaryCard = cards.data?.[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="animate-rise flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name ?? "DigiCon"} url={user?.avatar_url || undefined} testId="dashboard-avatar" />
          <div>
            <p className="label-caps">
              {isPaid ? "DigiCon Pro" : "DigiCon Free"} · {user?.company || "Your workspace"}
            </p>
            <h1 className="font-heading text-2xl font-extrabold" data-testid="dashboard-greeting">
              {s && s.followups_due > 0
                ? `You have ${s.followups_due} follow-up${s.followups_due === 1 ? "" : "s"} waiting`
                : `Welcome back, ${(user?.name ?? "there").split(" ")[0]}`}
            </h1>
          </div>
        </div>
        <Link to="/share" className={buttonVariants({ size: "sm" })} data-testid="dashboard-share-cta">
          <Share2 className="mr-2 h-4 w-4" aria-hidden />
          Share my DigiCon
        </Link>
      </header>

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

      <section aria-label="Network at a glance">
        <SectionHeading eyebrow="Your network at a glance" title="What needs attention" testId="dashboard-metrics-heading" />
        {summary.isLoading && <LoadingState testId="dashboard-metrics-loading" />}
        {summary.isError && <ErrorState testId="dashboard-metrics-error" />}
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

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
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
            {followups.isLoading && <LoadingState testId="dashboard-followups-loading" />}
            {followups.isError && <ErrorState testId="dashboard-followups-error" />}
            {followups.data && openFollowups.length === 0 && (
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
              {openFollowups.map((f) => (
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
            {contacts.isError && <ErrorState testId="dashboard-contacts-error" />}
            {contacts.data && recent.length === 0 && (
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
        </div>

        <div className="space-y-6">
          <section className="glass rounded-xl p-5" aria-label="Your DigiCon card">
            <SectionHeading
              eyebrow="Identity"
              title="Your DigiCon"
              action={
                primaryCard ? (
                  <Link to={`/cards/${primaryCard.id}`} className="dense text-sm text-sky hover:underline" data-testid="dashboard-edit-card">
                    Edit
                  </Link>
                ) : undefined
              }
            />
            {cards.isLoading && <LoadingState testId="dashboard-card-loading" />}
            {primaryCard ? (
              <>
                <CardCanvas card={primaryCard} testId="dashboard-card-preview" />
                <Link
                  to={`/c/${primaryCard.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 w-full")}
                  data-testid="dashboard-view-public-card"
                >
                  View public card
                  <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </>
            ) : (
              !cards.isLoading && (
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

          {s && (
            <section className="glass rounded-xl p-5" aria-label="Relationship health">
              <SectionHeading eyebrow="Grow" title="Relationship health" />
              <HealthBar value={s.relationship_health} testId="dashboard-health-bar" />
              <dl className="dense mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Active relationships</dt>
                  <dd data-testid="dashboard-active-count">{s.active_relationships}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Going quiet</dt>
                  <dd data-testid="dashboard-dormant-count">{s.dormant_relationships}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Follow-ups completed</dt>
                  <dd data-testid="dashboard-completed-count">{s.followups_completed}</dd>
                </div>
              </dl>
              <Link
                to="/analytics"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
                data-testid="dashboard-analytics-cta"
              >
                {isPaid ? "Open analytics" : "See what Pro unlocks"}
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

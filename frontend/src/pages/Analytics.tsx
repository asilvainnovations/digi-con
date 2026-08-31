import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lightbulb, Trophy } from "lucide-react";
import {
  ErrorState,
  LoadingState,
  MetricCard,
  SectionHeading,
  UpgradeGate,
} from "@/components/kit";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/session";
import type { Analytics as AnalyticsData } from "@/types";

export default function Analytics() {
  const { isPaid } = useAuth();
  const data = useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiGet<AnalyticsData>("/analytics"),
    enabled: isPaid,
    retry: false,
  });

  if (!isPaid) {
    return (
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Grow" title="Networking analytics" testId="analytics-heading" />
        <UpgradeGate
          feature="Networking intelligence"
          description="See who to follow up with, which relationships are going quiet, where your best connections come from, and how consistently you follow through."
          testId="analytics-upgrade-gate"
        />
      </div>
    );
  }

  const a = data.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeading eyebrow="Grow" title="Networking analytics" testId="analytics-heading" />
      {data.isLoading && <LoadingState testId="analytics-loading" />}
      {data.isError && <ErrorState testId="analytics-error" />}

      {a && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Total connections" value={a.summary.connections} hint={`${a.summary.new_connections_30d} new in 30 days`} testId="analytics-metric-connections" />
            <MetricCard label="Active relationships" value={a.summary.active_relationships} tone="cyan" hint={`${a.summary.dormant_relationships} going quiet`} testId="analytics-metric-active" />
            <MetricCard label="Follow-up completion" value={`${a.completion_rate}%`} tone={a.completion_rate >= 70 ? "cyan" : "blue"} hint={`${a.summary.followups_completed} completed`} testId="analytics-metric-completion" />
            <MetricCard label="Connection → opportunity" value={`${a.conversion_rate}%`} tone="gold" hint={`$${a.summary.opportunity_value.toLocaleString()} in play`} testId="analytics-metric-conversion" />
          </div>

          <section className="glass rounded-xl p-5" aria-label="Insights">
            <SectionHeading eyebrow="Actionable" title="What this means" />
            <ul className="space-y-2.5" data-testid="analytics-insights">
              {a.insights.map((i) => (
                <li key={i} className="dense flex items-start gap-2.5 text-sm">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  {i}
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-xl p-5" aria-label="Networking activity trend">
              <SectionHeading eyebrow="Activity" title="Networking trend" />
              <div className="h-56" data-testid="analytics-trend-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={a.trend}>
                    <defs>
                      <linearGradient id="grad-conn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1d3255" vertical={false} />
                    <XAxis dataKey="label" stroke="#93a7c7" fontSize={12} />
                    <YAxis stroke="#93a7c7" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#0b1730", border: "1px solid #1d3255", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="connections" stroke="#38bdf8" fill="url(#grad-conn)" strokeWidth={2} />
                    <Area type="monotone" dataKey="followups" stroke="#f0b429" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass rounded-xl p-5" aria-label="Connection sources">
              <SectionHeading eyebrow="Sources" title="Where connections come from" />
              <div className="h-56" data-testid="analytics-events-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={a.by_event} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid stroke="#1d3255" horizontal={false} />
                    <XAxis type="number" stroke="#93a7c7" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="event" stroke="#93a7c7" fontSize={10} width={120} />
                    <Tooltip contentStyle={{ background: "#0b1730", border: "1px solid #1d3255", borderRadius: 12 }} />
                    <Bar dataKey="count" fill="#2f7dff" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="glass rounded-xl p-5" aria-label="Pipeline distribution">
            <SectionHeading eyebrow="Distribution" title="Relationships by status" />
            <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4" data-testid="analytics-status-list">
              {a.by_status.map((s) => (
                <li key={s.status} className="glass-soft flex items-center justify-between rounded-lg px-3 py-2">
                  <span className="dense text-sm text-muted-foreground">{s.status}</span>
                  <span className="metric text-sm text-sky">{s.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass rounded-xl p-5" aria-label="Badges">
            <SectionHeading eyebrow="Milestones" title="Your networking badges" />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="analytics-badges">
              {a.badges.map((b) => (
                <li
                  key={b.name}
                  className={`rounded-xl p-4 ${b.earned ? "metal-edge" : "glass-soft opacity-70"}`}
                  data-testid={`analytics-badge-${b.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className={`h-4 w-4 ${b.earned ? "text-gold" : "text-muted-foreground"}`} aria-hidden />
                    <p className={`text-sm font-semibold ${b.earned ? "gold-text" : ""}`}>{b.name}</p>
                  </div>
                  <p className="dense mt-1 text-xs text-muted-foreground">{b.description}</p>
                  <p className="dense mt-2 text-xs">{b.earned ? "Earned" : "Not yet earned"}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

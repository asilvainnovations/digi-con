import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Avatar, ErrorState, LoadingState, SectionHeading, UpgradeGate } from "@/components/kit";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/session";
import { PIPELINE_STAGES, type Relationship } from "@/types";

export default function Crm() {
  const { isPaid } = useAuth();
  const list = useQuery({
    queryKey: ["relationships", "", "", ""],
    queryFn: () => apiGet<Relationship[]>("/relationships"),
    enabled: isPaid,
  });

  if (!isPaid) {
    return (
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Manage" title="CRM pipeline" testId="crm-heading" />
        <UpgradeGate
          feature="Lightweight CRM pipeline"
          description="Move every connection through New → Connected → Qualified → Follow Up → Opportunity → Active → Partner, without the weight of an enterprise CRM."
          testId="crm-upgrade-gate"
        />
      </div>
    );
  }

  const byStage = (stage: string) => (list.data ?? []).filter((r) => r.status === stage);
  const other = (list.data ?? []).filter((r) => !PIPELINE_STAGES.includes(r.status as never));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <SectionHeading eyebrow="Manage" title="CRM pipeline" testId="crm-heading" />
      {list.isLoading && <LoadingState testId="crm-loading" />}
      {list.isError && <ErrorState testId="crm-error" />}

      <div className="flex gap-4 overflow-x-auto pb-3" data-testid="crm-board">
        {PIPELINE_STAGES.map((stage) => (
          <section key={stage} className="min-w-[240px] flex-1" aria-label={`${stage} stage`} data-testid={`crm-column-${stage.replace(/\s+/g, "-").toLowerCase()}`}>
            <header className="glass-soft mb-2.5 flex items-center justify-between rounded-lg px-3 py-2">
              <p className="dense text-sm font-medium">{stage}</p>
              <span className="metric text-sm text-sky">{byStage(stage).length}</span>
            </header>
            <ul className="space-y-2.5">
              {byStage(stage).map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/contacts/${r.id}`}
                    className="glass flex items-start gap-2.5 rounded-lg p-3 transition-transform duration-200 hover:-translate-y-0.5"
                    data-testid={`crm-card-${r.id}`}
                  >
                    <Avatar name={r.name} url={r.avatar_url || undefined} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.name}</p>
                      <p className="dense truncate text-xs text-muted-foreground">{r.company || r.position || "—"}</p>
                      {r.opportunity_value > 0 && (
                        <p className="dense mt-1 text-xs text-gold">${r.opportunity_value.toLocaleString()}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
              {byStage(stage).length === 0 && (
                <li className="dense glass-soft rounded-lg p-3 text-xs text-muted-foreground">Nothing here yet.</li>
              )}
            </ul>
          </section>
        ))}
      </div>

      {other.length > 0 && (
        <section className="glass rounded-xl p-5" aria-label="Other statuses">
          <SectionHeading eyebrow="Outside the pipeline" title="Customers, prospects and dormant" />
          <ul className="grid gap-2 sm:grid-cols-2">
            {other.map((r) => (
              <li key={r.id}>
                <Link to={`/contacts/${r.id}`} className="glass-soft flex items-center gap-2.5 rounded-lg p-3" data-testid={`crm-other-${r.id}`}>
                  <Avatar name={r.name} size="sm" />
                  <span className="truncate text-sm">{r.name}</span>
                  <span className="dense ml-auto text-xs text-muted-foreground">{r.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

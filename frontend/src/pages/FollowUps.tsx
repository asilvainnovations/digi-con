import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ListChecks, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, EmptyState, ErrorState, LoadingState, SectionHeading, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import type { FollowUp } from "@/types";
import { AddContactDialog } from "@/pages/Contacts";

const FILTERS = [
  { id: "open", label: "Open" },
  { id: "overdue", label: "Overdue" },
  { id: "Completed", label: "Completed" },
  { id: "all", label: "All" },
];

export default function FollowUps() {
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("open");
  const [addOpen, setAddOpen] = useState(params.get("new") === "1");

  const list = useQuery({ queryKey: ["followups", ""], queryFn: () => apiGet<FollowUp[]>("/followups") });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["followups"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["relationships"] });
  };

  const complete = useMutation({
    mutationFn: (id: string) => apiPatch<FollowUp>(`/followups/${id}`, { status: "Completed" }),
    onSuccess: () => {
      invalidate();
      toast.success("Follow-up completed");
    },
    onError: () => toast.error("Couldn't update that follow-up."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/followups/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Follow-up removed");
    },
  });

  const items = (list.data ?? []).filter((f) => {
    if (filter === "all") return true;
    if (filter === "open") return f.status !== "Completed";
    if (filter === "overdue") return f.overdue;
    return f.status === filter;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SectionHeading
        eyebrow="Follow up"
        title="What should I do next?"
        action={
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} data-testid="followups-add-contact">
            Capture a connection
          </Button>
        }
        testId="followups-heading"
      />

      <Tabs value={filter} onValueChange={(v: string) => setFilter(v)}>
        <TabsList variant="line">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.id} value={f.id} data-testid={`followups-filter-${f.id.toLowerCase()}`}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.isLoading && <LoadingState testId="followups-loading" />}
      {list.isError && <ErrorState testId="followups-error" />}
      {list.data && items.length === 0 && (
        <EmptyState
          icon={<ListChecks className="h-5 w-5" />}
          title="You're all caught up."
          body="Nothing here right now. Open a relationship and set the next action while the conversation is fresh."
          action={
            <Link to="/contacts" className="text-sm text-sky hover:underline" data-testid="followups-empty-cta">
              Go to my network
            </Link>
          }
          testId="followups-empty"
        />
      )}

      <ul className="space-y-3" data-testid="followups-list">
        {items.map((f) => (
          <li key={f.id} className="glass flex flex-wrap items-center gap-3 rounded-xl p-4" data-testid={`followup-item-${f.id}`}>
            <Avatar name={f.contact_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" data-testid={`followup-title-${f.id}`}>
                {f.title}
              </p>
              <Link
                to={`/contacts/${f.relationship_id}`}
                className="dense truncate text-xs text-muted-foreground hover:text-sky"
                data-testid={`followup-contact-${f.id}`}
              >
                {f.contact_name}
                {f.contact_company ? ` · ${f.contact_company}` : ""} · {f.kind} · due {f.due_date}
              </Link>
            </div>
            <StatusBadge status={f.overdue ? "Overdue" : f.status} testId={`followup-status-${f.id}`} />
            {f.status !== "Completed" && (
              <Button size="sm" onClick={() => complete.mutate(f.id)} data-testid={`followup-complete-${f.id}`}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden />
                Complete
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete follow-up ${f.title}`}
              onClick={() => remove.mutate(f.id)}
              data-testid={`followup-delete-${f.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <AddContactDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

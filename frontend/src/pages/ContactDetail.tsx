import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarPlus, MessageSquarePlus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  ErrorState,
  HealthBar,
  LoadingState,
  SectionHeading,
  StatusBadge,
} from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import {
  RELATIONSHIP_STATUSES,
  type FollowUp,
  type Interaction,
  type Relationship,
  type RelationshipInput,
} from "@/types";

export default function ContactDetail() {
  const { relId = "" } = useParams<{ relId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<RelationshipInput | null>(null);
  const [note, setNote] = useState("");
  const [fu, setFu] = useState({ title: "", kind: "Task", due_date: new Date().toISOString().slice(0, 10) });

  const rel = useQuery({
    queryKey: ["relationship", relId],
    queryFn: () => apiGet<Relationship>(`/relationships/${relId}`),
    retry: false,
  });
  const interactions = useQuery({
    queryKey: ["interactions", relId],
    queryFn: () => apiGet<Interaction[]>(`/relationships/${relId}/interactions`),
  });
  const followups = useQuery({ queryKey: ["followups", ""], queryFn: () => apiGet<FollowUp[]>("/followups") });

  useEffect(() => {
    if (rel.data && !form) {
      const { id: _id, source: _s, last_interaction: _l, next_action: _n, next_action_due: _d, ...rest } = rel.data;
      setForm(rest);
    }
  }, [rel.data, form]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["relationship", relId] });
    qc.invalidateQueries({ queryKey: ["relationships"] });
    qc.invalidateQueries({ queryKey: ["interactions", relId] });
    qc.invalidateQueries({ queryKey: ["followups"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const save = useMutation({
    mutationFn: () => apiPut<Relationship>(`/relationships/${relId}`, form),
    onSuccess: () => {
      invalidate();
      toast.success("Relationship updated");
    },
    onError: () => toast.error("Couldn't save your changes."),
  });

  const addNote = useMutation({
    mutationFn: () => apiPost<Interaction>(`/relationships/${relId}/interactions`, { kind: "Note", summary: note }),
    onSuccess: () => {
      setNote("");
      invalidate();
      toast.success("Interaction logged");
    },
    onError: () => toast.error("Couldn't log that interaction."),
  });

  const addFollowUp = useMutation({
    mutationFn: () =>
      apiPost<FollowUp>("/followups", {
        relationship_id: relId,
        title: fu.title,
        kind: fu.kind,
        due_date: fu.due_date,
        notes: "",
        status: "Pending",
      }),
    onSuccess: () => {
      setFu({ ...fu, title: "" });
      invalidate();
      toast.success("Follow-up scheduled");
    },
    onError: () => toast.error("Couldn't create that follow-up."),
  });

  const completeFollowUp = useMutation({
    mutationFn: (id: string) => apiPatch<FollowUp>(`/followups/${id}`, { status: "Completed" }),
    onSuccess: () => {
      invalidate();
      toast.success("Nice — follow-up completed");
    },
  });

  const remove = useMutation({
    mutationFn: () => apiDelete(`/relationships/${relId}`),
    onSuccess: () => {
      invalidate();
      toast.success("Relationship removed");
      navigate("/contacts");
    },
  });

  if (rel.isLoading) return <LoadingState testId="detail-loading" />;
  if (rel.isError || !rel.data) return <ErrorState label="We couldn't find that relationship." testId="detail-error" />;

  const r = rel.data;
  const relFollowups = (followups.data ?? []).filter((f) => f.relationship_id === relId);
  const set = <K extends keyof RelationshipInput>(key: K, value: RelationshipInput[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/contacts" className="dense inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" data-testid="detail-back">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to network
      </Link>

      <header className="glass animate-rise rounded-xl p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={r.name} url={r.avatar_url || undefined} size="lg" testId="detail-avatar" />
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl font-extrabold" data-testid="detail-name">
              {r.name}
            </h1>
            <p className="dense text-sm text-muted-foreground" data-testid="detail-role">
              {r.position}
              {r.company ? ` @ ${r.company}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={r.status} testId="detail-status" />
              {r.opportunity_value > 0 && (
                <span className="dense metal-edge rounded-full px-2.5 py-0.5 text-xs text-gold" data-testid="detail-opportunity">
                  ${r.opportunity_value.toLocaleString()} opportunity
                </span>
              )}
              {r.tags.map((t) => (
                <span key={t} className="dense rounded-full bg-secondary/70 px-2 py-0.5 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Delete relationship" onClick={() => remove.mutate()} data-testid="detail-delete">
            <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="label-caps">How we met</p>
            <p className="dense text-sm" data-testid="detail-met-at">
              {r.met_at || r.event || "—"}
              {r.date_met ? ` · ${r.date_met}` : ""}
            </p>
          </div>
          <div>
            <p className="label-caps">Next action</p>
            <p className="dense text-sm text-sky" data-testid="detail-next-action">
              {r.next_action ? `${r.next_action} · due ${r.next_action_due}` : "Keep the relationship moving — add one."}
            </p>
          </div>
          <div>
            <p className="label-caps">Relationship health</p>
            <HealthBar value={r.health} testId="detail-health" />
          </div>
        </div>
      </header>

      <Tabs defaultValue="context">
        <TabsList variant="line">
          <TabsTrigger value="context" data-testid="detail-tab-context">
            Context
          </TabsTrigger>
          <TabsTrigger value="followups" data-testid="detail-tab-followups">
            Follow-ups
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="detail-tab-history">
            Interactions
          </TabsTrigger>
          <TabsTrigger value="edit" data-testid="detail-tab-edit">
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="context" className="space-y-4 pt-4">
          <section className="glass rounded-xl p-5">
            <SectionHeading eyebrow="Conversation" title="What we discussed" />
            <p className="dense whitespace-pre-line text-sm text-muted-foreground" data-testid="detail-notes">
              {r.notes || "No conversation notes yet — add what they need while it's fresh."}
            </p>
            {r.interest && (
              <p className="dense mt-3 text-sm">
                <span className="label-caps mr-2">Shared purpose</span>
                {r.interest}
              </p>
            )}
          </section>
          <section className="glass rounded-xl p-5">
            <SectionHeading eyebrow="Contact information" title="How to reach them" />
            <dl className="dense grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd data-testid="detail-email">{r.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd data-testid="detail-phone">{r.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd>{r.category}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last interaction</dt>
                <dd data-testid="detail-last-interaction">
                  {r.last_interaction ? new Date(r.last_interaction).toLocaleDateString() : "—"}
                </dd>
              </div>
            </dl>
          </section>
          <section className="glass rounded-xl p-5">
            <SectionHeading eyebrow="Log" title="Add an interaction" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Called to discuss the proposal timeline…"
                aria-label="Interaction summary"
                data-testid="detail-note-input"
              />
              <Button
                onClick={() => addNote.mutate()}
                disabled={note.trim().length === 0 || addNote.isPending}
                data-testid="detail-note-submit"
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" aria-hidden />
                Log
              </Button>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="followups" className="space-y-4 pt-4">
          <section className="glass rounded-xl p-5">
            <SectionHeading eyebrow="Follow up" title="Schedule the next action" />
            <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="fu-title">Action</Label>
                <Input
                  id="fu-title"
                  value={fu.title}
                  onChange={(e) => setFu({ ...fu, title: e.target.value })}
                  placeholder="Send partnership proposal"
                  data-testid="detail-followup-title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fu-kind">Type</Label>
                <Select value={fu.kind} onValueChange={(value: string) => setFu({ ...fu, kind: value })}>
                  <SelectTrigger id="fu-kind" data-testid="detail-followup-kind">
                    <SelectValue>{(v) => (v as string) || "Task"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {["Task", "Proposal", "Meeting", "Quotation", "Introduction", "Portfolio"].map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fu-due">Due date</Label>
                <Input
                  id="fu-due"
                  type="date"
                  value={fu.due_date}
                  onChange={(e) => setFu({ ...fu, due_date: e.target.value })}
                  data-testid="detail-followup-due"
                />
              </div>
              <Button
                onClick={() => addFollowUp.mutate()}
                disabled={fu.title.trim().length === 0 || addFollowUp.isPending}
                data-testid="detail-followup-submit"
              >
                <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
                Add
              </Button>
            </div>
          </section>

          <ul className="space-y-2.5" data-testid="detail-followups-list">
            {relFollowups.length === 0 && (
              <li className="dense glass-soft rounded-xl p-4 text-sm text-muted-foreground">
                You're all caught up on this relationship.
              </li>
            )}
            {relFollowups.map((f) => (
              <li key={f.id} className="glass flex items-center gap-3 rounded-xl p-4" data-testid={`detail-followup-${f.id}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.title}</p>
                  <p className="dense text-xs text-muted-foreground">
                    {f.kind} · due {f.due_date}
                  </p>
                </div>
                <StatusBadge status={f.overdue ? "Overdue" : f.status} />
                {f.status !== "Completed" && (
                  <Button size="sm" variant="outline" onClick={() => completeFollowUp.mutate(f.id)} data-testid={`detail-followup-complete-${f.id}`}>
                    Complete
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <section className="glass rounded-xl p-5">
            <SectionHeading eyebrow="Interaction history" title="Everything that happened" />
            {interactions.isLoading && <LoadingState testId="detail-interactions-loading" />}
            <ol className="relative space-y-4 border-l border-border pl-5" data-testid="detail-interactions-list">
              {interactions.data?.map((i) => (
                <li key={i.id} className="relative" data-testid={`detail-interaction-${i.id}`}>
                  <span className="absolute -left-[1.55rem] top-1.5 h-2.5 w-2.5 rounded-full bg-sky animate-pulse-node" aria-hidden />
                  <p className="text-sm font-medium">{i.kind}</p>
                  <p className="dense text-sm text-muted-foreground">{i.summary}</p>
                  <p className="dense text-xs text-muted-foreground/70">
                    {new Date(i.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
              {interactions.data?.length === 0 && (
                <li className="dense text-sm text-muted-foreground">No interactions logged yet.</li>
              )}
            </ol>
          </section>
        </TabsContent>

        <TabsContent value="edit" className="pt-4">
          {form && (
            <section className="glass space-y-3 rounded-xl p-5">
              <SectionHeading eyebrow="Manage" title="Edit relationship" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ed-name">Name</Label>
                  <Input id="ed-name" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="edit-name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ed-company">Company</Label>
                  <Input id="ed-company" value={form.company} onChange={(e) => set("company", e.target.value)} data-testid="edit-company" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ed-status">Status</Label>
                  <Select value={form.status} onValueChange={(value: string) => set("status", value)}>
                    <SelectTrigger id="ed-status" data-testid="edit-status">
                      <SelectValue>{(v) => (v as string) || "New"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ed-health">Relationship health ({form.health}%)</Label>
                  <Input
                    id="ed-health"
                    type="range"
                    min={0}
                    max={100}
                    value={form.health}
                    onChange={(e) => set("health", Number(e.target.value))}
                    data-testid="edit-health"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-notes">Notes</Label>
                <Textarea id="ed-notes" rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} data-testid="edit-notes" />
              </div>
              <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="edit-save">
                <Save className="mr-2 h-4 w-4" aria-hidden />
                {save.isPending ? "Saving…" : "Save changes"}
              </Button>
            </section>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

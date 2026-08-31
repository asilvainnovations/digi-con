import { useState } from "react";
import { CalendarPlus, MessageSquarePlus, Save, Trash2 } from "lucide-react";
import { Avatar, HealthBar, LoadingState, SectionHeading, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { NewFollowUp } from "@/hooks/useContactDetail";
import {
  RELATIONSHIP_STATUSES,
  type FollowUp,
  type Interaction,
  type Relationship,
  type RelationshipInput,
} from "@/types";

const FOLLOWUP_KINDS = ["Task", "Proposal", "Meeting", "Quotation", "Introduction", "Portfolio"];

export function DetailHeader({ rel, onDelete }: { rel: Relationship; onDelete: () => void }) {
  return (
    <header className="glass animate-rise rounded-xl p-5">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar name={rel.name} url={rel.avatar_url || undefined} size="lg" testId="detail-avatar" />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-extrabold" data-testid="detail-name">
            {rel.name}
          </h1>
          <p className="dense text-sm text-muted-foreground" data-testid="detail-role">
            {rel.position}
            {rel.company ? ` @ ${rel.company}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={rel.status} testId="detail-status" />
            {rel.opportunity_value > 0 && (
              <span className="dense metal-edge rounded-full px-2.5 py-0.5 text-xs text-gold" data-testid="detail-opportunity">
                ${rel.opportunity_value.toLocaleString()} opportunity
              </span>
            )}
            {rel.tags.map((t) => (
              <span key={t} className="dense rounded-full bg-secondary/70 px-2 py-0.5 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Delete relationship" onClick={onDelete} data-testid="detail-delete">
          <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
        </Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="label-caps">How we met</p>
          <p className="dense text-sm" data-testid="detail-met-at">
            {rel.met_at || rel.event || "—"}
            {rel.date_met ? ` · ${rel.date_met}` : ""}
          </p>
        </div>
        <div>
          <p className="label-caps">Next action</p>
          <p className="dense text-sm text-sky" data-testid="detail-next-action">
            {rel.next_action
              ? `${rel.next_action} · due ${rel.next_action_due}`
              : "Keep the relationship moving — add one."}
          </p>
        </div>
        <div>
          <p className="label-caps">Relationship health</p>
          <HealthBar value={rel.health} testId="detail-health" />
        </div>
      </div>
    </header>
  );
}

export function ContextPanel({
  rel,
  onLogInteraction,
  isLogging,
}: {
  rel: Relationship;
  onLogInteraction: (summary: string) => void;
  isLogging: boolean;
}) {
  const [note, setNote] = useState("");
  const infoRows = [
    { label: "Email", value: rel.email || "—", testId: "detail-email" },
    { label: "Phone", value: rel.phone || "—", testId: "detail-phone" },
    { label: "Category", value: rel.category, testId: "detail-category" },
    {
      label: "Last interaction",
      value: rel.last_interaction ? new Date(rel.last_interaction).toLocaleDateString() : "—",
      testId: "detail-last-interaction",
    },
  ];

  return (
    <div className="space-y-4">
      <section className="glass rounded-xl p-5">
        <SectionHeading eyebrow="Conversation" title="What we discussed" />
        <p className="dense whitespace-pre-line text-sm text-muted-foreground" data-testid="detail-notes">
          {rel.notes || "No conversation notes yet — add what they need while it's fresh."}
        </p>
        {rel.interest && (
          <p className="dense mt-3 text-sm">
            <span className="label-caps mr-2">Shared purpose</span>
            {rel.interest}
          </p>
        )}
      </section>

      <section className="glass rounded-xl p-5">
        <SectionHeading eyebrow="Contact information" title="How to reach them" />
        <dl className="dense grid gap-2 text-sm sm:grid-cols-2">
          {infoRows.map((row) => (
            <div key={row.label}>
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd data-testid={row.testId}>{row.value}</dd>
            </div>
          ))}
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
            onClick={() => {
              onLogInteraction(note);
              setNote("");
            }}
            disabled={note.trim().length === 0 || isLogging}
            data-testid="detail-note-submit"
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" aria-hidden />
            Log
          </Button>
        </div>
      </section>
    </div>
  );
}

export function FollowUpsPanel({
  followups,
  onAdd,
  onComplete,
  isAdding,
}: {
  followups: FollowUp[];
  onAdd: (followup: NewFollowUp) => void;
  onComplete: (id: string) => void;
  isAdding: boolean;
}) {
  const [draft, setDraft] = useState<NewFollowUp>({
    title: "",
    kind: "Task",
    due_date: new Date().toISOString().slice(0, 10),
  });

  return (
    <div className="space-y-4">
      <section className="glass rounded-xl p-5">
        <SectionHeading eyebrow="Follow up" title="Schedule the next action" />
        <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="fu-title">Action</Label>
            <Input
              id="fu-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Send partnership proposal"
              data-testid="detail-followup-title"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fu-kind">Type</Label>
            <Select value={draft.kind} onValueChange={(value: string) => setDraft({ ...draft, kind: value })}>
              <SelectTrigger id="fu-kind" data-testid="detail-followup-kind">
                <SelectValue>{(v) => (v as string) || "Task"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FOLLOWUP_KINDS.map((k) => (
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
              value={draft.due_date}
              onChange={(e) => setDraft({ ...draft, due_date: e.target.value })}
              data-testid="detail-followup-due"
            />
          </div>
          <Button
            onClick={() => {
              onAdd(draft);
              setDraft({ ...draft, title: "" });
            }}
            disabled={draft.title.trim().length === 0 || isAdding}
            data-testid="detail-followup-submit"
          >
            <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
            Add
          </Button>
        </div>
      </section>

      <ul className="space-y-2.5" data-testid="detail-followups-list">
        {followups.length === 0 && (
          <li className="dense glass-soft rounded-xl p-4 text-sm text-muted-foreground">
            You're all caught up on this relationship.
          </li>
        )}
        {followups.map((f) => (
          <li key={f.id} className="glass flex items-center gap-3 rounded-xl p-4" data-testid={`detail-followup-${f.id}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{f.title}</p>
              <p className="dense text-xs text-muted-foreground">
                {f.kind} · due {f.due_date}
              </p>
            </div>
            <StatusBadge status={f.overdue ? "Overdue" : f.status} />
            {f.status !== "Completed" && (
              <Button size="sm" variant="outline" onClick={() => onComplete(f.id)} data-testid={`detail-followup-complete-${f.id}`}>
                Complete
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HistoryPanel({
  interactions,
  isLoading,
}: {
  interactions: Interaction[];
  isLoading: boolean;
}) {
  return (
    <section className="glass rounded-xl p-5">
      <SectionHeading eyebrow="Interaction history" title="Everything that happened" />
      {isLoading && <LoadingState testId="detail-interactions-loading" />}
      <ol className="relative space-y-4 border-l border-border pl-5" data-testid="detail-interactions-list">
        {interactions.map((i) => (
          <li key={i.id} className="relative" data-testid={`detail-interaction-${i.id}`}>
            <span className="animate-pulse-node absolute -left-[1.55rem] top-1.5 h-2.5 w-2.5 rounded-full bg-sky" aria-hidden />
            <p className="text-sm font-medium">{i.kind}</p>
            <p className="dense text-sm text-muted-foreground">{i.summary}</p>
            <p className="dense text-xs text-muted-foreground/70">{new Date(i.created_at).toLocaleString()}</p>
          </li>
        ))}
        {!isLoading && interactions.length === 0 && (
          <li className="dense text-sm text-muted-foreground">No interactions logged yet.</li>
        )}
      </ol>
    </section>
  );
}

export function EditPanel({
  form,
  onChange,
  onSave,
  isSaving,
}: {
  form: RelationshipInput;
  onChange: (form: RelationshipInput) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const set = <K extends keyof RelationshipInput>(key: K, value: RelationshipInput[K]) =>
    onChange({ ...form, [key]: value });

  return (
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
      <Button onClick={onSave} disabled={isSaving} data-testid="edit-save">
        <Save className="mr-2 h-4 w-4" aria-hidden />
        {isSaving ? "Saving…" : "Save changes"}
      </Button>
    </section>
  );
}

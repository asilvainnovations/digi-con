import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  EmptyState,
  ErrorState,
  HealthBar,
  LoadingState,
  SectionHeading,
  StatusBadge,
} from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import { RELATIONSHIP_STATUSES, type Relationship, type RelationshipInput } from "@/types";

const EMPTY_CONTACT: RelationshipInput = {
  name: "",
  company: "",
  position: "",
  email: "",
  phone: "",
  website: "",
  avatar_url: "",
  met_at: "",
  event: "",
  date_met: new Date().toISOString().slice(0, 10),
  category: "Contact",
  tags: [],
  interest: "",
  status: "New",
  notes: "",
  opportunity_value: 0,
  health: 70,
};

export function AddContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<RelationshipInput>(EMPTY_CONTACT);
  const [tagsText, setTagsText] = useState("");

  const set = <K extends keyof RelationshipInput>(key: K, value: RelationshipInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const create = useMutation({
    mutationFn: () =>
      apiPost<Relationship>("/relationships", {
        ...form,
        event: form.event || form.met_at,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relationships"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Connection captured");
      setForm(EMPTY_CONTACT);
      setTagsText("");
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't save this connection."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Capture a connection</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (form.name.trim().length < 1) {
              toast.error("A name is required.");
              return;
            }
            create.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="rl-name">Name</Label>
            <Input id="rl-name" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="contact-form-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rl-position">Position</Label>
              <Input id="rl-position" value={form.position} onChange={(e) => set("position", e.target.value)} data-testid="contact-form-position" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rl-company">Company</Label>
              <Input id="rl-company" value={form.company} onChange={(e) => set("company", e.target.value)} data-testid="contact-form-company" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rl-email">Email</Label>
              <Input id="rl-email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="contact-form-email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rl-phone">Phone</Label>
              <Input id="rl-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="contact-form-phone" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rl-met">Where you met / event</Label>
            <Input
              id="rl-met"
              value={form.met_at}
              onChange={(e) => set("met_at", e.target.value)}
              placeholder="Startup Expo 2026, Manila"
              data-testid="contact-form-met-at"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rl-status">Relationship status</Label>
              <Select value={form.status} onValueChange={(value: string) => set("status", value)}>
                <SelectTrigger id="rl-status" data-testid="contact-form-status">
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
              <Label htmlFor="rl-value">Opportunity value (USD)</Label>
              <Input
                id="rl-value"
                type="number"
                min={0}
                value={form.opportunity_value}
                onChange={(e) => set("opportunity_value", Number(e.target.value) || 0)}
                data-testid="contact-form-value"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rl-interest">Interest / shared purpose</Label>
            <Input
              id="rl-interest"
              value={form.interest}
              onChange={(e) => set("interest", e.target.value)}
              placeholder="Partnership"
              data-testid="contact-form-interest"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rl-tags">Tags (comma separated)</Label>
            <Input id="rl-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} data-testid="contact-form-tags" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rl-notes">Conversation notes</Label>
            <Textarea
              id="rl-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="What you discussed and what they need."
              data-testid="contact-form-notes"
            />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending} data-testid="contact-form-submit">
            {create.isPending ? "Saving…" : "Save connection"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Contacts() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(params.get("new") === "1");

  // Debounce the search box: only `search` drives it; the timer is cleaned up on each change.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open && params.get("new") === "1") {
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [open, params, setParams]);

  const list = useQuery({
    queryKey: ["relationships", debounced, status === "all" ? "" : status, ""],
    queryFn: () =>
      apiGet<Relationship[]>(
        `/relationships?q=${encodeURIComponent(debounced)}&status=${encodeURIComponent(status === "all" ? "" : status)}`,
      ),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <SectionHeading
        eyebrow="Capture · Organize"
        title="Your network"
        action={
          <Button size="sm" onClick={() => setOpen(true)} data-testid="contacts-add-button">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add contact
          </Button>
        }
        testId="contacts-heading"
      />

      <div className="glass flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="contact-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="contact-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, company or event"
              className="pl-9"
              data-testid="contacts-search-input"
            />
          </div>
        </div>
        <div className="w-full space-y-1.5 sm:w-52">
          <Label htmlFor="contact-status">Relationship status</Label>
          <Select value={status} onValueChange={(value: string) => setStatus(value)}>
            <SelectTrigger id="contact-status" data-testid="contacts-status-filter">
              <SelectValue>{(v) => ((v as string) === "all" ? "All statuses" : (v as string))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {RELATIONSHIP_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {list.isLoading && <LoadingState testId="contacts-loading" />}
      {list.isError && <ErrorState testId="contacts-error" />}
      {list.data?.length === 0 && (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={debounced || status !== "all" ? "No matches" : "You haven't added anyone yet."}
          body={
            debounced || status !== "all"
              ? "Try a different search or clear the filters."
              : "A connection is not just a contact. Capture the people you meet and what you discussed."
          }
          action={
            <Button size="sm" onClick={() => setOpen(true)} data-testid="contacts-empty-cta">
              Add Your First Connection
            </Button>
          }
          testId="contacts-empty"
        />
      )}

      <ul className="grid gap-3 md:grid-cols-2" data-testid="contacts-list">
        {list.data?.map((r) => (
          <li key={r.id}>
            <Link
              to={`/contacts/${r.id}`}
              className="glass block rounded-xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
              data-testid={`contact-card-${r.id}`}
            >
              <div className="flex items-start gap-3">
                <Avatar name={r.name} url={r.avatar_url || undefined} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold" data-testid={`contact-name-${r.id}`}>
                        {r.name}
                      </p>
                      <p className="dense truncate text-xs text-muted-foreground">
                        {r.position}
                        {r.company ? ` @ ${r.company}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={r.status} testId={`contact-status-${r.id}`} />
                  </div>
                  <p className="dense mt-2 truncate text-xs text-muted-foreground">
                    Met: {r.event || r.met_at || "—"}
                  </p>
                  {r.next_action && (
                    <p className="dense mt-1 truncate text-xs text-sky" data-testid={`contact-next-action-${r.id}`}>
                      Next: {r.next_action} · due {r.next_action_due}
                    </p>
                  )}
                  {r.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.tags.slice(0, 3).map((t) => (
                        <span key={t} className="dense rounded-full bg-secondary/70 px-2 py-0.5 text-[0.68rem] text-secondary-foreground">
                          <Filter className="mr-1 inline h-2.5 w-2.5" aria-hidden />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <HealthBar value={r.health} testId={`contact-health-${r.id}`} />
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <AddContactDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

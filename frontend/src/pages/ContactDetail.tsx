import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/kit";
import {
  ContextPanel,
  DetailHeader,
  EditPanel,
  FollowUpsPanel,
  HistoryPanel,
} from "@/components/contacts/ContactDetailPanels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toEditableForm, useContactDetail } from "@/hooks/useContactDetail";
import type { RelationshipInput } from "@/types";

const TABS = [
  { value: "context", label: "Context" },
  { value: "followups", label: "Follow-ups" },
  { value: "history", label: "Interactions" },
  { value: "edit", label: "Edit" },
];

export default function ContactDetail() {
  const { relId = "" } = useParams<{ relId: string }>();
  const {
    relationship,
    interactions,
    relationshipFollowups,
    save,
    addInteraction,
    addFollowUp,
    completeFollowUp,
    remove,
  } = useContactDetail(relId);
  const [form, setForm] = useState<RelationshipInput | null>(null);

  const rel = relationship.data;
  useEffect(() => {
    if (rel && !form) setForm(toEditableForm(rel));
  }, [rel, form]);

  if (relationship.isLoading) return <LoadingState testId="detail-loading" />;
  if (relationship.isError || !rel) {
    return <ErrorState label="We couldn't find that relationship." testId="detail-error" />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        to="/contacts"
        className="dense inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        data-testid="detail-back"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to network
      </Link>

      <DetailHeader rel={rel} onDelete={() => remove.mutate()} />

      <Tabs defaultValue="context">
        <TabsList variant="line">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} data-testid={`detail-tab-${tab.value}`}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="context" className="pt-4">
          <ContextPanel
            rel={rel}
            onLogInteraction={(summary) => addInteraction.mutate(summary)}
            isLogging={addInteraction.isPending}
          />
        </TabsContent>

        <TabsContent value="followups" className="pt-4">
          <FollowUpsPanel
            followups={relationshipFollowups}
            onAdd={(followup) => addFollowUp.mutate(followup)}
            onComplete={(id) => completeFollowUp.mutate(id)}
            isAdding={addFollowUp.isPending}
          />
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <HistoryPanel interactions={interactions.data ?? []} isLoading={interactions.isLoading} />
        </TabsContent>

        <TabsContent value="edit" className="pt-4">
          {form && (
            <EditPanel
              form={form}
              onChange={setForm}
              onSave={() => save.mutate(form)}
              isSaving={save.isPending}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

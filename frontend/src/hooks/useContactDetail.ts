import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { FollowUp, Interaction, Relationship, RelationshipInput } from "@/types";

export type NewFollowUp = { title: string; kind: string; due_date: string };

/** All data access + mutations for one relationship, so the page stays presentational. */
export function useContactDetail(relId: string) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const relationship = useQuery({
    queryKey: ["relationship", relId],
    queryFn: () => apiGet<Relationship>(`/relationships/${relId}`),
    retry: false,
  });
  const interactions = useQuery({
    queryKey: ["interactions", relId],
    queryFn: () => apiGet<Interaction[]>(`/relationships/${relId}/interactions`),
  });
  const followups = useQuery({
    queryKey: ["followups", ""],
    queryFn: () => apiGet<FollowUp[]>("/followups"),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["relationship", relId] });
    qc.invalidateQueries({ queryKey: ["relationships"] });
    qc.invalidateQueries({ queryKey: ["interactions", relId] });
    qc.invalidateQueries({ queryKey: ["followups"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const save = useMutation({
    mutationFn: (form: RelationshipInput) => apiPut<Relationship>(`/relationships/${relId}`, form),
    onSuccess: () => {
      invalidate();
      toast.success("Relationship updated");
    },
    onError: () => toast.error("Couldn't save your changes."),
  });

  const addInteraction = useMutation({
    mutationFn: (summary: string) =>
      apiPost<Interaction>(`/relationships/${relId}/interactions`, { kind: "Note", summary }),
    onSuccess: () => {
      invalidate();
      toast.success("Interaction logged");
    },
    onError: () => toast.error("Couldn't log that interaction."),
  });

  const addFollowUp = useMutation({
    mutationFn: (followup: NewFollowUp) =>
      apiPost<FollowUp>("/followups", {
        relationship_id: relId,
        title: followup.title,
        kind: followup.kind,
        due_date: followup.due_date,
        notes: "",
        status: "Pending",
      }),
    onSuccess: () => {
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
    onError: () => toast.error("Couldn't update that follow-up."),
  });

  const remove = useMutation({
    mutationFn: () => apiDelete(`/relationships/${relId}`),
    onSuccess: () => {
      invalidate();
      toast.success("Relationship removed");
      navigate("/contacts");
    },
    onError: () => toast.error("Couldn't remove that relationship."),
  });

  return {
    relationship,
    interactions,
    relationshipFollowups: (followups.data ?? []).filter((f) => f.relationship_id === relId),
    save,
    addInteraction,
    addFollowUp,
    completeFollowUp,
    remove,
  };
}

/** Strip server-owned fields so the editable form matches RelationshipInput exactly. */
export function toEditableForm(rel: Relationship): RelationshipInput {
  const {
    id: _id,
    source: _source,
    last_interaction: _last,
    next_action: _next,
    next_action_due: _due,
    ...editable
  } = rel;
  return editable;
}

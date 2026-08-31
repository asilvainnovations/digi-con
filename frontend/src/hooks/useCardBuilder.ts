import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, apiGet, apiPost, apiPut } from "@/lib/api";
import { useAuth } from "@/lib/session";
import type { CardInput, DigitalCard } from "@/types";

export const EMPTY_CARD: CardInput = {
  label: "Primary",
  template: "founder",
  orientation: "portrait",
  accent: "#22d3ee",
  name: "",
  title: "",
  company: "",
  bio: "",
  phone: "",
  email: "",
  website: "",
  location: "",
  avatar_url: "",
  logo_url: "",
  services: [],
  socials: [],
  booking_url: "",
  published: true,
};

function parseServices(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSocials(text: string): CardInput["socials"] {
  return text
    .split("\n")
    .map((line) => line.split("|"))
    .filter((parts) => parts.length === 2 && parts[0].trim() && parts[1].trim())
    .map(([label, url]) => ({ label: label.trim(), url: url.trim() }));
}

/** Form state, hydration from the server, and the save mutation for the card builder. */
export function useCardBuilder() {
  const { cardId } = useParams<{ cardId: string }>();
  const isNew = !cardId || cardId === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [form, setForm] = useState<CardInput>(EMPTY_CARD);
  const [servicesText, setServicesText] = useState("");
  const [socialsText, setSocialsText] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards") });
  const existing = cards.data?.find((c) => c.id === cardId);

  useEffect(() => {
    if (hydrated) return;
    if (!isNew && existing) {
      setForm({ ...existing });
      setServicesText(existing.services.join(", "));
      setSocialsText(existing.socials.map((s) => `${s.label}|${s.url}`).join("\n"));
      setHydrated(true);
    } else if (isNew && user) {
      setForm((f) => ({
        ...f,
        name: user.name,
        title: user.title,
        company: user.company,
        phone: user.phone,
        email: user.email,
      }));
      setHydrated(true);
    }
  }, [existing, isNew, user, hydrated]);

  const payload: CardInput = {
    ...form,
    services: parseServices(servicesText),
    socials: parseSocials(socialsText),
  };

  const save = useMutation({
    mutationFn: () =>
      isNew ? apiPost<DigitalCard>("/cards", payload) : apiPut<DigitalCard>(`/cards/${cardId}`, payload),
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      toast.success(isNew ? "Card published" : "Card updated");
      navigate(`/share?card=${card.id}`);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 402) {
        toast.error("Free plan includes 1 card — upgrade to add more.");
        navigate("/pricing");
        return;
      }
      toast.error("Couldn't save the card. Check the required fields.");
    },
  });

  const setField = <K extends keyof CardInput>(key: K, value: CardInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return {
    isNew,
    form,
    setField,
    payload,
    servicesText,
    setServicesText,
    socialsText,
    setSocialsText,
    cards,
    existing,
    save,
    navigate,
  };
}

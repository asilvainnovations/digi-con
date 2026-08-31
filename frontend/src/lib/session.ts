import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { User } from "@/types";

export const meKey = ["auth", "me"] as const;

export function useAuth() {
  const query = useQuery<User | null>({
    queryKey: meKey,
    queryFn: async () => {
      try {
        return await apiGet<User>("/auth/me");
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 30_000,
  });
  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isPaid: (query.data?.plan ?? "free") !== "free",
    isAdmin: query.data?.role === "super_admin",
  };
}

/** Call after a successful login/signup so cached data belongs to the new session. */
export function useSession() {
  const qc = useQueryClient();
  return {
    beginSession: async (user: User) => {
      qc.clear();
      qc.setQueryData(meKey, user);
    },
    endSession: async () => {
      await apiPost("/auth/logout");
      qc.clear();
      qc.setQueryData(meKey, null);
    },
  };
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUiStore } from "@/store/ui";
import type { ProfileResponse } from "@shared/types";

export function useProfile() {
  const locale = useUiStore((s) => s.locale);
  return useQuery({
    queryKey: ["profile", locale],
    queryFn: () =>
      api<{ data: ProfileResponse }>(`/profile?lang=${locale}`).then((r) => r.data),
  });
}
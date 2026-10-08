import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUiStore } from "@/store/ui";
import type { ProjectDto } from "@shared/types";

export interface ProjectFilters {
  q: string;
  skill: string;
  sort: "newest" | "title";
}

export function useProjects(filters: ProjectFilters) {
  const locale = useUiStore((s) => s.locale);
  return useQuery({
    queryKey: ["projects", filters, locale],
    queryFn: () => {
      const params = new URLSearchParams({ sort: filters.sort, lang: locale });
      if (filters.q) params.set("q", filters.q);
      if (filters.skill) params.set("skill", filters.skill);
      return api<{ data: ProjectDto[] }>(`/projects?${params}`).then((r) => r.data);
    },
    placeholderData: keepPreviousData,
  });
}

export function useProject(slug: string) {
  const locale = useUiStore((s) => s.locale);
  return useQuery({
    queryKey: ["project", slug, locale],
    queryFn: () =>
      api<{ data: ProjectDto }>(`/projects/${slug}?lang=${locale}`).then((r) => r.data),
    enabled: Boolean(slug),
  });
}
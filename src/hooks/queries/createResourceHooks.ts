/**
 * Generic React Query hooks for any ResourceApi.
 *
 * Usage:
 *   const studentHooks = createResourceHooks(studentsApi, "students");
 *   const { data } = studentHooks.useList({ q: "..." });
 *   const create = studentHooks.useCreate();
 *   create.mutate({ ...newStudent });
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { ListParams, ListResult } from "@/services/api";
import type { ResourceApi, WithId } from "@/services/api/resource";

export function createResourceHooks<T extends WithId, CreateInput = Omit<T, "id">>(
  api: ResourceApi<T, CreateInput>,
  key: string,
) {
  const listKey = (params?: ListParams) => [key, "list", params ?? {}] as const;
  const itemKey = (id: string) => [key, "item", id] as const;

  function useList(
    params?: ListParams,
    options?: Omit<UseQueryOptions<ListResult<T>>, "queryKey" | "queryFn">,
  ) {
    return useQuery({
      queryKey: listKey(params),
      queryFn: () => api.list(params),
      ...options,
    });
  }

  function useItem(id: string | undefined) {
    return useQuery({
      queryKey: itemKey(id ?? ""),
      queryFn: () => api.get(id as string),
      enabled: !!id,
    });
  }

  function useCreate(opts?: { successMessage?: string }) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (input: CreateInput) => api.create(input),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [key] });
        toast.success(opts?.successMessage ?? "Created successfully");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
    });
  }

  function useUpdate(opts?: { successMessage?: string }) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Partial<T> }) =>
        api.update(id, patch),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [key] });
        toast.success(opts?.successMessage ?? "Updated successfully");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
    });
  }

  function useRemove(opts?: { successMessage?: string }) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [key] });
        toast.success(opts?.successMessage ?? "Deleted");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  }

  function useRemoveMany(opts?: { successMessage?: string }) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (ids: string[]) => api.removeMany(ids),
      onSuccess: (_, ids) => {
        qc.invalidateQueries({ queryKey: [key] });
        toast.success(opts?.successMessage ?? `${ids.length} item(s) deleted`);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  }

  return { useList, useItem, useCreate, useUpdate, useRemove, useRemoveMany, listKey, itemKey };
}

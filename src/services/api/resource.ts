/**
 * Generic CRUD resource factory.
 *
 * Each resource file (students.ts, lecturers.ts, ...) calls `defineResource`
 * with its endpoint path + a seed function. The returned object has the same
 * shape regardless of whether USE_MOCK is on or off, so UI code never
 * branches on "mock vs real".
 *
 * Replace-with-real-API: when USE_MOCK is false, calls fall through to
 * `httpClient` against the declared `endpoint`. No other changes needed.
 */
import { httpClient, USE_MOCK, type ListParams, type ListResult } from "./client";
import { MockDB, makeId } from "../mock/db";
import { delay } from "../mock/delay";

export type WithId = { id: string };

export interface ResourceApi<T extends WithId, CreateInput = Omit<T, "id">> {
  endpoint: string;
  list(params?: ListParams): Promise<ListResult<T>>;
  get(id: string): Promise<T>;
  create(input: CreateInput): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
  removeMany(ids: string[]): Promise<void>;
  /** Direct read of all rows — handy for cross-resource joins in mock mode. */
  readAll(): T[];
}

interface DefineResourceOptions<T extends WithId> {
  /** REST endpoint path used when USE_MOCK is false, e.g. "/api/students". */
  endpoint: string;
  /** localStorage table name. Conventionally matches endpoint w/o slashes. */
  table: string;
  /** Seed rows used on first run (no localStorage entry yet). */
  seed: () => T[];
  /** Optional searchable field list for the default `q` filter. */
  searchFields?: (keyof T)[];
}

function defaultSearch<T>(row: T, q: string, fields: (keyof T)[]): boolean {
  const needle = q.toLowerCase();
  return fields.some((f) => {
    const v = row[f];
    return typeof v === "string" && v.toLowerCase().includes(needle);
  });
}

function applyFilters<T>(row: T, filters?: Record<string, unknown>): boolean {
  if (!filters) return true;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === "" || v === "All") continue;
    if ((row as Record<string, unknown>)[k] !== v) return false;
  }
  return true;
}

export function defineResource<T extends WithId, CreateInput = Omit<T, "id">>(
  opts: DefineResourceOptions<T>,
): ResourceApi<T, CreateInput> {
  const { endpoint, table, seed, searchFields = [] } = opts;
  // Eager seed so public pages have data even before any admin view loaded.
  MockDB.ensure<T>(table, seed);

  return {
    endpoint,

    readAll: () => MockDB.list<T>(table),

    async list(params: ListParams = {}) {
      if (!USE_MOCK) return httpClient.get<ListResult<T>>(endpoint, params);
      await delay();
      let rows = MockDB.list<T>(table).slice();
      if (params.q && searchFields.length) {
        rows = rows.filter((r) => defaultSearch(r, params.q!, searchFields));
      }
      rows = rows.filter((r) => applyFilters(r, params.filters));
      if (params.sortBy) {
        const dir = params.sortDir === "desc" ? -1 : 1;
        rows.sort((a, b) => {
          const av = (a as Record<string, unknown>)[params.sortBy!];
          const bv = (b as Record<string, unknown>)[params.sortBy!];
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
          return 0;
        });
      }
      const total = rows.length;
      if (params.page && params.pageSize) {
        const start = (params.page - 1) * params.pageSize;
        rows = rows.slice(start, start + params.pageSize);
      }
      return { data: rows, total };
    },

    async get(id) {
      if (!USE_MOCK) return httpClient.get<T>(`${endpoint}/${id}`);
      await delay();
      const row = MockDB.list<T>(table).find((r) => r.id === id);
      if (!row) throw new Error(`${table} ${id} not found`);
      return row;
    },

    async create(input) {
      if (!USE_MOCK) return httpClient.post<T>(endpoint, input);
      await delay();
      const row = { ...(input as object), id: makeId(table) } as T;
      const rows = MockDB.list<T>(table);
      rows.unshift(row);
      MockDB.save(table, rows);
      return row;
    },

    async update(id, patch) {
      if (!USE_MOCK) return httpClient.patch<T>(`${endpoint}/${id}`, patch);
      await delay();
      const rows = MockDB.list<T>(table);
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`${table} ${id} not found`);
      rows[idx] = { ...rows[idx], ...patch, id };
      MockDB.save(table, rows);
      return rows[idx];
    },

    async remove(id) {
      if (!USE_MOCK) {
        await httpClient.delete<void>(`${endpoint}/${id}`);
        return;
      }
      await delay();
      const rows = MockDB.list<T>(table).filter((r) => r.id !== id);
      MockDB.save(table, rows);
    },

    async removeMany(ids) {
      if (!USE_MOCK) {
        await Promise.all(ids.map((id) => httpClient.delete<void>(`${endpoint}/${id}`)));
        return;
      }
      await delay();
      const set = new Set(ids);
      const rows = MockDB.list<T>(table).filter((r) => !set.has(r.id));
      MockDB.save(table, rows);
    },
  };
}

/**
 * Tiny localStorage-backed "database". Each table is keyed under
 * `aic.<table>.v1` so admins can wipe demo data via DevTools or
 * `MockDB.reset()`.
 */
const PREFIX = "aic";
const VERSION = "v1";

const isBrowser = typeof window !== "undefined" && !!window.localStorage;
const memory: Record<string, unknown[]> = {};

function key(table: string) {
  return `${PREFIX}.${table}.${VERSION}`;
}

function read<T>(table: string): T[] | null {
  if (!isBrowser) return (memory[table] as T[]) ?? null;
  try {
    const raw = window.localStorage.getItem(key(table));
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

function write<T>(table: string, rows: T[]): void {
  if (!isBrowser) {
    memory[table] = rows as unknown[];
    return;
  }
  try {
    window.localStorage.setItem(key(table), JSON.stringify(rows));
  } catch {
    // Quota or serialization error — fall back to memory only.
    memory[table] = rows as unknown[];
  }
}

export const MockDB = {
  /** Read all rows; if absent, initialize from `seed`. */
  ensure<T>(table: string, seed: () => T[]): T[] {
    const existing = read<T>(table);
    if (existing) return existing;
    const seeded = seed();
    write(table, seeded);
    return seeded;
  },
  list<T>(table: string): T[] {
    return read<T>(table) ?? [];
  },
  save<T>(table: string, rows: T[]): void {
    write(table, rows);
  },
  reset(table?: string): void {
    if (!isBrowser) {
      if (table) delete memory[table];
      else for (const k of Object.keys(memory)) delete memory[k];
      return;
    }
    if (table) {
      window.localStorage.removeItem(key(table));
      return;
    }
    for (const k of Object.keys(window.localStorage)) {
      if (k.startsWith(`${PREFIX}.`)) window.localStorage.removeItem(k);
    }
  },
};

/** Stable-ish id generator. */
export function makeId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

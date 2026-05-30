# Service Layer (Mock → Real API)

UI never talks to `fetch` directly. Every admin and public page goes through
a resource API defined in `src/services/api/*` whose interface is:

```ts
list(params?): Promise<{ data: T[]; total: number }>
get(id):       Promise<T>
create(input): Promise<T>
update(id, patch): Promise<T>
remove(id):    Promise<void>
removeMany(ids): Promise<void>
```

## How mock mode works

- `client.ts` exports `USE_MOCK = true`.
- `resource.ts` is a generic factory: when `USE_MOCK` is on, it reads/writes
  to `localStorage` (via `src/services/mock/db.ts`). Data persists across
  reloads and seeds on first run.
- Each resource file (`students.ts`, `news.ts`, ...) declares its REST
  `endpoint` path plus a `seed()` for demo rows.

## Switching to a real backend

1. Set `USE_MOCK = false` in `src/services/api/client.ts`.
2. Optional: set `VITE_API_BASE_URL` if the API is on a different origin.
3. Make sure your backend implements these endpoints:

   | Resource    | Endpoint               |
   |-------------|------------------------|
   | Students    | `/api/students`        |
   | Lecturers   | `/api/lecturers`       |
   | Programs    | `/api/programs`        |
   | News        | `/api/news`            |
   | Scholarships| `/api/scholarships`    |
   | Applications| `/api/applications`    |
   | Enrollments | `/api/enrollments`     |
   | Attendance  | `/api/attendance`      |
   | Grades      | `/api/grades`          |
   | Invoices    | `/api/invoices`        |
   | Timetable   | `/api/timetable`       |
   | Messages    | `/api/messages`        |

   Each endpoint expects:

   - `GET    /api/<resource>?q=&page=&pageSize=&sortBy=&sortDir=` → `{ data, total }`
   - `GET    /api/<resource>/:id` → entity
   - `POST   /api/<resource>` (JSON body) → created entity
   - `PATCH  /api/<resource>/:id` (JSON patch) → updated entity
   - `DELETE /api/<resource>/:id` → 204

4. That's it. No changes required in components, hooks, or pages.

## Adding a new resource

1. Create `src/services/api/<name>.ts` and call `defineResource<MyType>({...})`.
2. Re-export it from `src/services/api/index.ts`.
3. Create matching hooks with `createResourceHooks` in `src/hooks/queries/`.

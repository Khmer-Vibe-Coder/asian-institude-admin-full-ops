# Plan: API-ready mock data layer + complete admin CRUD

Goal: every admin module (Students, Lecturers, Programs, News, Scholarships, Enrollment, Attendance, Grades, Finance, Timetable, Applications) gets working View / Add / Edit / Delete / Search / Filter / Export — all backed by a single mock service layer shaped exactly like a real REST API so swapping to `fetch` later is a one-file change.

---

## 1. Mock API layer (the contract)

Create `src/services/api/` with one file per resource. Every file exports the same async functions so a real backend can replace it without touching UI code.

```text
src/services/
  api/
    client.ts          // central fetch wrapper + MOCK toggle
    students.ts
    lecturers.ts
    programs.ts
    news.ts
    scholarships.ts
    applications.ts
    enrollments.ts
    attendance.ts
    grades.ts
    finance.ts
    timetable.ts
  mock/
    db.ts              // localStorage-backed "tables"
    seed.ts            // initial demo rows
    delay.ts           // simulate latency
```

Every resource module exports the same shape:

```ts
list(params?):   Promise<{ data: T[]; total: number }>
get(id):         Promise<T>
create(input):   Promise<T>
update(id, p):   Promise<T>
remove(id):      Promise<void>
```

`client.ts` has `const USE_MOCK = true`. When the user is ready for real API, they flip it to `false` and each resource file's `if (USE_MOCK) return mock...()` short-circuit is removed — endpoint URLs are already declared at the top of each file (`/api/students`, etc.) as documentation.

`mock/db.ts` persists to `localStorage` under `aic.<resource>.v1` so data survives reloads. `seed.ts` populates first-run demo rows that match what's currently hardcoded in the pages.

---

## 2. React Query integration

Add `@tanstack/react-query` hooks per resource in `src/hooks/queries/`:

- `useStudents(params)`, `useStudent(id)`, `useCreateStudent()`, `useUpdateStudent()`, `useDeleteStudent()` — and the same set for every resource.

All admin pages consume these hooks. Mutations invalidate the matching list query and show a sonner toast. This is the exact pattern the user keeps when switching to a real API.

---

## 3. Shared admin UI primitives

Create once, reuse everywhere:

- `src/components/admin/DataTable.tsx` — columns config, search, pagination, row actions (View / Edit / Delete), bulk select, CSV export.
- `src/components/admin/ResourceDialog.tsx` — wraps shadcn `Dialog` for Add / Edit using `react-hook-form` + `zod`.
- `src/components/admin/ConfirmDialog.tsx` — `AlertDialog` for deletes.
- `src/components/admin/DetailDrawer.tsx` — read-only "View" panel.

Each admin page becomes thin: schema + columns + form fields. Adding a new field later is one line in two places.

---

## 4. Per-module work

For each module: list with search/filter/pagination, View, Add, Edit, Delete, bulk delete, CSV export, toast feedback.

- **Students** — fields: id, name, khmerName, email, phone, program, year, status, enrolledAt.
- **Lecturers** — name, email, department, title, bio, photo, courses[].
- **Programs** — code, name, level, duration, credits, description, fee.
- **News** — title, slug, category, excerpt, body, coverImage, publishedAt, status (draft/published).
- **Scholarships** — name, amount, deadline, eligibility, status; applications sub-list with approve/reject.
- **Applications** (admissions inbox) — applicant, program, submittedAt, status; approve → creates Student; reject → status only.
- **Enrollment** — student × program/term, status, enrolledAt.
- **Attendance** — class × date × student → present/absent/late; bulk "mark all present"; weekly report.
- **Grades** — student × course → score, grade, term; auto GPA.
- **Finance** — invoices (student, amount, dueDate, status), payments (record/refund), receipt PDF stub.
- **Timetable** — slot (day, start, end, course, lecturer, room); week grid view + add/edit.

---

## 5. Public-site touch-ups (use the same hooks)

- `/news` reads from `useNews()` instead of hardcoded array.
- `/programs`, `/lecturers`, `/scholarships` likewise.
- Admissions form `submit` calls `applications.create()`.
- Contact form `submit` calls a `messages.create()` mock.

Result: anything edited in admin shows up on the public site instantly.

---

## 6. Swap-to-real-API procedure (documented in `src/services/api/README.md`)

1. Set `USE_MOCK = false` in `client.ts`.
2. In each resource file, delete the `if (USE_MOCK)` branch; keep the `client.get/post/put/delete(URL, ...)` branch already written.
3. Endpoints, request bodies, and response shapes are already typed — backend just has to match them.

No component, hook, or page changes required.

---

## Out of scope

- Real auth / RBAC (admin pages stay open as today).
- Real file uploads (file inputs store object URLs in mock).
- Server-side pagination math (mock paginates client-side; real API will paginate server-side via the same `params`).
- Visual redesign — only behavior is added.

---

## Order of execution

1. Mock layer + db + seed + client + one resource end-to-end (Students) as the reference.
2. Shared DataTable / ResourceDialog / ConfirmDialog / DetailDrawer.
3. Remaining resources in parallel batches.
4. Public pages switched to hooks.
5. README for the swap procedure.

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { newsHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DetailDrawer, DetailRow } from "@/components/admin/DetailDrawer";
import type { NewsArticle } from "@/services/api";

export const Route = createFileRoute("/admin/news")({ component: NewsAdminPage });

const fields: FormField<NewsArticle>[] = [
  { name: "title", label: "Title", required: true, full: true },
  { name: "slug", label: "Slug", required: true, hint: "URL fragment, e.g. ai-research-center" },
  { name: "category", label: "Category", type: "select", required: true, options: ["Academics","Research","Events","Student Life","Announcement"].map((c) => ({ value: c, label: c })) },
  { name: "author", label: "Author", required: true },
  { name: "publishedAt", label: "Published At", type: "date", required: true },
  { name: "status", label: "Status", type: "select", required: true, options: ["Draft","Published"].map((s) => ({ value: s, label: s })) },
  { name: "coverImage", label: "Cover Image", type: "photo", full: true },
  { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
  { name: "body", label: "Body", type: "textarea", required: true },
];

function NewsAdminPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const list = newsHooks.useList({ q, filters: { status: status === "All" ? undefined : status }, sortBy: "publishedAt", sortDir: "desc" });
  const create = newsHooks.useCreate();
  const update = newsHooks.useUpdate();
  const remove = newsHooks.useRemove();
  const removeMany = newsHooks.useRemoveMany();

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<NewsArticle | null>(null);
  const [viewRow, setViewRow] = useState<NewsArticle | null>(null);
  const [delRow, setDelRow] = useState<NewsArticle | null>(null);

  const columns: Column<NewsArticle>[] = useMemo(() => [
    { key: "title", header: "Article", render: (a) => (
      <div className="flex items-center gap-3">
        {a.coverImage && <img src={a.coverImage} alt="" className="w-14 h-10 rounded object-cover" />}
        <div>
          <div className="font-medium">{a.title}</div>
          <div className="text-xs text-slate-500">/{a.slug}</div>
        </div>
      </div>
    )},
    { key: "category", header: "Category" },
    { key: "author", header: "Author" },
    { key: "publishedAt", header: "Published" },
    { key: "status", header: "Status", render: (a) => (
      <span className={`text-xs px-2.5 py-1 rounded-full ${a.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{a.status}</span>
    )},
  ], []);

  return (
    <>
      <DataTable<NewsArticle>
        title="News & CMS"
        description={`${list.data?.total ?? 0} articles`}
        data={list.data?.data ?? []}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        filterChips={[{ key: "status", options: ["All","Published","Draft"] }]}
        filterValues={{ status }}
        onFilterChange={(_, v) => setStatus(v)}
        onAdd={() => setAddOpen(true)}
        addLabel="New Article"
        exportFilename="aic-news.csv"
        onView={setViewRow}
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />
      <ResourceFormDialog<NewsArticle>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="New Article"
        fields={fields}
        defaultValues={{ status: "Draft", category: "Announcement", author: "AIC Newsroom", publishedAt: new Date().toISOString().slice(0, 10) }}
        submitting={create.isPending}
        onSubmit={async (v) => { await create.mutateAsync(v as Omit<NewsArticle,"id">); }}
      />
      <ResourceFormDialog<NewsArticle>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title={`Edit: ${editRow?.title ?? ""}`}
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => { await update.mutateAsync({ id: editRow!.id, patch: v }); }}
      />
      <DetailDrawer open={!!viewRow} onOpenChange={(v) => !v && setViewRow(null)} title={viewRow?.title ?? ""} description={viewRow?.category}>
        {viewRow && (
          <>
            {viewRow.coverImage && <img src={viewRow.coverImage} alt="" className="w-full h-40 rounded-xl object-cover mb-2" />}
            <DetailRow label="Author">{viewRow.author}</DetailRow>
            <DetailRow label="Published">{viewRow.publishedAt}</DetailRow>
            <DetailRow label="Status">{viewRow.status}</DetailRow>
            <DetailRow label="Excerpt">{viewRow.excerpt}</DetailRow>
            <DetailRow label="Body"><p className="whitespace-pre-wrap">{viewRow.body}</p></DetailRow>
          </>
        )}
      </DetailDrawer>
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title={`Delete "${delRow?.title}"?`} destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </>
  );
}

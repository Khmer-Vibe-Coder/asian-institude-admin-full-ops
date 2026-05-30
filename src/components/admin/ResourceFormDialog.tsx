import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type DefaultValues, type Path } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type FieldType = "text" | "email" | "tel" | "number" | "date" | "textarea" | "select" | "url";

export type FormField<T> = {
  name: keyof T & string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[]; // for select
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  full?: boolean; // takes full row
};

export function ResourceFormDialog<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  defaultValues,
  submitLabel = "Save",
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  fields: FormField<T>[];
  defaultValues: Partial<T>;
  submitLabel?: string;
  onSubmit: (values: T) => void | Promise<void>;
  submitting?: boolean;
}) {
  const form = useForm<T>({ defaultValues: defaultValues as DefaultValues<T> });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      form.reset(defaultValues as DefaultValues<T>);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const grid = useMemo(() => fields, [fields]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              setError(null);
              // Coerce numbers
              for (const f of fields) {
                if (f.type === "number") {
                  const v = (values as Record<string, unknown>)[f.name];
                  if (v !== "" && v !== undefined && v !== null) {
                    (values as Record<string, unknown>)[f.name] = Number(v);
                  }
                }
              }
              await onSubmit(values);
              onOpenChange(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Submit failed");
            }
          })}
        >
          {grid.map((f) => {
            const reg = form.register(f.name as Path<T>, {
              required: f.required ? `${f.label} is required` : false,
              min: f.min,
              max: f.max,
            });
            const err = form.formState.errors[f.name as Path<T>];
            return (
              <div key={f.name} className={f.full || f.type === "textarea" ? "sm:col-span-2" : undefined}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    {...reg}
                    rows={4}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#d9a441] outline-none"
                  />
                ) : f.type === "select" ? (
                  <select
                    {...reg}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#d9a441] outline-none"
                  >
                    <option value="">Select…</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...reg}
                    type={f.type ?? "text"}
                    step={f.step}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#d9a441] outline-none"
                  />
                )}
                {f.hint && <p className="text-[11px] text-slate-400 mt-1">{f.hint}</p>}
                {err && <p className="text-[11px] text-red-500 mt-1">{String(err.message ?? "Invalid")}</p>}
              </div>
            );
          })}
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-[#0f1b3d] hover:bg-[#0f1b3d]/90 text-white">
              {submitting ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Convenience export to render arbitrary form content. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

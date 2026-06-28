import type { ReactNode } from "react";

type AlertVariant = "error" | "warning" | "success" | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export function Alert({ variant = "info", children }: AlertProps) {
  return (
    <section
      className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      {children}
    </section>
  );
}

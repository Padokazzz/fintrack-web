import type { ReactNode } from "react";
import { LanguageSelect } from "../layout/LanguageSelect";
import { ThemeSelect } from "../layout/ThemeSelect";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold text-emerald-700">FinTrack</p>
            <div className="flex items-center gap-2">
              <ThemeSelect />
              <LanguageSelect />
            </div>
          </div>

          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        {children}
      </section>
    </main>
  );
}

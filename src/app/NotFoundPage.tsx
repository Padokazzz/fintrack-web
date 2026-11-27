import { FinTrackLogo } from "../components/ui/FinTrackLogo";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../lib/i18n/useLanguage";

export function NotFoundPage() {
  const { language } = useLanguage();
  const pt = language === "pt-BR";

  return (
    <main className="grid min-h-dvh place-items-center bg-slate-100 px-4 py-10 text-slate-950">
      <section className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:px-10">
          <FinTrackLogo />
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-xs font-medium text-emerald-800">404</span>
        </div>
        <div className="px-6 py-9 sm:px-10 sm:py-12">
          <div aria-hidden="true" className="mb-5 inline-flex">
            <img src="/app-icon-192.png" alt="" width={56} height={56} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{pt ? "Página não encontrada" : "Page not found"}</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            {pt ? "O endereço pode ter mudado. Volte ao início para continuar." : "The address may have changed. Return home to continue."}
          </p>
          <Link to="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
            {pt ? "Voltar ao início" : "Back to home"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

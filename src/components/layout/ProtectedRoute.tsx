import axios from "axios";
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { refreshSession } from "../../lib/api";
import { getToken } from "../../lib/auth-storage";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { isDesktop } from "../../lib/platform/desktop";

export function ProtectedRoute() {
  const { locale, t } = useLanguage();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; failed: boolean } | null>(null);

  useEffect(() => {
    if (isDesktop || getToken()) return;
    let active = true;
    void refreshSession().then(
      () => { if (active) setResult({ attempt, failed: false }); },
      (error: unknown) => {
        const expired = axios.isAxiosError(error) && error.response?.status === 401;
        if (active) setResult({ attempt, failed: !expired });
      },
    );
    return () => { active = false; };
  }, [attempt]);

  if (getToken()) return <Outlet />;
  if (isDesktop) return <Navigate to="/login" replace />;
  if (result?.attempt !== attempt) return <p role="status" className="p-4">{t.common.loading}</p>;
  if (result.failed) {
    const pt = locale.startsWith("pt");
    return (
      <div className="space-y-3 p-4">
        <p role="alert">{pt ? "Não foi possível restaurar a sessão." : "Could not restore your session."}</p>
        <button type="button" onClick={() => setAttempt(attempt + 1)} className="rounded-md border px-3 py-2">
          {pt ? "Tentar novamente" : "Try again"}
        </button>
      </div>
    );
  }
  return <Navigate to="/login" replace />;
}

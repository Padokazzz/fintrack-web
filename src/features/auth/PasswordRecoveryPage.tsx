import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AuthShell } from "../../components/ui/AuthShell";
import { Alert } from "../../components/ui/Alert";
import { authApi, invalidateSession } from "../../lib/api";
import { useLanguage } from "../../lib/i18n/useLanguage";
import type { EmailChallenge } from "./types";

export function PasswordRecoveryPage() {
  const { locale, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pt = locale.startsWith("pt");
  const [challengeId, setChallengeId] = useState<string>();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [resendAt, setResendAt] = useState(0);
  const [mayResend, setMayResend] = useState(false);

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setTimeout(() => setMayResend(true), Math.max(0, resendAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [resendAt]);

  async function requestCode() {
    setError("");
    setPending(true);
    try {
      const { data } = await authApi.post<EmailChallenge>("/auth/forgot-password", { email: email.trim() });
      setChallengeId(data.challengeId);
      setMayResend(false);
      setResendAt(Date.now() + 60_000);
    } catch {
      setError(pt ? "Não foi possível pedir o código. Aguarde e tente novamente." : "Could not request the code. Wait and try again.");
    } finally {
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId) return requestCode();
    const form = new FormData(event.currentTarget);
    setError("");
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");
    if (password !== confirmPassword) {
      setError(t.validation.passwordMismatch);
      return;
    }

    setPending(true);
    try {
      await authApi.post("/auth/reset-password", { challengeId, code: form.get("code"), password, confirmPassword });
      invalidateSession();
      queryClient.clear();
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch {
      setError(pt ? "Não foi possível redefinir a senha. Confira o código ou solicite outro." : "Could not reset your password. Check the code or request another.");
    } finally {
      setPending(false);
    }
  }

  const field = "rounded-lg border border-slate-300 px-3 py-2";
  return (
    <AuthShell title={pt ? "Recuperar senha" : "Recover password"}
      description={challengeId
        ? (pt ? "Se o endereço estiver cadastrado, você receberá um código válido por 10 minutos." : "If this address is registered, you will receive a code valid for 10 minutes.")
        : (pt ? "Informe o e-mail usado no cadastro." : "Enter the email used for your account.")}>
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        {challengeId ? (
          <>
            <label className="grid gap-1 text-sm">
              {pt ? "Código de 6 dígitos" : "Six-digit code"}
              <input key={challengeId} className={field} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
            </label>
            <label className="grid gap-1 text-sm">
              {pt ? "Nova senha" : "New password"}
              <input className={field} name="password" type="password" autoComplete="new-password" minLength={6} maxLength={100} required />
            </label>
            <label className="grid gap-1 text-sm">
              {t.auth.confirmPassword}
              <input className={field} name="confirmPassword" type="password" autoComplete="new-password" minLength={6} maxLength={100} required />
            </label>
          </>
        ) : (
          <label className="grid gap-1 text-sm">
            {t.auth.email}
            <input className={field} value={email} onChange={(event) => setEmail(event.target.value)}
              type="email" autoComplete="email" maxLength={150} required />
          </label>
        )}
        {error && <Alert variant="error">{error}</Alert>}
        <button type="submit" disabled={pending} className="w-full rounded-md bg-emerald-700 px-3 py-2 text-white disabled:opacity-50">
          {challengeId ? (pt ? "Redefinir senha" : "Reset password") : (pt ? "Enviar código" : "Send code")}
        </button>
        {challengeId && <div className="space-y-1">
          <p className="break-all text-sm text-slate-700">{email.trim()}</p>
          <div className="flex flex-wrap gap-4">
            <button type="button" disabled={pending || !mayResend} onClick={() => void requestCode()}
              className="min-h-11 text-sm text-emerald-700 underline disabled:text-slate-500">{pt ? "Reenviar código" : "Resend code"}</button>
            <button type="button" disabled={pending} onClick={() => { setError(""); setChallengeId(undefined); }}
              className="min-h-11 text-sm text-emerald-700 underline">{pt ? "Corrigir e-mail" : "Edit email"}</button>
          </div>
          {!mayResend && <p role="status" className="text-sm text-slate-600">{pt ? "Aguarde um minuto para reenviar." : "Wait one minute before requesting another code."}</p>}
        </div>}
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm text-emerald-700 underline">
        {pt ? "Voltar ao login" : "Back to sign in"}
      </Link>
    </AuthShell>
  );
}

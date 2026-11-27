import { useState, type FormEvent } from "react";
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");
    if (challengeId && password !== confirmPassword) {
      setError(t.validation.passwordMismatch);
      return;
    }

    setPending(true);
    try {
      if (!challengeId) {
        const { data } = await authApi.post<EmailChallenge>("/auth/forgot-password", { email: email.trim() });
        setChallengeId(data.challengeId);
      } else {
        await authApi.post("/auth/reset-password", { challengeId, code: form.get("code"), password, confirmPassword });
        invalidateSession();
        queryClient.clear();
        navigate("/login", { replace: true, state: { passwordReset: true } });
      }
    } catch {
      setError(challengeId
        ? (pt ? "Não foi possível redefinir a senha. Confira o código ou solicite outro." : "Could not reset your password. Check the code or request another.")
        : (pt ? "Não foi possível enviar o pedido. Aguarde e tente novamente." : "Could not submit the request. Wait and try again."));
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
              <input className={field} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
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
        {challengeId && <button type="button" disabled={pending} onClick={() => { setError(""); setChallengeId(undefined); }}
          className="text-sm text-emerald-700 underline">{pt ? "Solicitar outro código" : "Request another code"}</button>}
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm text-emerald-700 underline">
        {pt ? "Voltar ao login" : "Back to sign in"}
      </Link>
    </AuthShell>
  );
}

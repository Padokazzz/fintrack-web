import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { AuthShell } from "../../components/ui/AuthShell";
import { Alert } from "../../components/ui/Alert";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { verifyEmailCode } from "./auth-service";
import type { AuthResponse } from "./types";

type Props = {
  challengeId: string;
  onConfirmed: (auth: AuthResponse) => void;
  onBack: () => void;
};

export function EmailChallengeForm({ challengeId, onConfirmed, onBack }: Props) {
  const pt = useLanguage().locale.startsWith("pt");
  const verification = useMutation({
    mutationFn: (code: string) => verifyEmailCode(challengeId, code),
    onSuccess: onConfirmed,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code");
    if (typeof code === "string") verification.mutate(code);
  }

  return (
    <AuthShell title={pt ? "Confirme seu e-mail" : "Confirm your email"}
      description={pt ? "Digite o código enviado por e-mail. Ele expira em 10 minutos."
        : "Enter the code we sent by email. It expires in 10 minutes."}>
      <form onSubmit={submit} className="space-y-4">
        <label className="grid gap-1 text-sm font-medium">
          {pt ? "Código de 6 dígitos" : "Six-digit code"}
          <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}"
            maxLength={6} required className="rounded-md border border-slate-300 px-3 py-2 tracking-widest" />
        </label>
        {verification.isError && <Alert variant="error">
          {pt ? "O código não foi confirmado. Confira o e-mail. Se expirou ou você atingiu o limite de tentativas, entre novamente para pedir outro."
            : "The code could not be confirmed. Check your email. If it expired or you reached the attempt limit, sign in again for a new code."}
        </Alert>}
        <div className="flex flex-wrap gap-3">
          <button disabled={verification.isPending} type="submit"
            className="rounded-md bg-emerald-700 px-3 py-2 text-white disabled:opacity-50">
            {pt ? "Confirmar código" : "Confirm code"}
          </button>
          <button disabled={verification.isPending} type="button" onClick={onBack}
            className="rounded-md border px-3 py-2">
            {pt ? "Voltar" : "Back"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

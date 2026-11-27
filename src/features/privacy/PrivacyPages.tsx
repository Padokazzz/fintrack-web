import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { api, invalidateSession } from "../../lib/api";
import { useLanguage } from "../../lib/i18n/useLanguage";

const contact = import.meta.env.VITE_PRIVACY_CONTACT?.trim();
const controller = import.meta.env.VITE_PRIVACY_CONTROLLER?.trim();

export function PrivacyNoticePage() {
  const { locale } = useLanguage();
  const pt = locale.startsWith("pt");

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 py-8">
      <Link to="/" className="text-sm font-semibold text-emerald-700">FinTrack</Link>
      <h1 className="text-2xl font-semibold">{pt ? "Privacidade no FinTrack" : "Privacy at FinTrack"}</h1>
      {controller && <p>{pt ? "Controlador dos dados" : "Data controller"} · {controller}</p>}
      <p>{pt
        ? "O FinTrack trata seu nome, e-mail e dados de autenticação para manter seu cadastro e proteger sua sessão. Os dados financeiros que você registra são usados para exibir saldos, relatórios, limites e recorrências."
        : "FinTrack processes your name, email, and authentication data to maintain your account and protect your session. The financial data you enter is used to show balances, reports, limits, and recurring entries."}</p>
      <p>{pt
        ? "O navegador usa um cookie de sessão para manter seu acesso. Os serviços de hospedagem e banco de dados apoiam a operação do aplicativo. O serviço de e-mail recebe o endereço para entregar os códigos de segurança."
        : "Your browser uses a session cookie to keep you signed in. Hosting and database providers support app operation. The email provider receives your address to deliver security codes."}</p>
      <p>{pt
        ? "Em Meus dados, você pode baixar seus registros e excluir seu cadastro. Para pedir correção ou consultar outros detalhes sobre o tratamento dos seus dados, use o canal de privacidade."
        : "In My data, you can download your records and delete your profile. Use the privacy contact to request corrections or ask how your data is processed."}</p>
      {contact && <p><a href={`mailto:${contact}`} className="text-emerald-700 underline">{contact}</a></p>}
      <Link to="/my-data" className="inline-block text-emerald-700 underline">{pt ? "Meus dados" : "My data"}</Link>
    </main>
  );
}

export function MyDataPage() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pt = locale.startsWith("pt");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>, operation: "export" | "delete") {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const password = new FormData(form).get("password");
    form.reset();
    setError("");
    setPending(true);
    try {
      if (operation === "delete") {
        await api.post("/auth/privacy/delete", { password });
        invalidateSession();
        queryClient.clear();
        navigate("/login", { replace: true });
      } else {
        const response = await api.post<Blob>("/auth/privacy/export", { password }, { responseType: "blob" });
        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = "fintrack-meus-dados.json";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (cause) {
      const status = axios.isAxiosError(cause) ? cause.response?.status : undefined;
      if (status === 403) setError(pt ? "A senha atual não confere." : "The current password is incorrect.");
      else if (status === 429) setError(pt ? "Aguarde um minuto e tente novamente." : "Wait one minute and try again.");
      else setError(pt ? "Não foi possível concluir a operação." : "Could not complete this operation.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">{pt ? "Meus dados" : "My data"}</h1>
      <Link to="/privacy" className="text-emerald-700 underline">{pt ? "Aviso de privacidade" : "Privacy notice"}</Link>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      <form onSubmit={(event) => void submit(event, "export")} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">{pt ? "Baixar meus dados" : "Download my data"}</h2>
        <p className="text-sm">{pt ? "Receba uma cópia do cadastro e dos registros financeiros em JSON." : "Get a JSON copy of your profile and financial records."}</p>
        <label className="grid gap-1 text-sm">
          {pt ? "Senha atual" : "Current password"}
          <input name="password" type="password" autoComplete="current-password" required maxLength={1024} disabled={pending} className="rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <button type="submit" disabled={pending} className="rounded-md border px-3 py-2 disabled:opacity-50">
          {pt ? "Confirmar e baixar" : "Confirm and download"}
        </button>
      </form>
      <form onSubmit={(event) => void submit(event, "delete")} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">{pt ? "Excluir meu cadastro" : "Delete my profile"}</h2>
        <p className="text-sm">{pt ? "Esta ação encerra suas sessões e remove os registros do banco ativo. Baixe uma cópia antes de confirmar, se quiser guardá-la." : "This ends your sessions and removes your records from the active database. Download a copy before confirming if you want to keep it."}</p>
        <label className="grid gap-1 text-sm">
          {pt ? "Senha atual" : "Current password"}
          <input name="password" type="password" autoComplete="current-password" required maxLength={1024} disabled={pending} className="rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" required disabled={pending} className="mt-1" />
          {pt ? "Confirmo que quero excluir meu cadastro e meus lançamentos." : "I confirm that I want to delete my profile and records."}
        </label>
        <button type="submit" disabled={pending} className="rounded-md bg-rose-700 px-3 py-2 text-white disabled:opacity-50">
          {pt ? "Excluir definitivamente" : "Delete permanently"}
        </button>
      </form>
    </div>
  );
}

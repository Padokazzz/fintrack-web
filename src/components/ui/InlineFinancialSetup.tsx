import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createAccount } from "../../features/accounts/accounts-service";
import { createCategory } from "../../features/categories/categories-service";
import type { TransactionType } from "../../features/categories/types";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { Alert } from "./Alert";

type Props =
  | { kind: "account"; accountType?: 1 | 3; onCreated: (id: string) => void }
  | { kind: "category"; type: TransactionType; suggestion?: string; onCreated: (id: string) => void };

export function InlineFinancialSetup(props: Props) {
  const { language } = useLanguage();
  const pt = language === "pt-BR";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const balanceIsValid = balance === "" || /^\d{1,16}(?:[.,]\d{1,2})?$/.test(balance);
  const isAccount = props.kind === "account";
  const isWallet = props.kind === "account" && props.accountType === 3;
  const canSave = name.trim().length >= 2 && (!isAccount || balanceIsValid);
  const mutation = useMutation({
    mutationFn: async (): Promise<{ id: string }> => props.kind === "account"
      ? createAccount({ name: name.trim(), type: props.accountType ?? 1, initialBalance: Number(balance.replace(",", ".")) })
      : createCategory({ name: name.trim(), type: props.type }),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: [isAccount ? "accounts" : "categories"] });
      if (isAccount) await queryClient.invalidateQueries({ queryKey: ["overall-balance"] });
      props.onCreated(item.id);
      setOpen(false);
    },
  });
  const label = isWallet ? (pt ? "Criar carteira" : "Add cash wallet") : isAccount ? (pt ? "Criar conta bancária" : "Add bank account") : (pt ? "Criar categoria" : "Add category");

  if (!open) return (
    <button type="button" className="min-h-11 text-sm font-medium text-emerald-800 underline" onClick={() => {
      mutation.reset();
      setBalance("");
      setName(props.kind === "category" ? props.suggestion ?? "" : isWallet ? (pt ? "Carteira" : "Cash wallet") : "");
      setOpen(true);
    }}>{label}</button>
  );

  return (
    <div className="mt-1 grid gap-2 rounded-md border border-slate-200 p-3">
      <label className="grid gap-1 text-sm">
        {isWallet ? (pt ? "Nome da carteira" : "Wallet name") : isAccount ? (pt ? "Nome do banco ou da conta" : "Bank or account name") : (pt ? "Nome da categoria" : "Category name")}
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (canSave && !mutation.isPending) mutation.mutate();
          }} className="min-h-11 rounded-md border px-2" />
      </label>
      {isAccount && <label className="grid gap-1 text-sm">
        {pt ? "Saldo atual (opcional)" : "Current balance (optional)"}
        <input value={balance} onChange={(event) => setBalance(event.target.value)} inputMode="decimal"
          aria-invalid={!balanceIsValid} placeholder="0" className="min-h-11 rounded-md border px-2" />
        {!balanceIsValid && <span>{pt ? "Use um valor positivo com até duas casas decimais." : "Enter a positive amount with up to two decimal places."}</span>}
      </label>}
      {mutation.isError && <Alert variant="error">{pt ? "Não foi possível salvar. Confira o nome e tente novamente." : "Could not save. Check the name and try again."}</Alert>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!canSave || mutation.isPending} onClick={() => mutation.mutate()} className="min-h-11 rounded-md bg-emerald-700 px-3 text-sm text-white disabled:opacity-60">{label}</button>
        <button type="button" disabled={mutation.isPending} onClick={() => setOpen(false)} className="min-h-11 px-2 text-sm">{pt ? "Cancelar" : "Cancel"}</button>
      </div>
    </div>
  );
}

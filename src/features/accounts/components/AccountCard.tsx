import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../lib/formatters";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import { CardPayment } from "./CardPayment";
import type { Account, AccountType } from "../types";

type AccountCardProps = {
  account: Account;
  bank?: Account;
  linkedCards?: Account[];
  onAddCard?: () => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
};

export function AccountCard({ account, bank, linkedCards = [], onAddCard, onEdit, onDelete }: AccountCardProps) {
  const { currency, locale, t, language } = useLanguage();

  const pt = language === "pt-BR";
  const money = (value: number) => formatCurrency(value, locale, currency);
  const accountTypeLabelKeys: Record<
    AccountType,
    keyof typeof t.accountTypes
  > = {
    1: "checking",
    2: "savings",
    3: "cash",
    4: "creditCard",
    5: "investment",
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {account.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t.accountTypes[accountTypeLabelKeys[account.type]]}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label={t.accounts.editLabel}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(account)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50"
            aria-label={t.accounts.deleteLabel}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {account.type === 4 ? (
        <>
          <dl className="mt-4 grid gap-2 text-sm">
            <div><dt>{pt ? "Limite usado" : "Credit used"}</dt><dd className="font-semibold">{money(account.usedCredit ?? 0)}</dd></div>
            {account.currentBalance > 0 && <div><dt>{pt ? "Crédito a favor" : "Credit balance"}</dt><dd>{money(account.currentBalance)}</dd></div>}
            {account.creditLimit != null && <>
              <div><dt>{pt ? "Limite disponível" : "Available credit"}</dt><dd className="font-semibold">{money(account.availableCredit ?? 0)}</dd></div>
              <div><dt>{pt ? "Limite total" : "Credit limit"}</dt><dd>{money(account.creditLimit)}</dd></div>
            </>}
          </dl>
          {account.creditLimit != null && (account.usedCredit ?? 0) > account.creditLimit && (
            <p className="mt-2 text-sm font-medium text-rose-700">{pt ? "Limite excedido" : "Limit exceeded"} · {money((account.usedCredit ?? 0) - account.creditLimit)}</p>
          )}
          {bank && <CardPayment card={account} bank={bank} />}
        </>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-slate-500">{t.accounts.currentBalance}</p>
          <strong className="mt-1 block text-2xl font-semibold text-slate-950">{money(account.currentBalance)}</strong>
        </div>
      )}
      {linkedCards.length > 0 && (
        <div className="mt-4 grid gap-3">
          {linkedCards.map((card) => <AccountCard key={card.id} account={card} bank={account} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
      {onAddCard && <button type="button" onClick={onAddCard} className="mt-4 min-h-11 rounded-md border border-slate-300 px-3 text-sm">
        {pt ? "Adicionar cartão deste banco" : "Add a card from this bank"}
      </button>}
    </article>
  );
}

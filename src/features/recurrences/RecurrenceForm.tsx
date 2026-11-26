import { useState, type FormEvent } from "react";
import { useLanguage } from "../../lib/i18n/useLanguage";
import type { Account } from "../accounts/types";
import type { Category } from "../categories/types";
import type { RuleInput } from "./recurrences-service";

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";

export function RecurrenceForm({ accounts, categories, today, pending, onCreate }: {
  accounts: Account[];
  categories: Category[];
  today: string;
  pending: boolean;
  onCreate: (rule: RuleInput) => void;
}) {
  const { t } = useLanguage();
  const labels = t.recurrences;
  const [type, setType] = useState<1 | 2>(2);
  const [automatic, setAutomatic] = useState(false);
  const matchingCategories = categories.filter((category) => category.type === type);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = String(data.get("amount"));
    onCreate({
      description: String(data.get("description")).trim(),
      accountId: String(data.get("accountId")),
      categoryId: String(data.get("categoryId")),
      startsOn: String(data.get("startsOn")),
      amount: amount === "" ? null : Number(amount),
      type,
      automatic,
    });
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submit}>
      <label className="space-y-1 text-sm">
        <span>{labels.description}</span>
        <input name="description" className={inputClass} placeholder={labels.placeholder} maxLength={150} required />
      </label>
      <label className="space-y-1 text-sm">
        <span>{labels.type}</span>
        <select className={inputClass} value={type} onChange={(event) => setType(event.target.value === "1" ? 1 : 2)}>
          <option value={2}>{labels.expense}</option>
          <option value={1}>{labels.income}</option>
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span>{labels.account}</span>
        <select name="accountId" className={inputClass} required defaultValue="">
          <option value="" disabled>{labels.selectAccount}</option>
          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span>{labels.category}</span>
        <select key={type} name="categoryId" className={inputClass} required defaultValue="">
          <option value="" disabled>{labels.selectCategory}</option>
          {matchingCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span>{labels.startsOn}</span>
        <input name="startsOn" type="date" min="2000-01-01" max="2100-12-31" className={inputClass}
          defaultValue={today} required />
        <span className="block text-xs text-slate-500">{labels.dateHint}</span>
      </label>
      <label className="space-y-1 text-sm">
        <span>{labels.mode}</span>
        <select className={inputClass} value={automatic ? "automatic" : "manual"}
          onChange={(event) => setAutomatic(event.target.value === "automatic")}>
          <option value="manual">{labels.manual}</option>
          <option value="automatic">{labels.automatic}</option>
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span>{automatic ? labels.amount : labels.optionalAmount}</span>
        <input name="amount" type="number" min="0.01" step="0.01" className={inputClass} required={automatic} />
      </label>
      <div className="flex items-end">
        <button type="submit" disabled={pending || !accounts.length || !matchingCategories.length}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {labels.save}
        </button>
      </div>
    </form>
  );
}

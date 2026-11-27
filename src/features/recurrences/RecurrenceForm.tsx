import { useState, type FormEvent } from "react";
import { InlineFinancialSetup } from "../../components/ui/InlineFinancialSetup";
import { useLanguage } from "../../lib/i18n/useLanguage";
import type { Account } from "../accounts/types";
import type { Category } from "../categories/types";
import { paymentMethods, type Rule, type RuleInput } from "./recurrences-service";

const presets = [
  { id: "electricity", pt: "Energia", en: "Electricity", type: 2 },
  { id: "water", pt: "Água", en: "Water", type: 2 },
  { id: "internet", pt: "Internet", en: "Internet", type: 2 },
  { id: "streaming", pt: "Streaming", en: "Streaming", type: 2 },
  { id: "rent", pt: "Aluguel", en: "Rent", type: 2 },
  { id: "loan", pt: "Empréstimo", en: "Loan", type: 2 },
  { id: "financing", pt: "Financiamento", en: "Financing", type: 2 },
  { id: "salary", pt: "Salário", en: "Salary", type: 1 },
] as const;

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";

export function RecurrenceForm({ accounts, categories, today, pending, onCreate, initialRule }: {
  initialRule?: Rule;
  accounts: Account[];
  categories: Category[];
  today: string;
  pending: boolean;
  onCreate: (rule: RuleInput) => void;
}) {
  const { t, language } = useLanguage();
  const pt = language === "pt-BR";
  const labels = t.recurrences;
  const [type, setType] = useState<1 | 2>(initialRule?.type ?? 2);
  const [automatic, setAutomatic] = useState(initialRule?.automatic ?? false);
  const [description, setDescription] = useState(initialRule?.description ?? "");
  const [presetId, setPresetId] = useState("");
  const [accountId, setAccountId] = useState(initialRule?.accountId ?? "");
  const [categoryId, setCategoryId] = useState(initialRule?.categoryId ?? "");
  const [paymentMethod, setPaymentMethod] = useState<RuleInput["paymentMethod"]>(initialRule?.paymentMethod ?? null);
  const [startsOn, setStartsOn] = useState(initialRule?.nextDate ?? today);
  const selectedPreset = presets.find((preset) => preset.id === presetId);
  const suggestion = selectedPreset ? pt ? selectedPreset.pt : selectedPreset.en : description.trim();
  const matchingCategories = categories.filter((category) => category.type === type);

  const eligibleAccounts = paymentMethod === 1
    ? accounts.filter((account) => account.type === 1 || account.type === 2)
    : accounts;
  const selectedAccount = eligibleAccounts.some((account) => account.id === accountId)
    ? accountId
    : eligibleAccounts.length === 1 ? eligibleAccounts[0].id : "";
  const suggestedCategory = matchingCategories.find((item) => item.name.toLocaleLowerCase() === suggestion.toLocaleLowerCase());
  const selectedCategory = categoryId || suggestedCategory?.id || "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = String(data.get("amount"));
    const endsOn = String(data.get("endsOn") ?? "");
    onCreate({
      description: description.trim(),
      accountId: String(data.get("accountId")),
      categoryId: String(data.get("categoryId")),
      startsOn: initialRule && startsOn === initialRule.nextDate ? initialRule.startsOn : startsOn,
      amount: amount === "" ? null : Number(amount),
      type,
      automatic,
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(endsOn ? { endsOn } : {}),
    });
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submit}>
      {!initialRule && <fieldset className="space-y-2 sm:col-span-2 lg:col-span-3">
        <legend className="font-medium">{pt ? "O que se repete todo mês?" : "What happens every month?"}</legend>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button key={preset.id} type="button" aria-pressed={presetId === preset.id}
              className="min-h-11 rounded-md border border-slate-300 px-3 text-sm aria-pressed:border-emerald-700 aria-pressed:bg-emerald-50"
              onClick={() => {
                setPresetId(preset.id);
                setDescription(pt ? preset.pt : preset.en);
                setType(preset.type);
                if (preset.type === 1) setPaymentMethod(null);
                setCategoryId("");
              }}>{pt ? preset.pt : preset.en}</button>
          ))}
          <button type="button" aria-pressed={presetId === "custom"} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm aria-pressed:border-emerald-700 aria-pressed:bg-emerald-50"
            onClick={() => { setPresetId("custom"); setDescription(""); setCategoryId(""); setType(2); }}>
            {pt ? "Outra conta" : "Other bill"}
          </button>
        </div>
      </fieldset>}
      <label className="space-y-1 text-sm">
        <span>{labels.description}</span>
        <input name="description" value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} placeholder={labels.placeholder} maxLength={150} required />
      </label>
      <label className="space-y-1 text-sm">
        <span>{labels.type}</span>
        <select className={inputClass} value={type} onChange={(event) => {
          setType(event.target.value === "1" ? 1 : 2);
          setCategoryId("");
          if (event.target.value === "1") setPaymentMethod(null);
          setPresetId("");
        }}>
          <option value={2}>{labels.expense}</option>
          <option value={1}>{labels.income}</option>
        </select>
      </label>
      {type === 2 && <label className="space-y-1 text-sm">
        <span>{pt ? "Como você paga?" : "How do you pay?"}</span>
        <select className={inputClass} value={paymentMethod ?? ""} onChange={(event) => {
          setPaymentMethod(paymentMethods.find(({ id }) => id === Number(event.target.value))?.id ?? null);
        }}>
          <option value="">{pt ? "Informar depois" : "Leave unspecified"}</option>
          {paymentMethods.map((method) => <option key={method.id} value={method.id}>{pt ? method.pt : method.en}</option>)}
        </select>
      </label>}
      <div>
        <label className="block space-y-1 text-sm">
          <span>{type === 1 ? (pt ? "Em qual conta você recebe?" : "Which account receives it?") : paymentMethod === 1 ? (pt ? "De qual banco sai o débito?" : "Which bank account is debited?") : pt ? "Onde registrar o pagamento?" : "Where should the payment be recorded?"}</span>
          <select name="accountId" className={inputClass} required value={selectedAccount} onChange={(event) => setAccountId(event.target.value)}>
            <option value="" disabled>{labels.selectAccount}</option>
            {eligibleAccounts.map((account) => <option key={account.id} value={account.id}>
              {account.name}{account.type === 4 ? (pt ? " · Crédito" : " · Credit") : ""}
            </option>)}
          </select>
        </label>
        {type === 2 && paymentMethod !== 1 && <p className="mt-1 text-xs text-slate-600">
          {pt ? "Escolha a conta, o cartão ou a carteira que você usou para pagar." : "Choose the account, card, or cash wallet used to pay."}
        </p>}
        <div className="grid gap-1">
          <InlineFinancialSetup kind="account" onCreated={setAccountId} />
          {type === 2 && paymentMethod !== 1 && <InlineFinancialSetup kind="account" accountType={3} onCreated={setAccountId} />}
        </div>
      </div>
      <div>
        <label className="block space-y-1 text-sm">
          <span>{labels.category}</span>
          <select name="categoryId" className={inputClass} required value={selectedCategory} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="" disabled>{labels.selectCategory}</option>
            {matchingCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <InlineFinancialSetup key={type} kind="category" type={type} suggestion={suggestion} onCreated={setCategoryId} />
      </div>
      <label className="space-y-1 text-sm">
        <span>{initialRule ? (pt ? "Próxima data" : "Next date") : labels.startsOn}</span>
        <input name="startsOn" type="date" min="2000-01-01" max="2100-12-31" className={inputClass}
          value={startsOn} onChange={(event) => setStartsOn(event.target.value)} required />
        <span className="block text-xs text-slate-500">{labels.dateHint}</span>
      </label>
      <label className="space-y-1 text-sm">
        <span>{pt ? "Até quando? (opcional)" : "End date (optional)"}</span>
        <input name="endsOn" defaultValue={initialRule?.endsOn ?? undefined} type="date" min={startsOn} max="2100-12-31" className={inputClass} />
        <span className="block text-xs text-slate-500">{pt ? "Informe a data da última parcela para parar os lançamentos." : "Enter the final installment date to stop future entries."}</span>
      </label>
      <label className="space-y-1 text-sm">
        <span>{labels.mode}</span>
        <select className={inputClass} value={automatic ? "automatic" : "manual"}
          onChange={(event) => setAutomatic(event.target.value === "automatic")}>
          <option value="manual">{labels.manual}</option>
          <option value="automatic">{labels.automatic}</option>
        </select>
        <span className="block text-xs text-slate-600">
          {automatic
            ? pt ? "O FinTrack anota o valor informado na data. O pagamento continua no banco ou cartão." : "FinTrack records this amount on the date. Payment still happens at the bank or card."
            : pt ? "Indicado se o valor muda. Informe ou confira o valor na confirmação." : "Useful when the amount varies. Enter or check it when you confirm."}
        </span>
      </label>
      <label className="space-y-1 text-sm">
        <span>{automatic ? labels.amount : labels.optionalAmount}</span>
        <input name="amount" defaultValue={initialRule?.amount ?? undefined} type="number" inputMode="decimal" min="0.01" step="0.01" className={inputClass} required={automatic} />
      </label>
      <div className="flex items-end">
        <button type="submit" disabled={pending || !selectedAccount || !selectedCategory || !description.trim()}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {labels.save}
        </button>
      </div>
    </form>
  );
}

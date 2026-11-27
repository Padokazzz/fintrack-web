import { api } from "../../lib/api";

export const paymentMethods = [
  { id: 1, pt: "Débito automático", en: "Direct debit" },
  { id: 2, pt: "Boleto", en: "Bank slip" },
  { id: 3, pt: "Pix", en: "Pix" },
  { id: 4, pt: "Cartão", en: "Card" },
  { id: 5, pt: "Outra forma", en: "Other method" },
] as const;

type PaymentMethod = typeof paymentMethods[number]["id"];

export type RuleInput = {
  description: string;
  accountId: string;
  categoryId: string;
  type: 1 | 2;
  amount: number | null;
  startsOn: string;
  automatic: boolean;
  paymentMethod?: PaymentMethod | null;
  endsOn?: string | null;
};

export type Rule = RuleInput & { id: string; nextDate: string; paused: boolean };

export type Scheduled = Pick<RuleInput, "description" | "accountId" | "type" | "amount" | "automatic" | "paymentMethod"> & {
  ruleId: string;
  date: string;
  pending: boolean;
};

export type Agenda = {
  today: string;
  through: string;
  items: Scheduled[];
  accounts: {
    id: string;
    name: string;
    currentBalance: number;
    projectedBalance: number;
    hasUnknownAmounts: boolean;
  }[];
};

export async function getAgenda() {
  return (await api.get<Agenda>("/recurrences/agenda")).data;
}

export async function getRules() {
  return (await api.get<Rule[]>("/recurrences")).data;
}

export async function createRule(rule: RuleInput) {
  await api.post("/recurrences", rule);
}

export async function setRulePaused(id: string, paused: boolean) {
  await api.patch(`/recurrences/${id}`, { paused });
}

export async function deleteRule(id: string) {
  await api.delete(`/recurrences/${id}`);
}

export async function confirmOccurrence(item: Scheduled, amount: number | null) {
  await api.post(`/recurrences/${item.ruleId}/occurrences/${item.date}/confirm`, { amount });
}

export function formatScheduledDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export async function updateRule(id: string, rule: RuleInput) {
  await api.put(`/recurrences/${id}`, rule);
}

export type Amortization = {
  id: string;
  date: string;
  amount: number | null;
  installments: number;
};

export type AmortizationComparison = {
  remainingBefore: number;
  remainingAfter: number;
  payment: number;
};

export type SavedAmortization = Amortization & {
  remainingBefore: number | null;
  remainingAfter: number | null;
  comparedPayment: number | null;
  savings: number | null;
};

export async function saveAmortizationComparison(ruleId: string, id: string, input: AmortizationComparison) {
  await api.put(`/recurrences/${ruleId}/amortizations/${id}/comparison`, input);
}

export async function getAmortizations(id: string) {
  return (await api.get<SavedAmortization[]>(`/recurrences/${id}/amortizations`)).data;
}

export async function recordAmortization(id: string, item: Amortization) {
  await api.post(`/recurrences/${id}/amortizations`, item);
}

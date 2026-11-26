import { api } from "../../lib/api";

export type RuleInput = {
  description: string;
  accountId: string;
  categoryId: string;
  type: 1 | 2;
  amount: number | null;
  startsOn: string;
  automatic: boolean;
};

export type Rule = RuleInput & { id: string; nextDate: string; paused: boolean };

export type Scheduled = Pick<RuleInput, "description" | "accountId" | "type" | "amount" | "automatic"> & {
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

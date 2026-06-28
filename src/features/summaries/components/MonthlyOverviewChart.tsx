import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../../lib/formatters";
import { useLanguage } from "../../../lib/i18n/useLanguage";

type MonthlyOverviewChartProps = {
  totalIncome: number;
  totalExpense: number;
  finalBalance: number;
};

export function MonthlyOverviewChart({
  totalIncome,
  totalExpense,
  finalBalance,
}: MonthlyOverviewChartProps) {
  const { currency, locale, t } = useLanguage();

  const data = [
    {
      name: t.common.income,
      amount: totalIncome,
      fill: "#059669",
    },
    {
      name: t.common.expenses,
      amount: totalExpense,
      fill: "#e11d48",
    },
    {
      name: t.common.balance,
      amount: finalBalance,
      fill: finalBalance >= 0 ? "#2563eb" : "#e11d48",
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">
          {t.summaries.monthlyOverview}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t.summaries.monthlyOverviewDescription}
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                formatCurrency(Number(value), locale, currency)
              }
              width={90}
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value), locale, currency)
              }
              cursor={{ fill: "#f1f5f9" }}
            />

            <Bar
              dataKey="amount"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

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
  const data = [
    {
      name: "Income",
      amount: totalIncome,
      fill: "#059669",
    },
    {
      name: "Expenses",
      amount: totalExpense,
      fill: "#e11d48",
    },
    {
      name: "Balance",
      amount: finalBalance,
      fill: finalBalance >= 0 ? "#2563eb" : "#e11d48",
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">
          Monthly overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Income, expenses and final balance
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
                formatCurrency(Number(value))
              }
              width={90}
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value))
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
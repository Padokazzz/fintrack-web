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

const data = [
  {
    name: "Income",
    amount: 8500,
  },
  {
    name: "Expenses",
    amount: 4230,
  },
  {
    name: "Balance",
    amount: 4270,
  },
];

export function MonthlyOverviewChart() {
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              cursor={{ fill: "#f1f5f9" }}
            />
            <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
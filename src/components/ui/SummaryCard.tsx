type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
};

export function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <strong className="mt-3 block text-2xl font-semibold text-slate-950">
        {value}
      </strong>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </section>
  );
}
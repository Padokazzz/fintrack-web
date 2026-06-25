type MonthYearSelectorProps = {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
};

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function MonthYearSelector({
  month,
  year,
  onMonthChange,
  onYearChange,
}: MonthYearSelectorProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div>
        <label
          htmlFor="summary-month"
          className="text-sm font-medium text-slate-700"
        >
          Month
        </label>

        <select
          id="summary-month"
          value={month}
          onChange={(event) =>
            onMonthChange(Number(event.target.value))
          }
          className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 sm:w-40"
        >
          {months.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="summary-year"
          className="text-sm font-medium text-slate-700"
        >
          Year
        </label>

        <input
          id="summary-year"
          type="number"
          min={2000}
          max={2100}
          value={year}
          onChange={(event) => {
            const newYear = Number(event.target.value);

            if (newYear >= 2000 && newYear <= 2100) {
              onYearChange(newYear);
            }
          }}
          className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 sm:w-28"
        />
      </div>
    </div>
  );
}
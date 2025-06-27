import { useState, useEffect } from "react";

export default function BudgetCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [entries, setEntries] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("budget-entries");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("budget-entries", JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (day) => {
    const type = prompt("Typ (income/expense)?");
    if (!["income", "expense"].includes(type)) return;
    const amount = parseFloat(prompt("Kwota?"));
    if (isNaN(amount)) return;

    const key = `${currentYear}-${currentMonth}-${day}`;
    const entry = { type, amount };
    const existing = entries[key] || [];
    setEntries({ ...entries, [key]: [...existing, entry] });
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">
        CashPlan – {today.toLocaleString("pl-PL", { month: "long" })} {currentYear}
      </h1>
      <div className="grid grid-cols-7 gap-2 text-center font-medium mb-2">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(offset)].map((_, i) => <div key={`e-${i}`}></div>)}
        {days.map((day) => {
          const key = `${currentYear}-${currentMonth}-${day}`;
          const daily = entries[key] || [];
          const total = daily.reduce(
            (acc, e) => acc + (e.type === "income" ? e.amount : -e.amount), 0
          );
          return (
            <div
              key={day}
              onClick={() => handleAddEntry(day)}
              className={`border p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${new Date(currentYear, currentMonth, day).getDay() === 5 ? "bg-payday/20 dark:bg-payday/30" : ""}`}
              title="Kliknij aby dodać wpis"
            >
              <div className="font-semibold">{day}</div>
              {daily.map((e, i) => (
                <div
                  key={i}
                  className={`text-xs ${
                    e.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {e.type === "income" ? "+" : "-"}
                  {e.amount.toFixed(2)} £
                </div>
              ))}
              <div className="text-xs text-gray-500 mt-1">
                = {total.toFixed(2)} £
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
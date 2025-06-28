import { useState, useEffect } from "react";

export default function BudgetCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [entries, setEntries] = useState({});
  const [modalDay, setModalDay] = useState(null);
  const [entryType, setEntryType] = useState("income");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("budget-entries");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("budget-entries", JSON.stringify(entries));
  }, [entries]);

  const openModal = (day) => {
    setModalDay(day);
    setEntryType("income");
    setAmount("");
  };

  const closeModal = () => {
    setModalDay(null);
    setAmount("");
  };

  const saveEntry = () => {
    const value = parseFloat(amount);
    if (isNaN(value)) return;

    const key = currentYear + "-" + currentMonth + "-" + modalDay;
    const newEntry = { type: entryType, amount: value };
    const existing = entries[key] || [];
    setEntries({ ...entries, [key]: [...existing, newEntry] });
    closeModal();
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-4 text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        CashPlan – {today.toLocaleString("pl-PL", { month: "long" })} {currentYear}
      </h1>
      <div className="grid grid-cols-7 gap-2 text-center font-medium mb-2">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(offset)].map(function (_, i) {
          return <div key={"e-" + i}></div>;
        })}
        {days.map((day) => {
          const key = currentYear + "-" + currentMonth + "-" + day;
          const daily = entries[key] || [];
          const total = daily.reduce(
            (acc, e) => acc + (e.type === "income" ? e.amount : -e.amount),
            0
          );
          const isFriday = new Date(currentYear, currentMonth, day).getDay() === 5;

          return (
            <div
              key={day}
              onClick={() => openModal(day)}
              className={
                "border p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 " +
                (isFriday ? "bg-payday/20 dark:bg-payday/30" : "")
              }
              title="Kliknij aby dodać wpis"
            >
              <div className="font-semibold">{day}</div>
              {daily.map((e, i) => (
                <div
                  key={i}
                  className={
                    "text-xs " + (e.type === "income" ? "text-green-600" : "text-red-500")
                  }
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

      {modalDay && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-bold mb-3">
              Dodaj wpis – {modalDay}.{currentMonth + 1}.{currentYear}
            </h2>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setEntryType("income")}
                className={
                  "flex-1 py-1 rounded border " +
                  (entryType === "income"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 dark:bg-gray-700")
                }
              >
                ➕ Dochód
              </button>
              <button
                onClick={() => setEntryType("expense")}
                className={
                  "flex-1 py-1 rounded border " +
                  (entryType === "expense"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 dark:bg-gray-700")
                }
              >
                ➖ Wydatek
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 mb-3 rounded border dark:bg-gray-700"
              placeholder="Kwota"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600"
              >
                Anuluj
              </button>
              <button
                onClick={saveEntry}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

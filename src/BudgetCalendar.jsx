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

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleResetToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-GB", { month: "long" });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div
      className="p-2 sm:p-4 text-gray-900 dark:text-gray-50 min-h-screen transition-colors"
      style={{
        backgroundImage: "url('/TapetaGlass02.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="relative mb-4 rounded-xl backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/10 dark:border-white/5 shadow-md px-4 py-2 flex flex-col items-center sm:flex-row sm:justify-between sm:items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button onClick={handlePrevMonth} className="text-lg px-3 py-1 rounded bg-white/30 dark:bg-white/10 hover:bg-white/40 dark:hover:bg-white/20 shadow-sm">
            ←
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">CashPlan</h1>
          <div className="text-sm text-gray-800 dark:text-gray-300">{monthName} {currentYear}</div>
          <button onClick={handleResetToday} className="mt-1 text-sm px-3 py-1 rounded bg-white/30 dark:bg-white/10 hover:bg-white/40 dark:hover:bg-white/20 shadow-sm">
            Today
          </button>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button onClick={handleNextMonth} className="text-lg px-3 py-1 rounded bg-white/30 dark:bg-white/10 hover:bg-white/40 dark:hover:bg-white/20 shadow-sm">
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-medium mb-2 text-xs sm:text-sm">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
        {[...Array(offset)].map((_, i) => <div key={"e-" + i}></div>)}
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
              className={`border p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${isFriday ? "bg-yellow-100 dark:bg-yellow-800" : ""}`}
              title="Click to add entry"
            >
              <div className="font-semibold text-sm sm:text-base">{day}</div>
              {daily.map((e, i) => (
                <div
                  key={i}
                  className={`text-xs ${e.type === "income" ? "text-green-600" : "text-red-500"}`}
                >
                  {e.type === "income" ? "+" : "-"}{e.amount.toFixed(2)} £
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
          <div className="backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-4 w-11/12 max-w-sm animate-fade-in">
            <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">
              Add entry – {modalDay}.{currentMonth + 1}.{currentYear}
            </h2>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setEntryType("income")}
                className={`flex-1 py-1 rounded border ${entryType === "income" ? "bg-green-100 text-green-800" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                ➕ Income
              </button>
              <button
                onClick={() => setEntryType("expense")}
                className={`flex-1 py-1 rounded border ${entryType === "expense" ? "bg-red-100 text-red-800" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                ➖ Expense
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 mb-3 rounded border dark:bg-gray-700"
              placeholder="Amount"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

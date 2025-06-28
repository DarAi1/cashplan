import { useState, useEffect } from "react";
import SnakeGame from "./SnakeGame";

export default function BudgetCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [entries, setEntries] = useState({});
  const [modalDay, setModalDay] = useState(null);
  const [entryType, setEntryType] = useState("income");
  const [amount, setAmount] = useState("");
  const [showSnake, setShowSnake] = useState(false);

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

    const key = `${currentYear}-${currentMonth}-${modalDay}`;
    const newEntry = { type: entryType, amount: value };
    const existing = entries[key] || [];
    setEntries({ ...entries, [key]: [...existing, newEntry] });
    setAmount("");
  };

  const deleteEntry = (idx) => {
    const key = `${currentYear}-${currentMonth}-${modalDay}`;
    const updated = entries[key].filter((_, i) => i !== idx);
    setEntries({ ...entries, [key]: updated });
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

  const selectedKey = `${currentYear}-${currentMonth}-${modalDay}`;
  const selectedEntries = entries[selectedKey] || [];

  return (
    <div
      className="p-2 sm:p-4 text-black min-h-screen transition-colors"
      style={{
        backgroundImage: "url('/TapetaGlass02.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {showSnake ? (
        <SnakeGame onExit={() => setShowSnake(false)} />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4 backdrop-blur-md bg-white/30 px-3 py-2 rounded-xl">
            <button onClick={handlePrevMonth} className="text-xl">←</button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">CashPlan</h1>
              <p className="text-md">{monthName} {currentYear}</p>
            </div>
            <button onClick={handleNextMonth} className="text-xl">→</button>
          </div>

          <div className="flex justify-center mb-3">
            <button
              onClick={handleResetToday}
              className="px-4 py-2 rounded-lg bg-white/40 backdrop-blur text-black font-semibold shadow"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center font-medium mb-2">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(offset)].map((_, i) => <div key={"e-" + i}></div>)}
            {days.map((day) => {
              const key = `${currentYear}-${currentMonth}-${day}`;
              const daily = entries[key] || [];
              const totalIncome = daily.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
              const totalExpense = daily.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
              const isFriday = new Date(currentYear, currentMonth, day).getDay() === 5;

              return (
                <div
                  key={day}
                  onClick={() => openModal(day)}
                  className={`h-24 border rounded-lg cursor-pointer hover:bg-white/10 backdrop-blur-md transition-colors flex flex-col justify-between p-1 ${isFriday ? 'border-4 border-yellow-400' : 'border-white/60'}`}
                  title="Click to add entry"
                >
                  <div className="font-semibold text-black text-sm text-center">{day}</div>
                  <div className="flex flex-col justify-end h-full gap-0.5 px-2">
                    <div
                      className="bg-green-500 w-full"
                      style={{ height: `${Math.min((totalIncome / (totalIncome + totalExpense || 1)) * 100, 100)}%` }}
                    ></div>
                    <div
                      className="bg-red-500 w-full"
                      style={{ height: `${Math.min((totalExpense / (totalIncome + totalExpense || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={() => setShowSnake(true)}
              className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-md text-black font-semibold shadow-md"
            >
              Relax Mode
            </button>
          </div>
        </div>
      )}

      {modalDay && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-bold mb-3 text-center text-black">
              Entries – {modalDay}.{currentMonth + 1}.{currentYear}
            </h2>
            <div className="mb-3 max-h-40 overflow-y-auto text-sm text-black">
              {selectedEntries.length > 0 ? (
                <ul className="space-y-1">
                  {selectedEntries.map((entry, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b pb-1">
                      <span className={entry.type === "income" ? "text-green-700" : "text-red-700"}>
                        {entry.type === "income" ? "Income" : "Expense"}:
                      </span>
                      <span>{entry.amount.toFixed(2)} £</span>
                      <button
                        onClick={() => deleteEntry(idx)}
                        className="ml-2 text-xs text-red-600 hover:text-red-800"
                      >✖</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center italic">No entries for this day.</p>
              )}
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setEntryType("income")}
                className={`flex-1 py-1 rounded border ${entryType === "income" ? "bg-green-100 text-green-800" : "bg-gray-100 text-black"}`}
              >
                ➕ Income
              </button>
              <button
                onClick={() => setEntryType("expense")}
                className={`flex-1 py-1 rounded border ${entryType === "expense" ? "bg-red-100 text-red-800" : "bg-gray-100 text-black"}`}
              >
                ➖ Expense
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 mb-3 rounded border text-black"
              placeholder="Amount"
            />
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-3 py-1 rounded bg-gray-300 text-black">Close</button>
              <button onClick={saveEntry} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

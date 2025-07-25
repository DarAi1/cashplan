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
  const [category, setCategory] = useState("Other");
  const [filterCat, setFilterCat] = useState("All");
  const [showSnake, setShowSnake] = useState(false);

  // Predefined categories
  const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];

  // Load entries from storage
  useEffect(() => {
    const stored = localStorage.getItem("budget-entries");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  // Save entries to storage
  useEffect(() => {
    localStorage.setItem("budget-entries", JSON.stringify(entries));
  }, [entries]);

  const openModal = (day) => {
    setModalDay(day);
    setEntryType("income");
    setAmount("");
    setCategory("Other");
  };

  const closeModal = () => {
    setModalDay(null);
    setAmount("");
  };

  const saveEntry = () => {
    const value = parseFloat(amount);
    if (isNaN(value)) return;

    const key = `${currentYear}-${currentMonth}-${modalDay}`;
    const newEntry = { type: entryType, amount: value, category };
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
          {/* Header */}
          <div className="flex justify-between items-center mb-4 backdrop-blur-md bg-white/30 px-3 py-2 rounded-xl">
            <button onClick={handlePrevMonth} className="text-xl">←</button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">CashPlan</h1>
              <p className="text-md">{monthName} {currentYear}</p>
            </div>
            <button onClick={handleNextMonth} className="text-xl">→</button>
          </div>

          {/* Today button */}
          <div className="flex justify-center mb-3">
            <button
              onClick={handleResetToday}
              className="px-4 py-2 rounded-lg bg-white/40 backdrop-blur text-black font-semibold shadow"
            >
              Today
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-4">
            <select
              data-testid="category-filter"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="p-2 rounded border bg-white/70 backdrop-blur"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Weekdays header */}
          <div className="grid grid-cols-7 gap-2 text-center font-medium mb-2">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {[...Array(offset)].map((_, i) => <div key={`empty-${i}`}></div>)}
            {days.map((day) => {
              const key = `${currentYear}-${currentMonth}-${day}`;
              const daily = entries[key] || [];
              const filtered = filterCat === 'All' ? daily : daily.filter(e => e.category === filterCat);
              const total = filtered.reduce((acc, e) => acc + (e.type === "income" ? e.amount : -e.amount), 0);
              const isFriday = new Date(currentYear, currentMonth, day).getDay() === 5;

              return (
                <div
                  key={day}
                  onClick={() => openModal(day)}
                  className={`border p-1 rounded-lg cursor-pointer hover:bg-white/10 backdrop-blur-md transition-colors ${isFriday ? 'border-4 border-yellow-400' : 'border-white/60'}`}
                  title="Click to add entry"
                >
                  <div className="font-semibold text-black">{day}</div>
                  {filtered.map((e, idx) => (
                    <div key={idx} className={`text-xs flex justify-between items-center ${e.type === "income" ? "text-green-600" : "text-red-500"}`}
                         data-testid="entry-item">
                      <span>{e.type === "income" ? "+" : "-"}{e.amount.toFixed(2)} £</span>
                      <span className="italic text-[10px]">{e.category}</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-700 mt-1">= {total.toFixed(2)} £</div>
                </div>
              );
            })}
          </div>

          {/* Relax Mode */}
          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={() => setShowSnake(true)}
              className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-md text-black font-semibold shadow-md"
            >
              Relax Mode
            </button>
          </div>

          {/* Entry Modal */}
          {modalDay && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white/70 backdrop-blur-xl p-4 rounded-xl shadow-lg w-80">
                <h2 className="text-lg font-bold mb-3 text-center text-black">
                  Add Entry – {modalDay}.{currentMonth + 1}.{currentYear}
                </h2>
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
                {/* Category selector */}
                <select
                  data-testid="category-selector"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 mb-3 rounded border bg-white text-black"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="px-3 py-1 rounded bg-gray-300 text-black">Cancel</button>
                  <button onClick={saveEntry} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

```jsx
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
  const [editIndex, setEditIndex] = useState(null);
  const [showSnake, setShowSnake] = useState(false);

  // Predefined categories and colors
  const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];
  const categoryColors = {
    Food: "bg-red-400",
    Transport: "bg-blue-400",
    Entertainment: "bg-purple-400",
    Bills: "bg-yellow-400",
    Other: "bg-gray-400"
  };

  // Load entries
  useEffect(() => {
    const stored = localStorage.getItem("budget-entries");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  // Save entries
  useEffect(() => {
    localStorage.setItem("budget-entries", JSON.stringify(entries));
  }, [entries]);

  const openModal = (day) => {
    setModalDay(day);
    setEntryType("income");
    setAmount("");
    setCategory("Other");
    setEditIndex(null);
  };

  const closeModal = () => {
    setModalDay(null);
    setAmount("");
    setEditIndex(null);
  };

  const saveEntry = () => {
    const value = parseFloat(amount);
    if (isNaN(value)) return;
    const key = `${currentYear}-${currentMonth}-${modalDay}`;
    const dayArr = entries[key] ? [...entries[key]] : [];
    if (editIndex !== null) {
      dayArr[editIndex] = { type: entryType, amount: value, category };
    } else {
      dayArr.push({ type: entryType, amount: value, category });
    }
    setEntries({ ...entries, [key]: dayArr });
    closeModal();
  };

  const deleteEntry = (day, idx) => {
    const key = `${currentYear}-${currentMonth}-${day}`;
    const arr = entries[key] ? [...entries[key]] : [];
    arr.splice(idx, 1);
    setEntries({ ...entries, [key]: arr });
    if (modalDay === day) setEditIndex(null);
  };

  const startEdit = (day, idx) => {
    const key = `${currentYear}-${currentMonth}-${day}`;
    const e = entries[key][idx];
    openModal(day);
    setEntryType(e.type);
    setAmount(e.amount.toString());
    setCategory(e.category);
    setEditIndex(idx);
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
    <div className="p-4 text-black min-h-screen bg-gradient-to-br from-yellow-200 via-pink-300 to-blue-400">
      {showSnake ? (
        <SnakeGame onExit={() => setShowSnake(false)} />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4 p-3 bg-white/50 rounded-xl">
            <button onClick={handlePrevMonth} className="text-xl">←</button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">CashPlan</h1>
              <p className="text-md">{monthName} {currentYear}</p>
            </div>
            <button onClick={handleNextMonth} className="text-xl">→</button>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <button onClick={handleResetToday} className="px-4 py-2 bg-white/70 rounded-lg">Today</button>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 bg-white/70 rounded-lg">
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center font-medium">
            {weekDays.map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(offset)].map((_, i) => <div key={`off-${i}`}></div>)}
            {days.map(day => {
              const key = `${currentYear}-${currentMonth}-${day}`;
              const daily = entries[key] || [];
              const filtered = filterCat === 'All' ? daily : daily.filter(e => e.category === filterCat);
              const visible = filtered.slice(-2);
              const more = filtered.length - visible.length;
              const total = visible.reduce((acc, e) => acc + (e.type === 'income' ? e.amount : -e.amount), 0);
              const isFriday = new Date(currentYear, currentMonth, day).getDay() === 5;

              return (
                <div key={day} onClick={() => openModal(day)} className={`p-2 rounded-lg cursor-pointer bg-white/20 hover:bg-white/30 transition-colors ${isFriday ? 'border-2 border-yellow-500' : 'border border-white/50'}`}>
                  <div className="font-semibold">{day}</div>
                  {visible.map((e, i) => (
                    <div key={i} className="flex items-center text-xs mt-1">
                      <span className={`w-2 h-2 rounded-full mr-1 ${categoryColors[e.category]}`}></span>
                      <span className={e.type === 'income' ? 'text-green-600' : 'text-red-500'}>
                        {e.type === 'income' ? '+' : '-'}{e.amount.toFixed(2)} £
                      </span>
                    </div>
                  ))}
                  {more > 0 && <div className="text-[10px] text-gray-700 mt-1">+{more} more</div>}
                  <div className="text-xs text-gray-800 mt-1">= {total.toFixed(2)} £</div>
                </div>
              );
            })}
          </div>

          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <button onClick={() => setShowSnake(true)} className="px-6 py-2 bg-white/70 rounded-full">Relax Mode</button>
          </div>
        </div>
      )}

      {modalDay !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-bold mb-3">Entries for {modalDay}.{currentMonth+1}.{currentYear}</h2>
            {(entries[`${currentYear}-${currentMonth}-${modalDay}`] || []).map((e, i) => (
              <div key={i} className="flex justify-between items-center mb-1">
                <div className="flex items-center text-sm">
                  <span className={`w-2 h-2 rounded-full mr-2 ${categoryColors[e.category]}`}></span>
                  <span className={e.type==='income'?'text-green-600':'text-red-500'}>
                    {e.type==='income'?'+':'-'}{e.amount.toFixed(2)} £
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{e.category}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(modalDay,i)} className="text-blue-600 text-sm">Edit</button>
                  <button onClick={() => deleteEntry(modalDay,i)} className="text-red-600 text-sm">Del</button>
                </div>
              </div>
            ))}
            <div className="mt-3">
              <div className="flex gap-2 mb-3">
                <button onClick={() => setEntryType('income')} className={`flex-1 py-1 rounded ${entryType==='income'?'bg-green-100':'bg-gray-100'}`}>Income</button>
                <button onClick={() => setEntryType('expense')} className={`flex-1 py-1 rounded ${entryType==='expense'?'bg-red-100':'bg-gray-100'}`}>Expense</button>
              </div>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full p-2 mb-2 border rounded" placeholder="Amount" />
              <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 mb-3 border rounded">
                {categories.map(cat=><option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={closeModal} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                <button onClick={saveEntry} className="px-3 py-1 bg-blue-600 text-white rounded">{editIndex!==null?'Update':'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

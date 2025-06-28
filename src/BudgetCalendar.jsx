import { useState, useEffect, useRef } from "react";

function SnakeGame({ onExit }) {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [dir, setDir] = useState([1, 0]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowUp": setDir([0, -1]); break;
        case "ArrowDown": setDir([0, 1]); break;
        case "ArrowLeft": setDir([-1, 0]); break;
        case "ArrowRight": setDir([1, 0]); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = "lime";
    snake.forEach(([x, y]) => ctx.fillRect(x * 10, y * 10, 10, 10));
    ctx.fillStyle = "red";
    ctx.fillRect(food[0] * 10, food[1] * 10, 10, 10);
  }, [snake, food]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSnake(([head, ...tail]) => {
        const newHead = [head[0] + dir[0], head[1] + dir[1]];
        if (
          newHead[0] < 0 || newHead[0] >= 30 ||
          newHead[1] < 0 || newHead[1] >= 30 ||
          tail.some(([x, y]) => x === newHead[0] && y === newHead[1])
        ) {
          setRunning(false);
          return [[10, 10]];
        }
        const grow = newHead[0] === food[0] && newHead[1] === food[1];
        if (grow) {
          setFood([Math.floor(Math.random() * 30), Math.floor(Math.random() * 30)]);
          return [newHead, head, ...tail];
        }
        return [newHead, ...tail.slice(0, -1)];
      });
    }, 150);
    return () => clearInterval(interval);
  }, [dir, food, running]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <canvas ref={canvasRef} width={300} height={300} className="mb-4 border" />
      <button onClick={onExit} className="px-4 py-2 rounded bg-red-600 text-white">Exit</button>
    </div>
  );
}

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
          {/* App content goes here (navigation, calendar, modals, etc.) */}
          <h1 className="text-2xl font-bold text-center">CashPlan</h1>
          <p className="text-center text-lg mb-2">{monthName} {currentYear}</p>
          <button onClick={handleResetToday} className="block mx-auto mb-4 px-4 py-2 rounded bg-gray-700 text-white">Today</button>
          <div className="flex justify-between mb-2">
            <button onClick={handlePrevMonth} className="px-2">⬅️</button>
            <button onClick={handleNextMonth} className="px-2">➡️</button>
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
              const total = daily.reduce((acc, e) => acc + (e.type === "income" ? e.amount : -e.amount), 0);
              const isFriday = new Date(currentYear, currentMonth, day).getDay() === 5;

              return (
                <div
                  key={day}
                  onClick={() => openModal(day)}
                  className={`border p-1 rounded cursor-pointer hover:bg-white/10 backdrop-blur-md transition-colors ${isFriday ? 'border-4 border-yellow-400' : ''}`}
                  title="Click to add entry"
                >
                  <div className="font-semibold">{day}</div>
                  {daily.map((e, i) => (
                    <div key={i} className={`text-xs ${e.type === "income" ? "text-green-600" : "text-red-500"}`}>
                      {e.type === "income" ? "+" : "-"}{e.amount.toFixed(2)} £
                    </div>
                  ))}
                  <div className="text-xs text-gray-700 mt-1">= {total.toFixed(2)} £</div>
                </div>
              );
            })}
          </div>
          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={() => setShowSnake(true)}
              className="px-4 py-2 rounded-full bg-black/70 text-white shadow-md backdrop-blur"
            >
              Relax Mode
            </button>
          </div>
        </div>
      )}

      {modalDay && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-bold mb-3 text-center">
              Add Entry – {modalDay}.{currentMonth + 1}.{currentYear}
            </h2>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setEntryType("income")}
                className={`flex-1 py-1 rounded border ${entryType === "income" ? "bg-green-100 text-green-800" : "bg-gray-100"}`}
              >
                ➕ Income
              </button>
              <button
                onClick={() => setEntryType("expense")}
                className={`flex-1 py-1 rounded border ${entryType === "expense" ? "bg-red-100 text-red-800" : "bg-gray-100"}`}
              >
                ➖ Expense
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 mb-3 rounded border"
              placeholder="Amount"
            />
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-3 py-1 rounded bg-gray-300">Cancel</button>
              <button onClick={saveEntry} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

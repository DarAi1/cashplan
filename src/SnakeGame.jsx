import { useState, useEffect, useRef } from "react";

export default function SnakeGame({ onExit }) {
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
        default: break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-4">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="mb-4 border border-gray-300"
        />
        <button
          onClick={onExit}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
        >
          Exit
        </button>
      </div>
    </div>
  );
}

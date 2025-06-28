import { useEffect, useRef, useState } from "react";

export default function SnakeGame({ onExit }) {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [snake, setSnake] = useState([[5, 5]]);
  const [food, setFood] = useState([10, 10]);
  const [dir, setDir] = useState([1, 0]);
  const dirRef = useRef([1, 0]);
  const [touchStart, setTouchStart] = useState(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [theme, setTheme] = useState("neon");

  const cellSize = 20;
  const HUD_HEIGHT = 140;
  const cols = Math.floor(canvasSize.width / cellSize);
  const rows = Math.floor((canvasSize.height - HUD_HEIGHT) / cellSize);

  const themeStyles = {
    neon: {
      backgroundGrid: (x, y) => (x + y) % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      border: `hsl(${(Date.now() / 10) % 360}, 100%, 60%)`,
      head: `hsl(${(Date.now() / 2) % 360}, 100%, 60%)`,
      body: (i) => `hsl(${(120 + i * 8) % 360}, 70%, 50%)`
    },
    dark: {
      backgroundGrid: () => "rgba(30,30,30,0.3)",
      border: "#555",
      head: "#0ff",
      body: () => "#0aa"
    },
    retro: {
      backgroundGrid: (x, y) => (x + y) % 2 === 0 ? "#444" : "#222",
      border: "#0f0",
      head: "#f00",
      body: () => "#0f0"
    }
  }[theme];

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const [dx, dy] = dirRef.current;
        const newHead = [prev[0][0] + dx, prev[0][1] + dy];
        const newSnake = [newHead, ...prev];

        const hitWall = newHead[0] < 0 || newHead[1] < 0 || newHead[0] >= cols || newHead[1] >= rows;
        const hitSelf = prev.some(([x, y]) => x === newHead[0] && y === newHead[1]);

        if (hitWall || hitSelf) {
          setGameOver(true);
          setRunning(false);
          return prev;
        }

        const foundFood = newHead[0] === food[0] && newHead[1] === food[1];
        if (foundFood) {
          setScore((s) => s + 1);
          setFood([Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)]);
          return newSnake;
        } else {
          return newSnake.slice(0, -1);
        }
      });
    }, 150);

    return () => clearInterval(interval);
  }, [running, gameOver, cols, rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        ctx.fillStyle = themeStyles.backgroundGrid(x, y);
        ctx.fillRect(x * cellSize, y * cellSize + HUD_HEIGHT, cellSize, cellSize);
      }
    }

    ctx.strokeStyle = themeStyles.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, HUD_HEIGHT + 2, cols * cellSize - 4, rows * cellSize - 4);

    snake.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? themeStyles.head : themeStyles.body(i);
      ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
      ctx.shadowBlur = i === 0 ? 12 : 6;
      ctx.beginPath();
      ctx.fillRect(x * cellSize, y * cellSize + HUD_HEIGHT, cellSize, cellSize);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ff5050";
    ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
      food[0] * cellSize + cellSize / 2,
      food[1] * cellSize + HUD_HEIGHT + cellSize / 2,
      6,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food, canvasSize, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!touchStart) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;

      let newDir = dirRef.current;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30 && dir[0] !== -1) newDir = [1, 0];
        else if (dx < -30 && dir[0] !== 1) newDir = [-1, 0];
      } else {
        if (dy > 30 && dir[1] !== -1) newDir = [0, 1];
        else if (dy < -30 && dir[1] !== 1) newDir = [0, -1];
      }

      setDir(newDir);
      dirRef.current = newDir;
      setTouchStart(null);
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [touchStart, dir]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ touchAction: "none" }}
        className="absolute top-0 left-0"
      />

      <div className="absolute top-0 left-0 w-full p-4 text-white text-center z-10 bg-black bg-opacity-80 backdrop-blur-md">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="mb-2 px-3 py-1 rounded text-black"
        />
        <div className="text-lg font-bold mb-2">Score: {score}</div>
        <div className="flex justify-center gap-2">
          {['neon', 'dark', 'retro'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-2 py-1 rounded ${theme === t ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Game Over</h1>
          <p className="mb-4 text-xl">Score: {score}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Exit
          </button>
        </div>
      )}
    </div>
  );
}

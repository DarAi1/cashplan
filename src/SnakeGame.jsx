import { useEffect, useRef, useState } from "react";

export default function SnakeGame({ onExit }) {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [snake, setSnake] = useState([[5, 5]]);
  const [food, setFood] = useState([10, 10]);
  const [dir, setDir] = useState([1, 0]);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState(() => {
    const stored = localStorage.getItem("snake-highscores");
    return stored ? JSON.parse(stored) : [];
  });

  const cellSize = 20;
  const HUD_HEIGHT = 120;
  const cols = Math.floor(canvasSize.width / cellSize);
  const rows = Math.floor((canvasSize.height - HUD_HEIGHT) / cellSize);
  const pulse = Math.sin(Date.now() / 200) * 2 + 4;

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!startX || !startY) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        setDir(dx > 0 ? [1, 0] : [-1, 0]);
      } else {
        setDir(dy > 0 ? [0, 1] : [0, -1]);
      }
      startX = 0;
      startY = 0;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
        ctx.fillRect(x * cellSize, y * cellSize + HUD_HEIGHT, cellSize, cellSize);
      }
    }

    // Border
    ctx.strokeStyle = `hsl(${(Date.now() / 10) % 360}, 100%, 60%)`;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, HUD_HEIGHT, cols * cellSize, rows * cellSize);

    // Snake
    snake.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? `hsl(${(Date.now() / 2) % 360}, 100%, 60%)` : `hsl(${(120 + i * 8) % 360}, 70%, 50%)`;
      ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
      ctx.shadowBlur = i === 0 ? 12 : 6;
      ctx.beginPath();
      ctx.roundRect(
        x * cellSize,
        y * cellSize + HUD_HEIGHT,
        cellSize,
        cellSize,
        6
      );
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Food
    ctx.fillStyle = "#ff5050";
    ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.save();
    ctx.translate(
      food[0] * cellSize + cellSize / 2,
      food[1] * cellSize + HUD_HEIGHT + cellSize / 2
    );
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-pulse / 2, -pulse / 2, pulse, pulse);
    ctx.restore();
    ctx.shadowBlur = 0;
  }, [snake, food, canvasSize]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const [head, ...tail] = prevSnake;
        const newHead = [head[0] + dir[0], head[1] + dir[1]];
        if (
          newHead[0] < 0 || newHead[0] >= cols ||
          newHead[1] < 0 || newHead[1] >= rows ||
          prevSnake.some(([x, y]) => x === newHead[0] && y === newHead[1])
        ) {
          const newEntry = { name: playerName || "Anon", score };
          const updatedScores = [...highScores, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
          setHighScores(updatedScores);
          localStorage.setItem("snake-highscores", JSON.stringify(updatedScores));
          setGameOver(true);
          setRunning(false);
          return [[5, 5]];
        }
        const grow = newHead[0] === food[0] && newHead[1] === food[1];
        if (grow) {
          setFood([
            Math.floor(Math.random() * cols),
            Math.floor(Math.random() * rows),
          ]);
          setScore((prev) => prev + 1);
          return [newHead, ...prevSnake];
        }
        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, 130);
    return () => clearInterval(interval);
  }, [dir, food, running, highScores, score, playerName, cols, rows]);

  const handleRestart = () => {
    setSnake([[5, 5]]);
    setDir([1, 0]);
    setFood([10, 10]);
    setScore(0);
    setRunning(true);
    setGameOver(false);
  };

  const handleResetScores = () => {
    localStorage.removeItem("snake-highscores");
    setHighScores([]);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
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
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-black bg-opacity-80">
          <p className="text-red-400 font-bold text-xl mb-4">Game Over!</p>
          <button
            onClick={handleRestart}
            className="mb-4 px-4 py-2 rounded bg-green-600 hover:bg-green-700"
          >
            Restart
          </button>

          <div className="text-sm text-center">
            <h2 className="font-bold mb-1">Top 10 Scores:</h2>
            <ol className="list-decimal ml-4">
              {highScores.map((s, i) => (
                <li key={i}>{s.name}: {s.score}</li>
              ))}
            </ol>
            <button
              onClick={handleResetScores}
              className="mt-2 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700"
            >
              Reset Scores
            </button>
          </div>

          <button
            onClick={onExit}
            className="mt-6 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Exit
          </button>
        </div>
      )}
    </div>
  );
}

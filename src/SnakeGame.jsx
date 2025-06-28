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
  const [theme, setTheme] = useState("neon");
  const [achievements, setAchievements] = useState(() => {
    const stored = localStorage.getItem("snake-achievements");
    return stored ? JSON.parse(stored) : {};
  });
  const [achievementMessage, setAchievementMessage] = useState("");

  const popSound = useRef(null);
  const thudSound = useRef(null);
  const clickSound = useRef(null);

  useEffect(() => {
    popSound.current = new Audio("/sounds/pop.mp3");
    thudSound.current = new Audio("/sounds/thud.mp3");
    clickSound.current = new Audio("/sounds/click.mp3");
  }, []);

  const playSound = (ref) => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play();
    }
  };

  const cellSize = 20;
  const HUD_HEIGHT = 140;
  const cols = Math.floor(canvasSize.width / cellSize);
  const rows = Math.floor((canvasSize.height - HUD_HEIGHT) / cellSize);
  const pulse = Math.sin(Date.now() / 200) * 2 + 4;

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

  const unlockAchievement = (key, message) => {
    if (!achievements[key]) {
      const updated = { ...achievements, [key]: true };
      setAchievements(updated);
      localStorage.setItem("snake-achievements", JSON.stringify(updated));
      setAchievementMessage(message);
      setTimeout(() => setAchievementMessage(""), 3000);
    }
  };

  useEffect(() => {
    if (!running || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const newHead = [prev[0][0] + dir[0], prev[0][1] + dir[1]];
        const newSnake = [newHead, ...prev];

        const hitWall =
          newHead[0] < 0 || newHead[1] < 0 ||
          newHead[0] >= cols || newHead[1] >= rows;

        const hitSelf = prev.some(
          ([x, y]) => x === newHead[0] && y === newHead[1]
        );

        if (hitWall || hitSelf) {
          playSound(thudSound);
          setGameOver(true);

          if (score >= 20) unlockAchievement("crashedWithHonor", "💥 Zderzenie z rzeczywistością!");

          const newEntry = { name: playerName || "Anon", score };
          const updatedScores = [...highScores, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
          setHighScores(updatedScores);
          localStorage.setItem("snake-highscores", JSON.stringify(updatedScores));

          setRunning(false);
          return prev;
        }

        const foundFood = newHead[0] === food[0] && newHead[1] === food[1];
        if (foundFood) {
          playSound(popSound);
          const newScore = score + 1;
          setScore(newScore);
          if (newScore >= 1) unlockAchievement("firstPoint", "🎉 Pierwszy punkt!");
          if (newScore >= 10) unlockAchievement("tenPoints", "💪 Masz już 10 punktów!");
          if (newScore >= 25) unlockAchievement("twentyFive", "🐍 Głodny punktów!");
          if (newScore >= 50) unlockAchievement("fiftyPoints", "🔥 Nie do zatrzymania!");

          setFood([
            Math.floor(Math.random() * cols),
            Math.floor(Math.random() * rows),
          ]);
          return newSnake;
        } else {
          return newSnake.slice(0, -1);
        }
      });
    }, 150);

    return () => clearInterval(interval);
  }, [dir, running, food, gameOver, score]);

  useEffect(() => {
    if (!achievements.changedTheme && theme !== "neon") {
      unlockAchievement("changedTheme", "🎨 Stylówka zmieniona!");
    }
  }, [theme]);

  // ... pozostała część bez zmian ...

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
        <div className="flex justify-center gap-2">
          {['neon', 'dark', 'retro'].map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`px-2 py-1 rounded ${theme === t ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {achievementMessage && <div className="mt-2 text-green-300 font-semibold animate-pulse">{achievementMessage}</div>}
      </div>

      {/* ... pozostała część bez zmian ... */}
    </div>
  );
}

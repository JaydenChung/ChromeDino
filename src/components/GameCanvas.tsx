import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface GameCanvasProps {
  isAIMode?: boolean;
  onScreenCapture?: (imageData: ImageData) => void;
  onScoreChange?: (score: number) => void;
  isGameRunning?: boolean;
  onGameStateChange?: (isRunning: boolean) => void;
}

const GameCanvas = ({
  isAIMode = false,
  onScreenCapture = () => {},
  onScoreChange = () => {},
  isGameRunning = false,
  onGameStateChange = () => {},
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Mock dinosaur game state
  const [dinosaurPosition, setDinosaurPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 100, y: 200 });
  const [obstacles, setObstacles] = useState<
    Array<{ x: number; y: number; type: "cactus" | "bird" }>
  >([]);

  // Handle game controls
  const startGame = () => {
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    onGameStateChange(true);
  };

  const pauseGame = () => {
    onGameStateChange(false);
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    onGameStateChange(false);
  };

  // Simulate game loop
  useEffect(() => {
    if (!isGameRunning) return;

    const gameLoop = setInterval(() => {
      // Increment score
      setScore((prevScore) => {
        const newScore = prevScore + 1;
        onScoreChange(newScore);
        return newScore;
      });

      // Randomly generate obstacles
      if (Math.random() < 0.05) {
        const newObstacle = {
          x: 800,
          y: Math.random() < 0.7 ? 200 : 150, // Ground level or air level
          type: Math.random() < 0.7 ? ("cactus" as const) : ("bird" as const),
        };

        setObstacles((prev) => [...prev, newObstacle]);
      }

      // Move obstacles
      setObstacles((prev) => {
        const updated = prev
          .map((obstacle) => ({
            ...obstacle,
            x: obstacle.x - 10,
          }))
          .filter((obstacle) => obstacle.x > -50);

        return updated;
      });

      // Capture screen for AI processing
      if (isAIMode && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          const imageData = context.getImageData(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
          onScreenCapture(imageData);
        }
      }

      // Check for collisions (simplified)
      const hasCollision = obstacles.some(
        (obstacle) =>
          Math.abs(obstacle.x - dinosaurPosition.x) < 30 &&
          Math.abs(obstacle.y - dinosaurPosition.y) < 30,
      );

      if (hasCollision) {
        setGameOver(true);
        onGameStateChange(false);
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [
    isGameRunning,
    isAIMode,
    dinosaurPosition,
    obstacles,
    onScreenCapture,
    onScoreChange,
    onGameStateChange,
  ]);

  // Draw game elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    context.beginPath();
    context.moveTo(0, 230);
    context.lineTo(canvas.width, 230);
    context.strokeStyle = "#333";
    context.stroke();

    // Draw dinosaur
    context.fillStyle = "#555";
    context.fillRect(dinosaurPosition.x, dinosaurPosition.y, 30, 30);

    // Draw obstacles
    obstacles.forEach((obstacle) => {
      if (obstacle.type === "cactus") {
        context.fillStyle = "#0a7";
        context.fillRect(obstacle.x, obstacle.y, 20, 30);
      } else {
        context.fillStyle = "#55f";
        context.fillRect(obstacle.x, obstacle.y, 30, 15);
      }
    });

    // Draw score
    context.fillStyle = "#000";
    context.font = "16px Arial";
    context.fillText(`Score: ${score}`, 650, 30);

    // Draw game over message
    if (gameOver) {
      context.fillStyle = "rgba(0, 0, 0, 0.5)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#fff";
      context.font = "32px Arial";
      context.textAlign = "center";
      context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      context.font = "18px Arial";
      context.fillText(
        "Press Reset to play again",
        canvas.width / 2,
        canvas.height / 2 + 40,
      );
    }
  }, [dinosaurPosition, obstacles, score, gameOver]);

  // Handle jump action
  const handleJump = () => {
    if (!isGameRunning || gameOver) return;

    // Simple jump animation
    setDinosaurPosition((prev) => ({ ...prev, y: 150 }));
    setTimeout(() => {
      setDinosaurPosition((prev) => ({ ...prev, y: 200 }));
    }, 500);
  };

  // Handle duck action
  const handleDuck = () => {
    if (!isGameRunning || gameOver) return;

    // Simple duck animation
    setDinosaurPosition((prev) => ({ ...prev, y: 210 }));
    setTimeout(() => {
      setDinosaurPosition((prev) => ({ ...prev, y: 200 }));
    }, 500);
  };

  // AI control for jumping
  useEffect(() => {
    if (!isAIMode || !isGameRunning || gameOver) return;

    const aiControl = setInterval(() => {
      // Find the closest obstacle
      const closestObstacle = obstacles.reduce(
        (closest, current) => {
          return current.x < closest.x && current.x > dinosaurPosition.x
            ? current
            : closest;
        },
        { x: Infinity, y: 0, type: "cactus" as const },
      );

      // If there's an obstacle and it's close enough, take action
      if (
        closestObstacle.x !== Infinity &&
        closestObstacle.x - dinosaurPosition.x < 200
      ) {
        if (closestObstacle.type === "cactus") {
          handleJump();
        } else if (closestObstacle.type === "bird" && closestObstacle.y < 180) {
          handleDuck();
        }
      }
    }, 100);

    return () => clearInterval(aiControl);
  }, [isAIMode, isGameRunning, gameOver, obstacles, dinosaurPosition]);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md w-full h-full">
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="border-2 border-gray-300 rounded-md bg-gray-50"
          onClick={handleJump}
          onContextMenu={(e) => {
            e.preventDefault();
            handleDuck();
          }}
        />

        {!isAIMode && (
          <div className="absolute bottom-4 left-4 space-x-2">
            <div className="bg-black/10 p-2 rounded-md text-sm">
              <p>Click to Jump</p>
              <p>Right-click to Duck</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4 mt-4">
        {!isGameRunning ? (
          <Button onClick={startGame} variant="default">
            <Play className="mr-2 h-4 w-4" />
            Start Game
          </Button>
        ) : (
          <Button onClick={pauseGame} variant="outline">
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        )}

        <Button onClick={resetGame} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default GameCanvas;

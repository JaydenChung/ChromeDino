import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import AIVisualization from "./AIVisualization";

interface GameContainerProps {
  isAIMode?: boolean;
  onModeChange?: (isAIMode: boolean) => void;
}

const GameContainer = ({
  isAIMode = true,
  onModeChange = () => {},
}: GameContainerProps) => {
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [screenData, setScreenData] = useState<ImageData | null>(null);
  const [aiDecision, setAiDecision] = useState<{
    action: "jump" | "duck" | "none";
    confidence: number;
    timing: number;
  }>({ action: "none", confidence: 0.8, timing: 0 });

  const [detectedObstacles, setDetectedObstacles] = useState<
    Array<{
      type: "cactus" | "bird";
      distance: number;
      height: number;
      confidence: number;
    }>
  >([]);

  // Handle screen capture from game canvas for AI processing
  const handleScreenCapture = (imageData: ImageData) => {
    setScreenData(imageData);

    // Simulate AI obstacle detection
    if (Math.random() < 0.1) {
      const newObstacle = {
        type: Math.random() > 0.5 ? ("cactus" as const) : ("bird" as const),
        distance: 200 + Math.random() * 300,
        height: 30 + Math.random() * 50,
        confidence: 0.7 + Math.random() * 0.25,
      };

      setDetectedObstacles((prev) => {
        // Filter out obstacles that are too close (simulating they've passed)
        const filtered = prev.filter((obs) => obs.distance > 20);
        // Move obstacles closer
        const updated = filtered.map((obs) => ({
          ...obs,
          distance: obs.distance - 10,
          confidence: Math.min(0.98, obs.confidence + 0.01),
        }));
        // Add new obstacle if detected
        return [...updated, newObstacle];
      });
    } else {
      // Just update existing obstacles
      setDetectedObstacles((prev) => {
        const filtered = prev.filter((obs) => obs.distance > 20);
        return filtered.map((obs) => ({
          ...obs,
          distance: obs.distance - 10,
          confidence: Math.min(0.98, obs.confidence + 0.01),
        }));
      });
    }
  };

  // Process AI decisions based on detected obstacles
  useEffect(() => {
    if (!isAIMode || !gameRunning || detectedObstacles.length === 0) {
      setAiDecision({ action: "none", confidence: 0.8, timing: 0 });
      return;
    }

    // Find the closest obstacle
    const closestObstacle = detectedObstacles.reduce((closest, current) =>
      current.distance < closest.distance ? current : closest,
    );

    // Determine action based on obstacle type and distance
    if (closestObstacle.distance < 100) {
      const action = closestObstacle.type === "cactus" ? "jump" : "duck";
      const confidence =
        closestObstacle.confidence * (0.9 + Math.random() * 0.1);
      const timing = closestObstacle.distance / 100; // Simplified timing calculation

      setAiDecision({ action, confidence, timing });
    } else {
      setAiDecision({
        action: "none",
        confidence: 0.8,
        timing: closestObstacle.distance / 100,
      });
    }
  }, [isAIMode, gameRunning, detectedObstacles]);

  // Handle game state changes
  const handleGameStateChange = (isRunning: boolean) => {
    setGameRunning(isRunning);
    if (!isRunning) {
      setDetectedObstacles([]);
    }
  };

  // Handle score changes
  const handleScoreChange = (score: number) => {
    setCurrentScore(score);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">Game Area</h2>

      <div className="flex flex-col gap-4">
        {/* Game Canvas */}
        <GameCanvas
          isAIMode={isAIMode}
          onScreenCapture={handleScreenCapture}
          onScoreChange={handleScoreChange}
          isGameRunning={gameRunning}
          onGameStateChange={handleGameStateChange}
        />

        {/* AI Visualization */}
        <AIVisualization
          gameData={{
            obstacles: detectedObstacles,
            decision: aiDecision,
            isActive: isAIMode && gameRunning,
          }}
        />
      </div>

      {/* Game status indicator */}
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${gameRunning ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm font-medium">
            {gameRunning ? "Game Running" : "Game Stopped"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Mode:</span>
          <span
            className={`text-sm font-bold ${isAIMode ? "text-blue-600" : "text-green-600"}`}
          >
            {isAIMode ? "AI Control" : "Manual Control"}
          </span>
        </div>

        <div className="text-sm">
          <span className="font-medium">Current Score:</span> {currentScore}
        </div>
      </div>
    </div>
  );
};

export default GameContainer;

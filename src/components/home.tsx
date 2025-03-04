import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import GameContainer from "./GameContainer";
import ControlPanel from "./ControlPanel";
import StatisticsPanel from "./StatisticsPanel";
import ChromeDinoController from "./ChromeDinoController";

const Home = () => {
  const [gameMode, setGameMode] = useState<"ai" | "manual">("ai");
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(1500);
  const [gameSpeed, setGameSpeed] = useState<number>(10);

  // AI metrics state
  const [aiConfidence, setAiConfidence] = useState<number>(85);
  const [aiReactionTime, setAiReactionTime] = useState<number>(120);
  const [aiDetectionAccuracy, setAiDetectionAccuracy] = useState<number>(92);

  // Handle mode change
  const handleModeChange = (mode: "ai" | "manual") => {
    if (isGameRunning) return; // Don't allow mode change while game is running
    setGameMode(mode);
  };

  // Handle game state change
  const handleGameStateChange = (running: boolean) => {
    setIsGameRunning(running);
    if (!running) {
      // Update high score if current score is higher
      if (currentScore > highScore) {
        setHighScore(currentScore);
      }
      // Reset current score
      setCurrentScore(0);
    }
  };

  // Handle score update
  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score);

    // Update game speed based on score (increases difficulty)
    const newSpeed = Math.min(30, 10 + Math.floor(score / 500));
    setGameSpeed(newSpeed);

    // Update AI metrics based on score and game progress
    if (gameMode === "ai") {
      // Simulate AI improving as the game progresses
      const newConfidence = Math.min(98, 85 + Math.floor(score / 300));
      const newReactionTime = Math.max(50, 120 - Math.floor(score / 200));
      const newAccuracy = Math.min(99, 92 + Math.floor(score / 400));

      setAiConfidence(newConfidence);
      setAiReactionTime(newReactionTime);
      setAiDetectionAccuracy(newAccuracy);
    }
  };

  // Reset game
  const handleResetGame = () => {
    setIsGameRunning(false);
    setCurrentScore(0);
    setGameSpeed(10);
    setAiConfidence(85);
    setAiReactionTime(120);
    setAiDetectionAccuracy(92);
  };

  // Settings and help handlers (placeholders)
  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };

  const handleHelpClick = () => {
    console.log("Help clicked");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">
            AI-Powered Google Dinosaur Game
          </h1>
          <p className="text-slate-600 mt-2">
            Watch the AI play the game automatically or take control yourself in
            manual mode.
          </p>
        </header>

        <Tabs defaultValue="chrome-dino" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="chrome-dino">Chrome Dino Game</TabsTrigger>
            <TabsTrigger value="demo-game">Demo Game</TabsTrigger>
          </TabsList>

          <TabsContent value="chrome-dino" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              {/* Chrome Dino Controller */}
              <ChromeDinoController
                isAIMode={gameMode === "ai"}
                onModeChange={(isAI) => setGameMode(isAI ? "ai" : "manual")}
              />

              {/* Control Panel */}
              <ControlPanel
                gameMode={gameMode}
                onModeChange={handleModeChange}
                isGameRunning={isGameRunning}
                onSettingsClick={handleSettingsClick}
                onResetGame={handleResetGame}
                onHelpClick={handleHelpClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="demo-game" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              {/* Game Container */}
              <GameContainer
                isAIMode={gameMode === "ai"}
                onModeChange={(isAI) => setGameMode(isAI ? "ai" : "manual")}
              />

              {/* Control Panel */}
              <ControlPanel
                gameMode={gameMode}
                onModeChange={handleModeChange}
                isGameRunning={isGameRunning}
                onSettingsClick={handleSettingsClick}
                onResetGame={handleResetGame}
                onHelpClick={handleHelpClick}
              />

              {/* Statistics Panel */}
              <StatisticsPanel
                currentScore={currentScore}
                highScore={highScore}
                gameSpeed={gameSpeed}
                isGameActive={isGameRunning}
                aiConfidence={aiConfidence}
                aiReactionTime={aiReactionTime}
                aiDetectionAccuracy={aiDetectionAccuracy}
              />
            </div>
          </TabsContent>
        </Tabs>

        <footer className="text-center text-sm text-slate-500 mt-8 pb-4">
          <p>
            © 2023 AI Dinosaur Game | Press Space to Jump | Press Down Arrow to
            Duck
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;

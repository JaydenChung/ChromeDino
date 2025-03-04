import React from "react";
import ScoreDisplay from "./ScoreDisplay";
import AIMetrics from "./AIMetrics";

interface StatisticsPanelProps {
  currentScore?: number;
  highScore?: number;
  gameSpeed?: number;
  isGameActive?: boolean;
  aiConfidence?: number;
  aiReactionTime?: number;
  aiDetectionAccuracy?: number;
}

const StatisticsPanel = ({
  currentScore = 0,
  highScore = 1500,
  gameSpeed = 10,
  isGameActive = true,
  aiConfidence = 85,
  aiReactionTime = 120,
  aiDetectionAccuracy = 92,
}: StatisticsPanelProps) => {
  return (
    <div className="w-full bg-slate-50 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">
        Game Statistics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Display Section */}
        <div className="w-full">
          <ScoreDisplay
            currentScore={currentScore}
            highScore={highScore}
            gameSpeed={gameSpeed}
            isGameActive={isGameActive}
          />
        </div>

        {/* AI Metrics Section */}
        <div className="w-full">
          <AIMetrics
            confidence={aiConfidence}
            reactionTime={aiReactionTime}
            detectionAccuracy={aiDetectionAccuracy}
          />
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;

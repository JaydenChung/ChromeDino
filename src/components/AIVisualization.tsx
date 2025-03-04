import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, Check, X } from "lucide-react";

interface AIVisualizationProps {
  gameData?: {
    obstacles: Array<{
      type: "cactus" | "bird";
      distance: number;
      height: number;
      confidence: number;
    }>;
    decision?: {
      action: "jump" | "duck" | "none";
      confidence: number;
      timing: number;
    };
    isActive: boolean;
  };
}

const AIVisualization = ({
  gameData = {
    obstacles: [
      { type: "cactus", distance: 120, height: 40, confidence: 0.95 },
      { type: "bird", distance: 300, height: 80, confidence: 0.87 },
    ],
    decision: {
      action: "jump",
      confidence: 0.92,
      timing: 0.3,
    },
    isActive: true,
  },
}: AIVisualizationProps) => {
  const [visualizationData, setVisualizationData] = useState(gameData);

  // Update visualization data when game data changes
  useEffect(() => {
    setVisualizationData(gameData);
  }, [gameData]);

  // Simulate real-time updates for the visualization only if no obstacles are detected
  useEffect(() => {
    if (!gameData.isActive || gameData.obstacles.length > 0) return;

    const interval = setInterval(() => {
      setVisualizationData((prev) => ({
        ...prev,
        obstacles: prev.obstacles
          .map((obstacle) => ({
            ...obstacle,
            distance: Math.max(0, obstacle.distance - 10),
            confidence: Math.min(
              0.98,
              obstacle.confidence + Math.random() * 0.02,
            ),
          }))
          .filter((obs) => obs.distance > 0),
        decision: prev.decision
          ? {
              ...prev.decision,
              confidence: Math.min(
                0.98,
                Math.max(
                  0.75,
                  prev.decision.confidence + (Math.random() * 0.1 - 0.05),
                ),
              ),
              timing: Math.max(0, prev.decision.timing - 0.05),
            }
          : undefined,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameData.isActive, gameData.obstacles.length]);

  return (
    <Card className="w-full h-[200px] bg-slate-900 p-4 overflow-hidden relative">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">AI Vision</h3>
        <Badge
          variant={visualizationData.isActive ? "success" : "destructive"}
          className="px-2 py-1"
        >
          {visualizationData.isActive ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      </div>

      {/* Visualization Canvas */}
      <div className="relative h-[120px] bg-slate-800 rounded-md overflow-hidden">
        {/* Ground line */}
        <div className="absolute bottom-[30px] w-full h-[2px] bg-slate-600"></div>

        {/* Dinosaur representation */}
        <div className="absolute bottom-[32px] left-[50px] w-[20px] h-[40px] bg-green-500 rounded-sm"></div>

        {/* Obstacles */}
        {visualizationData.obstacles.map((obstacle, index) => (
          <div
            key={index}
            className={`absolute ${obstacle.type === "bird" ? "bottom-[60px]" : "bottom-[32px]"} 
                      ${obstacle.type === "cactus" ? "bg-red-500" : "bg-yellow-500"} rounded-sm`}
            style={{
              left: `${50 + obstacle.distance}px`,
              width: "15px",
              height: `${obstacle.type === "cactus" ? "30px" : "15px"}`,
              opacity: Math.min(1, obstacle.confidence + 0.3),
            }}
          >
            {/* Confidence indicator */}
            <div className="absolute -top-5 left-0 w-full text-center">
              <span className="text-xs text-white bg-slate-700 px-1 rounded">
                {Math.round(obstacle.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}

        {/* Decision visualization */}
        {visualizationData.decision && (
          <div className="absolute bottom-[32px] left-[80px] flex items-center">
            <div
              className={`h-[30px] w-[2px] ${visualizationData.decision.action !== "none" ? "bg-blue-500" : "bg-gray-500"}`}
            ></div>
            <div className="ml-1 bg-blue-900 rounded px-1 text-xs text-white">
              {visualizationData.decision.action.toUpperCase()}(
              {Math.round(visualizationData.decision.confidence * 100)}%)
            </div>
          </div>
        )}
      </div>

      {/* Decision metrics */}
      <div className="mt-2 flex justify-between items-center text-xs text-white">
        <div className="flex items-center">
          <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
          <span>Obstacles detected: {visualizationData.obstacles.length}</span>
        </div>
        {visualizationData.decision && (
          <div>
            <span className="text-blue-400">
              Next action in: {visualizationData.decision.timing.toFixed(2)}s
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIVisualization;

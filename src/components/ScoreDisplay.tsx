import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Trophy, TrendingUp } from "lucide-react";

interface ScoreDisplayProps {
  currentScore?: number;
  highScore?: number;
  gameSpeed?: number;
  isGameActive?: boolean;
}

const ScoreDisplay = ({
  currentScore = 0,
  highScore = 1500,
  gameSpeed = 10,
  isGameActive = true,
}: ScoreDisplayProps) => {
  const [animatedScore, setAnimatedScore] = useState(currentScore);
  const [speedPercentage, setSpeedPercentage] = useState(0);

  // Animate score changes
  useEffect(() => {
    if (currentScore !== animatedScore) {
      const interval = setInterval(() => {
        setAnimatedScore((prev) => {
          if (prev < currentScore) {
            return prev + Math.ceil((currentScore - prev) / 10);
          }
          return currentScore;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [currentScore, animatedScore]);

  // Update speed percentage based on game speed
  useEffect(() => {
    // Assuming max speed is 30
    const maxSpeed = 30;
    setSpeedPercentage((gameSpeed / maxSpeed) * 100);
  }, [gameSpeed]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full bg-background">
      {/* Current Score Card */}
      <Card className="flex-1 bg-card border-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Current Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-primary">
              {animatedScore.toLocaleString()}
            </span>
            {isGameActive && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Speed</span>
                  <span>{gameSpeed}x</span>
                </div>
                <Progress value={speedPercentage} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* High Score Card */}
      <Card className="flex-1 bg-card border-2 border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            High Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-amber-500">
              {highScore.toLocaleString()}
            </span>
            {currentScore > 0 && currentScore < highScore && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress to High Score</span>
                  <span>{Math.round((currentScore / highScore) * 100)}%</span>
                </div>
                <Progress
                  value={(currentScore / highScore) * 100}
                  className="h-2 bg-amber-500/20"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreDisplay;

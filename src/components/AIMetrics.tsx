import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Info } from "lucide-react";

interface AIMetricsProps {
  confidence?: number;
  reactionTime?: number;
  detectionAccuracy?: number;
}

const AIMetrics = ({
  confidence = 85,
  reactionTime = 120,
  detectionAccuracy = 92,
}: AIMetricsProps) => {
  return (
    <Card className="w-full h-full bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          AI Performance Metrics
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Real-time AI performance statistics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Decision Confidence</span>
              <span className="text-sm font-medium">{confidence}%</span>
            </div>
            <Progress value={confidence} className="h-2" />
            <p className="text-xs text-muted-foreground">
              How confident the AI is in its decisions
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Reaction Time</span>
              <span className="text-sm font-medium">{reactionTime}ms</span>
            </div>
            <Progress value={100 - reactionTime / 2} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Time to process and react to obstacles
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Detection Accuracy</span>
              <span className="text-sm font-medium">{detectionAccuracy}%</span>
            </div>
            <Progress value={detectionAccuracy} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Accuracy in identifying obstacles correctly
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMetrics;

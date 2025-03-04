import React, { useState } from "react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Play, Pause, Brain, User } from "lucide-react";

interface ModeSelectorProps {
  mode?: "ai" | "manual";
  onModeChange?: (mode: "ai" | "manual") => void;
  disabled?: boolean;
}

const ModeSelector = ({
  mode = "ai",
  onModeChange = () => {},
  disabled = false,
}: ModeSelectorProps) => {
  const [currentMode, setCurrentMode] = useState<"ai" | "manual">(mode);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? "ai" : "manual";
    setCurrentMode(newMode);
    onModeChange(newMode);
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-[300px]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentMode === "ai" ? (
              <Brain className="h-5 w-5 text-blue-500" />
            ) : (
              <User className="h-5 w-5 text-green-500" />
            )}
            <span className="font-medium">
              {currentMode === "ai" ? "AI Mode" : "Manual Mode"}
            </span>
          </div>
          <Switch
            checked={currentMode === "ai"}
            onCheckedChange={handleModeChange}
            disabled={disabled}
            aria-label="Toggle between AI and Manual mode"
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">
            {currentMode === "ai"
              ? "AI will play automatically"
              : "You control the dinosaur"}
          </span>
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            onClick={toggleRunning}
            disabled={disabled}
            className="flex items-center gap-1"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Start</span>
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {currentMode === "ai"
            ? "Press Space to toggle AI control"
            : "Use Space to jump, Down arrow to duck"}
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;

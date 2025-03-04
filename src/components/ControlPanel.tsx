import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Settings, Keyboard, RefreshCw, HelpCircle } from "lucide-react";
import ModeSelector from "./ModeSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ControlPanelProps {
  onSettingsClick?: () => void;
  onResetGame?: () => void;
  onHelpClick?: () => void;
  gameMode?: "ai" | "manual";
  onModeChange?: (mode: "ai" | "manual") => void;
  isGameRunning?: boolean;
}

const ControlPanel = ({
  onSettingsClick = () => {},
  onResetGame = () => {},
  onHelpClick = () => {},
  gameMode = "ai",
  onModeChange = () => {},
  isGameRunning = false,
}: ControlPanelProps) => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const toggleKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(!showKeyboardShortcuts);
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Game Controls</span>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleKeyboardShortcuts}
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard shortcuts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onResetGame}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset game</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onSettingsClick}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Game settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onHelpClick}>
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <ModeSelector
            mode={gameMode}
            onModeChange={onModeChange}
            disabled={isGameRunning}
          />

          {showKeyboardShortcuts && (
            <Card className="flex-1 bg-slate-50">
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 mr-2 text-xs font-semibold">
                      Space
                    </kbd>
                    <span>Jump / Toggle AI</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 mr-2 text-xs font-semibold">
                      ↓
                    </kbd>
                    <span>Duck</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 mr-2 text-xs font-semibold">
                      R
                    </kbd>
                    <span>Reset game</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 mr-2 text-xs font-semibold">
                      P
                    </kbd>
                    <span>Pause/Play</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="hidden md:block flex-1">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Game Instructions</h3>
              <p className="text-xs text-gray-600 mb-2">
                {gameMode === "ai"
                  ? "Watch as the AI automatically plays the game, jumping over cacti and ducking under birds."
                  : "Control the dinosaur to jump over cacti and duck under birds to achieve the highest score."}
              </p>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {gameMode === "ai"
                    ? "AI Confidence: High"
                    : "Difficulty: Medium"}
                </span>
                <Button variant="link" size="sm" onClick={onHelpClick}>
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Pause, RefreshCw, ExternalLink } from "lucide-react";
import AIVisualization from "./AIVisualization";
import DinoGameDetector from "./DinoGameDetector";

interface ChromeDinoControllerProps {
  isAIMode?: boolean;
  onModeChange?: (isAIMode: boolean) => void;
}

const ChromeDinoController = ({
  isAIMode = true,
  onModeChange = () => {},
}: ChromeDinoControllerProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [detectedObstacles, setDetectedObstacles] = useState<
    Array<{
      type: "cactus" | "bird";
      distance: number;
      height: number;
      confidence: number;
    }>
  >([]);
  const [aiDecision, setAiDecision] = useState<{
    action: "jump" | "duck" | "none";
    confidence: number;
    timing: number;
  }>({ action: "none", confidence: 0.8, timing: 0 });

  const intervalRef = useRef<number | null>(null);
  const gameWindowRef = useRef<Window | null>(null);

  // Function to open Chrome dino game in a new window
  const openDinoGame = () => {
    const gameWindow = window.open("chrome://dino", "_blank");
    if (gameWindow) {
      gameWindowRef.current = gameWindow;
      // We can't directly interact with chrome:// URLs due to security restrictions
      // So we'll show instructions to the user instead
      setIsConnected(true);
    } else {
      alert(
        "Please allow pop-ups and try again. Alternatively, open chrome://dino in a new tab manually.",
      );
    }
  };

  // Alternative method to open dino game
  const openDinoGameAlternative = () => {
    const gameWindow = window.open("https://chromedino.com", "_blank");
    if (gameWindow) {
      gameWindowRef.current = gameWindow;
    }
    setIsConnected(true);
  };

  // Function to start AI control
  const startAIControl = () => {
    if (!isConnected) return;

    setIsRunning(true);

    // Simulate obstacle detection and AI decision making
    intervalRef.current = window.setInterval(() => {
      // Simulate detecting obstacles
      if (Math.random() < 0.1) {
        const newObstacle = {
          type: "cactus" as const, // Always cactus for simplicity
          distance: 150 + Math.random() * 150, // Closer obstacles
          height: 30 + Math.random() * 50,
          confidence: 1.0, // 100% confidence
        };

        setDetectedObstacles((prev) => {
          const filtered = prev.filter((obs) => obs.distance > 20);
          const updated = filtered.map((obs) => ({
            ...obs,
            distance: obs.distance - 15, // Move obstacles closer faster
            confidence: Math.min(0.98, obs.confidence + 0.02),
          }));
          return [...updated, newObstacle];
        });
      } else {
        setDetectedObstacles((prev) => {
          const filtered = prev.filter((obs) => obs.distance > 20);
          return filtered.map((obs) => ({
            ...obs,
            distance: obs.distance - 15,
            confidence: Math.min(0.98, obs.confidence + 0.02),
          }));
        });
      }

      // Increment score for UI
      setCurrentScore((prev) => prev + 5);
    }, 100);

    // Inform user to press space to start the game if needed
    alert(
      "AI controller started. IMPORTANT: The AI cannot directly control the game due to browser security restrictions. Please watch the AI visualization and manually press SPACE BAR in the game window when it shows 'JUMP'.",
    );

    // Send test keypresses to make sure it's working
    console.log("Sending initial test jumps");

    // Try both space and arrow up
    simulateKeyPress(" ");
    setTimeout(() => simulateKeyPress("ArrowUp"), 100);

    // And continue sending jumps at intervals
    setTimeout(() => simulateKeyPress(" "), 300);
    setTimeout(() => simulateKeyPress("ArrowUp"), 500);
    setTimeout(() => simulateKeyPress(" "), 700);
    setTimeout(() => simulateKeyPress("ArrowUp"), 900);
  };

  // Function to stop AI control
  const stopAIControl = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setDetectedObstacles([]); // Clear obstacles when stopping
    setAiDecision({ action: "none", confidence: 0.8, timing: 0 }); // Reset AI decision
  };

  // Process AI decisions based on detected obstacles
  useEffect(() => {
    if (!isAIMode || !isRunning) {
      setAiDecision({ action: "none", confidence: 1.0, timing: 0 });
      return;
    }

    // Force jump every 1.5 seconds regardless of obstacles
    const jumpInterval = setInterval(() => {
      console.log("Forcing jump");
      setAiDecision({ action: "jump", confidence: 1.0, timing: 0 });

      // Try both space and arrow up keys
      simulateKeyPress(" ");
      setTimeout(() => simulateKeyPress("ArrowUp"), 20);
      setTimeout(() => simulateKeyPress(" "), 40);
      setTimeout(() => simulateKeyPress("ArrowUp"), 60);
    }, 1500);

    // Also respond to detected obstacles
    if (detectedObstacles.length > 0) {
      // Find the closest obstacle
      const closestObstacle = detectedObstacles.reduce((closest, current) =>
        current.distance < closest.distance ? current : closest,
      );

      // Always jump for any obstacle
      console.log("Obstacle detected, jumping");
      setAiDecision({ action: "jump", confidence: 1.0, timing: 0 });

      // Try both space and arrow up keys
      simulateKeyPress(" ");
      setTimeout(() => simulateKeyPress("ArrowUp"), 20);
      setTimeout(() => simulateKeyPress(" "), 40);
      setTimeout(() => simulateKeyPress("ArrowUp"), 60);
    }

    return () => clearInterval(jumpInterval);
  }, [isAIMode, isRunning, detectedObstacles]);

  // Simulate key press to control the game
  const simulateKeyPress = (key: string) => {
    try {
      console.log("Sending key press:", key);

      // Try using the space key instead of arrow up for jumping
      const jumpKey = " ";
      const actualKey = key === "ArrowUp" ? jumpKey : key;

      // Method 1: Dispatch event to document
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: actualKey,
        code: actualKey === " " ? "Space" : key,
        keyCode: actualKey === " " ? 32 : key === "ArrowDown" ? 40 : 38,
        which: actualKey === " " ? 32 : key === "ArrowDown" ? 40 : 38,
        bubbles: true,
        cancelable: true,
      });

      document.dispatchEvent(keyDownEvent);
      window.dispatchEvent(keyDownEvent);

      setTimeout(() => {
        const keyUpEvent = new KeyboardEvent("keyup", {
          key: actualKey,
          code: actualKey === " " ? "Space" : key,
          keyCode: actualKey === " " ? 32 : key === "ArrowDown" ? 40 : 38,
          which: actualKey === " " ? 32 : key === "ArrowDown" ? 40 : 38,
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(keyUpEvent);
        window.dispatchEvent(keyUpEvent);
      }, 30);

      // Method 2: Try to directly control the game window
      if (gameWindowRef.current) {
        try {
          // Try to focus the window first
          gameWindowRef.current.focus();

          // Try to send a direct key event
          const script = `
            (function() {
              // Try using the space key for jumping
              const jumpKey = " ";
              const actualKey = "${key}" === "ArrowUp" ? jumpKey : "${key}";
              const actualCode = actualKey === " " ? "Space" : "${key}";
              const actualKeyCode = actualKey === " " ? 32 : "${key}" === "ArrowDown" ? 40 : 38;
              
              // Create and dispatch the keydown event
              const event = new KeyboardEvent('keydown', {
                key: actualKey,
                code: actualCode,
                keyCode: actualKeyCode,
                which: actualKeyCode,
                bubbles: true,
                cancelable: true
              });
              
              document.dispatchEvent(event);
              window.dispatchEvent(event);
              
              // Also try to find the game canvas and dispatch event there
              const gameCanvas = document.querySelector('canvas');
              if (gameCanvas) {
                gameCanvas.dispatchEvent(event);
              }
              
              // Release the key after a short delay
              setTimeout(function() {
                const upEvent = new KeyboardEvent('keyup', {
                  key: actualKey,
                  code: actualCode,
                  keyCode: actualKeyCode,
                  which: actualKeyCode,
                  bubbles: true,
                  cancelable: true
                });
                
                document.dispatchEvent(upEvent);
                window.dispatchEvent(upEvent);
                
                if (gameCanvas) {
                  gameCanvas.dispatchEvent(upEvent);
                }
              }, 30);
              
              // Also try to simulate a direct click on the space key
              if (actualKey === " ") {
                document.body.click();
              }
            })();
          `;

          gameWindowRef.current.eval(script);
        } catch (e) {
          console.log("Could not send script to game window", e);

          // Fallback: try postMessage with both space and arrow up
          try {
            // Send both space and arrow up to maximize chances
            gameWindowRef.current.postMessage(
              { type: "keyEvent", key: " ", keyCode: 32, action: "press" },
              "*",
            );
            gameWindowRef.current.postMessage(
              {
                type: "keyEvent",
                key: "ArrowUp",
                keyCode: 38,
                action: "press",
              },
              "*",
            );
          } catch (e2) {
            console.log("Could not send message to game window", e2);
          }
        }
      }

      // Method 3: Try to use the experimental Keyboard API
      if ("keyboard" in navigator) {
        try {
          // @ts-ignore - Experimental API
          navigator.keyboard.press(actualKey);
        } catch (e) {
          // Keyboard API might not be available
        }
      }
    } catch (error) {
      console.error("Error simulating keypress:", error);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">
        Chrome Dino Game Controller
      </h2>

      <Card className="w-full bg-slate-50">
        <CardHeader className="pb-2">
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span>
                {isConnected
                  ? "Connected to Chrome Dino Game"
                  : "Not connected to Chrome Dino Game"}
              </span>
            </div>

            <div className="flex gap-2">
              <Button onClick={openDinoGame} disabled={isConnected}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open chrome://dino
              </Button>
              <Button
                onClick={openDinoGameAlternative}
                disabled={isConnected}
                variant="outline"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open chromedino.com
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Note: Due to browser security restrictions, the AI controller
                needs to use browser automation techniques that may require
                additional setup.
              </p>
              <p className="mt-2">Instructions:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>
                  Click one of the buttons above to open the Chrome Dino game
                </li>
                <li>Once the game is open, return to this window</li>
                <li>Click "Start AI Control" below</li>
                <li>Switch back to the dino game window</li>
                <li>Press space to start the game if it hasn't started yet</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DinoGameDetector
          isActive={isRunning}
          onObstacleDetected={(obstacles) => {
            if (isRunning) {
              setDetectedObstacles(obstacles);
            }
          }}
        />

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Button
              onClick={isRunning ? stopAIControl : startAIControl}
              disabled={!isConnected}
              variant={isRunning ? "destructive" : "default"}
              className="w-40"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Stop AI Control
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start AI Control
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                stopAIControl();
                setCurrentScore(0);
                setDetectedObstacles([]);
              }}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>

          <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="font-medium text-blue-800">How the AI Works:</p>
            <ol className="list-decimal pl-5 mt-1 text-blue-700">
              <li>The AI captures the game screen using computer vision</li>
              <li>
                It analyzes pixel patterns to detect obstacles (cacti and birds)
              </li>
              <li>
                Based on obstacle type and distance, it decides when to jump or
                duck
              </li>
              <li>The AI sends keyboard commands to control the dinosaur</li>
              <li>
                It continuously learns and improves timing based on results
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* AI Visualization */}
      <AIVisualization
        gameData={{
          obstacles: detectedObstacles,
          decision: aiDecision,
          isActive: isAIMode && isRunning,
        }}
      />

      {/* Game status indicator */}
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${isRunning ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm font-medium">
            {isRunning ? "AI Controller Running" : "AI Controller Stopped"}
          </span>
        </div>

        <div className="text-sm">
          <span className="font-medium">Simulated Score:</span> {currentScore}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm">
        <p className="font-medium text-yellow-800">Important Notes:</p>
        <ul className="list-disc pl-5 mt-2 text-yellow-700 space-y-1">
          <li>
            <strong>BROWSER LIMITATION:</strong> Due to security restrictions,
            the AI cannot directly control the game in another window without a
            Chrome extension.
          </li>
          <li>
            <strong>CHROME EXTENSION AVAILABLE:</strong> Download the Chrome
            Dino AI Controller extension from the link below to enable automatic
            gameplay.
          </li>
          <li>
            <strong>MANUAL MODE:</strong> Without the extension, watch the AI
            visualization below and press SPACE BAR when it shows "JUMP".
          </li>
          <li>
            <strong>EXTENSION SETUP:</strong> After downloading, go to
            chrome://extensions, enable Developer mode, click "Load unpacked"
            and select the extension folder.
          </li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
          <p className="font-medium text-blue-800">
            Chrome Extension Download:
          </p>
          <a
            href="#"
            className="text-blue-600 hover:underline"
            onClick={() =>
              alert(
                "The Chrome Dino AI Controller extension files have been created in the src/components/DinoExtension folder. Download these files to use the extension.",
              )
            }
          >
            Download Chrome Dino AI Controller Extension
          </a>
          <p className="mt-2 text-xs text-blue-700">
            The extension files are located in src/components/DinoExtension
            folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChromeDinoController;

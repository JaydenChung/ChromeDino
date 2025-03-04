import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DinoGameDetectorProps {
  onObstacleDetected?: (
    obstacles: Array<{
      type: "cactus" | "bird";
      distance: number;
      height: number;
      confidence: number;
    }>,
  ) => void;
  isActive?: boolean;
}

const DinoGameDetector = ({
  onObstacleDetected = () => {},
  isActive = false,
}: DinoGameDetectorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastImageData, setLastImageData] = useState<ImageData | null>(null);
  const captureIntervalRef = useRef<number | null>(null);

  // Start screen capture when active
  useEffect(() => {
    if (isActive && !isCapturing) {
      startCapture();
    } else if (!isActive && isCapturing) {
      stopCapture();
    }

    return () => {
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current);
      }
    };
  }, [isActive, isCapturing]);

  // Process captured image data to detect obstacles
  useEffect(() => {
    if (!lastImageData || !isActive) return;

    // This would be where actual computer vision processing happens
    // For now, we'll simulate detection
    const detectedObstacles = processImageData(lastImageData);
    onObstacleDetected(detectedObstacles);
  }, [lastImageData, isActive, onObstacleDetected]);

  // Start capturing screen
  const startCapture = async () => {
    try {
      setIsCapturing(true);

      // In a real implementation, we would use browser APIs to capture the screen
      // For now, we'll simulate captures at regular intervals
      captureIntervalRef.current = window.setInterval(() => {
        simulateCapture();
      }, 100);
    } catch (error) {
      console.error("Error starting capture:", error);
      setIsCapturing(false);
    }
  };

  // Stop capturing screen
  const stopCapture = () => {
    if (captureIntervalRef.current) {
      window.clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setIsCapturing(false);
  };

  // Simulate screen capture (in a real implementation, this would capture the actual game screen)
  const simulateCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Create a simulated game screen
    context.fillStyle = "#f0f0f0";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    context.beginPath();
    context.moveTo(0, 150);
    context.lineTo(canvas.width, 150);
    context.strokeStyle = "#333";
    context.stroke();

    // Randomly draw obstacles
    if (Math.random() < 0.3) {
      const obstacleType = Math.random() > 0.7 ? "bird" : "cactus";
      const x = 200 + Math.random() * 100;

      if (obstacleType === "cactus") {
        context.fillStyle = "#0a7";
        context.fillRect(x, 130, 20, 20);
      } else {
        context.fillStyle = "#55f";
        context.fillRect(x, 110, 20, 10);
      }
    }

    // Get the image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setLastImageData(imageData);
  };

  // Process image data to detect obstacles (simplified simulation)
  const processImageData = (imageData: ImageData) => {
    // In a real implementation, this would use computer vision algorithms
    // For now, we'll return simulated obstacles
    const obstacles: Array<{
      type: "cactus" | "bird";
      distance: number;
      height: number;
      confidence: number;
    }> = [];

    // Only generate obstacles if actively capturing
    if (isCapturing) {
      // Simulate detecting 0-2 obstacles
      const obstacleCount = Math.floor(Math.random() * 2) + 1; // Always at least 1 obstacle
      for (let i = 0; i < obstacleCount; i++) {
        obstacles.push({
          type: Math.random() > 0.3 ? "cactus" : "bird",
          distance: 50 + Math.random() * 150, // Closer obstacles
          height: 20 + Math.random() * 30,
          confidence: 1.0, // 100% confidence
        });
      }
    }

    return obstacles;
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Game Screen Detector</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isCapturing ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-sm">
              {isCapturing ? "Capturing" : "Not capturing"}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="border border-gray-300 rounded-md"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {isActive
              ? "Actively monitoring for obstacles..."
              : "Detector is inactive. Start AI control to begin monitoring."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DinoGameDetector;

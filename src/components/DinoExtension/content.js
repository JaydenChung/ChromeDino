// Variables to track state
let aiActive = false;
let gameInterval = null;
let obstacleDetectionInterval = null;
let lastJumpTime = 0;
let consecutiveJumps = 0;
let gameSpeed = 1.0;

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startAI") {
    startAIController();
  } else if (request.action === "stopAI") {
    stopAIController();
  }
  sendResponse({ status: "success" });
});

// Start the AI controller
function startAIController() {
  if (aiActive) return;
  aiActive = true;

  console.log("Starting Chrome Dino AI Controller");

  // Start the game if not already started
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32 }),
  );

  // Set up obstacle detection - run more frequently for better responsiveness
  obstacleDetectionInterval = setInterval(detectObstacles, 30);

  // Instead of regular jumping, periodically check if we're stuck and need to jump
  // This helps in case our detection misses something
  let lastScore = 0;
  let stuckCounter = 0;

  gameInterval = setInterval(() => {
    if (!aiActive) return;

    // Try to find the score element
    const scoreElements = Array.from(document.querySelectorAll("*")).filter(
      (el) => {
        const text = el.textContent || "";
        return /^\d{1,5}$/.test(text.trim()) && parseInt(text.trim()) > 0;
      },
    );

    let currentScore = 0;
    if (scoreElements.length > 0) {
      // Get the element with the highest numeric value
      currentScore = Math.max(
        ...scoreElements.map((el) => parseInt(el.textContent.trim())),
      );
    }

    // If score hasn't changed in a while, we might be stuck
    if (currentScore === lastScore) {
      stuckCounter++;
      if (stuckCounter >= 3) {
        console.log(
          "Score hasn't changed, might be stuck. Performing safety jump.",
        );
        jump();
        stuckCounter = 0;
      }
    } else {
      stuckCounter = 0;
      lastScore = currentScore;

      // Update game speed based on score
      // Higher scores mean faster game speed
      if (currentScore > 500) {
        gameSpeed = Math.min(3.0, 1.0 + currentScore / 1000);
      }
    }
  }, 1000);

  // Add a status indicator to the page
  const statusDiv = document.createElement("div");
  statusDiv.id = "ai-controller-status";
  statusDiv.style.position = "fixed";
  statusDiv.style.top = "10px";
  statusDiv.style.right = "10px";
  statusDiv.style.background = "rgba(0, 255, 0, 0.7)";
  statusDiv.style.color = "white";
  statusDiv.style.padding = "5px 10px";
  statusDiv.style.borderRadius = "5px";
  statusDiv.style.zIndex = "9999";
  statusDiv.style.fontFamily = "Arial, sans-serif";
  statusDiv.style.fontSize = "12px";
  statusDiv.textContent = "AI Controller Active";
  document.body.appendChild(statusDiv);
}

// Stop the AI controller
function stopAIController() {
  aiActive = false;

  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  if (obstacleDetectionInterval) {
    clearInterval(obstacleDetectionInterval);
    obstacleDetectionInterval = null;
  }

  // Remove the status indicator
  const statusDiv = document.getElementById("ai-controller-status");
  if (statusDiv) {
    statusDiv.remove();
  }

  console.log("Stopped Chrome Dino AI Controller");
}

// Detect obstacles in the game
function detectObstacles() {
  if (!aiActive) return;

  // Get the game canvas
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const gameWidth = canvas.width;
    const gameHeight = canvas.height;

    // Determine the ground level - this varies by game implementation
    // For chromedino.com, we need to detect the ground line
    let groundY = Math.floor(gameHeight * 0.5);

    // Try to detect the actual ground line by scanning a vertical line
    const midX = Math.floor(gameWidth * 0.1); // Look near the left side
    const groundScanData = ctx.getImageData(midX, 0, 1, gameHeight).data;

    // Find the first dark pixel from the bottom up - that's likely the ground
    for (let y = gameHeight - 1; y > gameHeight / 2; y--) {
      const index = y * 4;
      const r = groundScanData[index];
      const g = groundScanData[index + 1];
      const b = groundScanData[index + 2];

      // If we find a dark pixel (part of the ground line)
      if (r < 100 && g < 100 && b < 100) {
        groundY = y - 5; // Set ground level slightly above the line
        break;
      }
    }

    // Find the dino position by scanning the left side of the screen
    let dinoX = 0;
    let dinoY = 0;
    let dinoFound = false;

    // Scan for the dino in the left portion of the screen
    const dinoScanWidth = Math.floor(gameWidth * 0.15);
    const dinoScanData = ctx.getImageData(0, 0, dinoScanWidth, gameHeight).data;

    // Look for a cluster of dark pixels that could be the dino
    for (let x = 0; x < dinoScanWidth; x++) {
      for (let y = Math.floor(gameHeight * 0.3); y < groundY; y++) {
        const index = (y * dinoScanWidth + x) * 4;
        const r = dinoScanData[index];
        const g = dinoScanData[index + 1];
        const b = dinoScanData[index + 2];

        // If we find a dark pixel that could be part of the dino
        if (r < 100 && g < 100 && b < 100) {
          // Check if there are more dark pixels around it (to confirm it's the dino)
          let pixelCount = 0;
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
              if (
                x + dx >= 0 &&
                x + dx < dinoScanWidth &&
                y + dy >= 0 &&
                y + dy < gameHeight
              ) {
                const checkIndex = ((y + dy) * dinoScanWidth + (x + dx)) * 4;
                if (
                  dinoScanData[checkIndex] < 100 &&
                  dinoScanData[checkIndex + 1] < 100 &&
                  dinoScanData[checkIndex + 2] < 100
                ) {
                  pixelCount++;
                }
              }
            }
          }

          // If we found a cluster of dark pixels, it's likely the dino
          if (pixelCount > 10 && !dinoFound) {
            dinoX = x;
            dinoY = y;
            dinoFound = true;
            break;
          }
        }
      }
      if (dinoFound) break;
    }

    // If we couldn't find the dino, use default position
    if (!dinoFound) {
      dinoX = Math.floor(gameWidth * 0.1);
      dinoY = groundY - 20;
    }

    // Define the scan area - focus on where obstacles will appear
    // Start scanning right in front of the dino
    const scanAreaX = dinoX + 30;
    const scanWidth = Math.floor(gameWidth * 0.25); // Scan area width
    const scanHeight = 60; // Scan height to catch both cacti and birds

    // Get image data for the scan area
    const imageData = ctx.getImageData(
      scanAreaX,
      groundY - scanHeight, // Start above ground to catch birds
      scanWidth,
      scanHeight,
    );
    const data = imageData.data;

    // Variables to track obstacle detection
    let obstacleDetected = false;
    let obstacleDistance = Infinity;
    let obstacleType = "unknown";
    let obstacleHeight = 0;

    // Debug visualization - draw the scan area and dino position
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.strokeRect(scanAreaX, groundY - scanHeight, scanWidth, scanHeight);

    if (dinoFound) {
      // Mark the dino position
      ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
      ctx.fillRect(dinoX - 5, dinoY - 5, 10, 10);
    }

    // Scan the image data for obstacles
    for (let x = 0; x < scanWidth; x++) {
      let foundPixelInColumn = false;
      let highestY = 0;

      for (let y = 0; y < scanHeight; y++) {
        const index = (y * scanWidth + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // If pixel is dark (potential obstacle) and not transparent
        if (a > 0 && (r < 100 || g < 100 || b < 100)) {
          foundPixelInColumn = true;
          if (y < highestY || highestY === 0) {
            highestY = y;
          }
        }
      }

      if (foundPixelInColumn) {
        obstacleDetected = true;
        if (x < obstacleDistance) {
          obstacleDistance = x;
          // Determine if it's likely a bird (higher up) or cactus (ground level)
          obstacleHeight = scanHeight - highestY;
          obstacleType = highestY < scanHeight / 2 ? "bird" : "cactus";
        }
      }
    }

    // If obstacle detected, decide what action to take
    if (obstacleDetected) {
      // Calculate jump timing based on distance and game speed
      // As game speed increases, we need to jump earlier
      const jumpThreshold = scanWidth * (0.3 / gameSpeed);

      // Only jump if the obstacle is within our threshold and not too close
      // (to avoid jumping when we're already passing an obstacle)
      if (obstacleDistance < jumpThreshold && obstacleDistance > 5) {
        console.log(
          `Obstacle detected: ${obstacleType} at distance ${obstacleDistance}, height ${obstacleHeight}`,
        );

        // For birds that are high, we might need to duck instead of jump
        // But for simplicity, we'll just jump for all obstacles for now
        jump();

        // Draw a marker at the detected obstacle for debugging
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fillRect(
          scanAreaX + obstacleDistance,
          groundY - obstacleHeight,
          10,
          10,
        );
      }
    }
  } catch (error) {
    console.error("Error in obstacle detection:", error);
  }
}

// Perform jump action
function jump() {
  if (!aiActive) return;

  // Prevent jump spamming - don't jump if we just jumped recently
  const now = Date.now();
  const timeSinceLastJump = now - lastJumpTime;

  // Minimum time between jumps (adjusted for game speed)
  const minJumpInterval = 500 / gameSpeed;

  if (timeSinceLastJump < minJumpInterval) {
    console.log(
      `Ignoring jump request - too soon (${timeSinceLastJump}ms since last jump)`,
    );
    return;
  }

  console.log("Jumping!");
  lastJumpTime = now;
  consecutiveJumps++;

  // Update the status indicator with jump count
  const statusDiv = document.getElementById("ai-controller-status");
  if (statusDiv) {
    statusDiv.textContent = `AI Active - Jumps: ${consecutiveJumps}`;
  }

  // Send space key event to jump
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      keyCode: 32,
      which: 32,
      bubbles: true,
      cancelable: true,
    }),
  );

  // Release key after a short delay
  setTimeout(() => {
    document.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: " ",
        code: "Space",
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, 30);

  // As the game progresses, increase the game speed estimation
  // This helps adjust timing for faster obstacle approach
  if (consecutiveJumps % 10 === 0) {
    gameSpeed = Math.min(3.0, gameSpeed + 0.1);
    console.log(`Game speed estimate increased to ${gameSpeed.toFixed(1)}x`);
  }
}

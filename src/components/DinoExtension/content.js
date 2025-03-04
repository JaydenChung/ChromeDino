// Variables to track state
let aiActive = false;
let gameInterval = null;
let obstacleDetectionInterval = null;
let lastJumpTime = 0;
let consecutiveJumps = 0;
let gameSpeed = 1.0;
let gameCtx = null;

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

  // Reset the context to ensure we get a fresh one
  gameCtx = null;

  // Start the game if not already started
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: " ", code: "Space", keyCode: 32 }),
  );

  // Set up obstacle detection - run less frequently to reduce CPU usage
  obstacleDetectionInterval = setInterval(detectObstacles, 50);

  // Perform a safety jump every 1 second as a fallback
  gameInterval = setInterval(() => {
    if (!aiActive) return;
    console.log("Performing safety jump");
    // Force jump by bypassing the time check
    forceJump();
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

// Remove duplicate declaration
// gameCtx is already declared at the top

// Detect obstacles in the game
function detectObstacles() {
  if (!aiActive) return;

  // Get the game canvas
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  try {
    // Only get the context once and reuse it
    if (!gameCtx) {
      gameCtx = canvas.getContext("2d", { willReadFrequently: true });
    }

    const ctx = gameCtx;
    const gameWidth = canvas.width;
    const gameHeight = canvas.height;

    // For chromedino.com, the ground is usually at a fixed position
    // Let's use a simpler approach with fixed positions
    const groundY = Math.floor(gameHeight * 0.75); // Ground is typically at 75% of height

    // Simplify: We know the dino is always at a fixed position on the left
    const dinoX = Math.floor(gameWidth * 0.1); // Dino is at 10% of width
    const dinoY = groundY - 30; // Dino height is about 30px from ground

    // Define the scan area - focus on where obstacles will appear
    // Start scanning right in front of the dino
    const scanAreaX = dinoX + 50; // Look further ahead
    const scanWidth = Math.floor(gameWidth * 0.2); // Narrower scan area
    const scanHeight = 50; // Scan height for obstacles

    // Get image data for the scan area
    const imageData = ctx.getImageData(
      scanAreaX,
      groundY - scanHeight, // Start above ground
      scanWidth,
      scanHeight,
    );
    const data = imageData.data;

    // Variables to track obstacle detection
    let obstacleDetected = false;
    let obstacleDistance = Infinity;

    // Debug visualization - draw the scan area
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.strokeRect(scanAreaX, groundY - scanHeight, scanWidth, scanHeight);

    // Mark the dino position
    ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
    ctx.fillRect(dinoX - 5, dinoY - 5, 10, 10);

    // Simplified obstacle detection - just look for any dark pixels
    // This works better for chromedino.com
    for (let x = 0; x < scanWidth; x += 2) {
      // Skip pixels for performance
      for (let y = 0; y < scanHeight; y += 2) {
        const index = (y * scanWidth + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // If pixel is dark and not transparent (potential obstacle)
        // Use a higher threshold for better detection
        if (a > 0 && r < 150 && g < 150 && b < 150) {
          obstacleDetected = true;
          if (x < obstacleDistance) {
            obstacleDistance = x;
          }

          // Mark detected pixels for debugging
          ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
          ctx.fillRect(scanAreaX + x, groundY - scanHeight + y, 4, 4);
        }
      }
    }

    // If obstacle detected, decide what action to take
    if (obstacleDetected) {
      // Fixed jump threshold - jump when obstacle is within this distance
      const jumpThreshold = scanWidth * 0.5;

      if (obstacleDistance < jumpThreshold) {
        console.log(`Obstacle detected at distance ${obstacleDistance}`);

        // Draw a marker at the detected obstacle
        ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
        ctx.fillRect(scanAreaX + obstacleDistance, groundY - 30, 10, 30);

        // Jump!
        jump();
      }
    }
  } catch (error) {
    console.error("Error in obstacle detection:", error);
  }
}

// Function to perform jump with time check
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

  // Call the actual jump implementation
  forceJump();
}

// Function to force jump regardless of timing
function forceJump() {
  if (!aiActive) return;

  console.log("Jumping!");
  lastJumpTime = Date.now();
  consecutiveJumps++;

  // Update the status indicator with jump count
  const statusDiv = document.getElementById("ai-controller-status");
  if (statusDiv) {
    statusDiv.textContent = `AI Active - Jumps: ${consecutiveJumps}`;
  }

  // Try multiple methods to trigger a jump

  // Method 1: Standard keyboard event
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

  // Method 2: Try arrow up key as well
  setTimeout(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowUp",
        code: "ArrowUp",
        keyCode: 38,
        which: 38,
        bubbles: true,
        cancelable: true,
      }),
    );

    setTimeout(() => {
      document.dispatchEvent(
        new KeyboardEvent("keyup", {
          key: "ArrowUp",
          code: "ArrowUp",
          keyCode: 38,
          which: 38,
          bubbles: true,
          cancelable: true,
        }),
      );
    }, 30);
  }, 10);

  // As the game progresses, increase the game speed estimation
  // This helps adjust timing for faster obstacle approach
  if (consecutiveJumps % 10 === 0) {
    gameSpeed = Math.min(3.0, gameSpeed + 0.1);
    console.log(`Game speed estimate increased to ${gameSpeed.toFixed(1)}x`);
  }
}

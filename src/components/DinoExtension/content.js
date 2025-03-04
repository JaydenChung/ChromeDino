// Variables to track state
let aiActive = false;
let gameInterval = null;
let obstacleDetectionInterval = null;

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

  // Set up obstacle detection
  obstacleDetectionInterval = setInterval(detectObstacles, 50);

  // Set up regular jumping (as a fallback)
  gameInterval = setInterval(() => {
    if (!aiActive) return;
    // Perform a jump every 1.5 seconds as a fallback
    jump();
  }, 1500);
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

  console.log("Stopped Chrome Dino AI Controller");
}

// Detect obstacles in the game
function detectObstacles() {
  if (!aiActive) return;

  // Get the game canvas
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  try {
    const ctx = canvas.getContext("2d");
    const gameWidth = canvas.width;
    const gameHeight = canvas.height;

    // Get image data from the right portion of the screen where obstacles appear
    const scanAreaX = Math.floor(gameWidth * 0.2); // Start scanning from 20% of screen width
    const scanWidth = Math.floor(gameWidth * 0.3); // Scan 30% of the screen width
    const groundY = Math.floor(gameHeight * 0.5); // Approximate ground position

    const imageData = ctx.getImageData(scanAreaX, 0, scanWidth, gameHeight);
    const data = imageData.data;

    // Simple obstacle detection: look for non-white pixels in the scan area
    // This is a simplified approach - real implementation would be more sophisticated
    let obstacleDetected = false;
    let obstacleDistance = Infinity;

    // Scan the image data for obstacles (non-white pixels)
    for (let x = 0; x < scanWidth; x++) {
      for (let y = groundY - 50; y < groundY + 10; y++) {
        // Check area around ground level
        const index = (y * scanWidth + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // If pixel is not white/light gray (potential obstacle)
        if (r < 200 && g < 200 && b < 200) {
          obstacleDetected = true;
          const currentDistance = x;
          if (currentDistance < obstacleDistance) {
            obstacleDistance = currentDistance;
          }
        }
      }
    }

    // If obstacle detected and it's close enough, jump
    if (obstacleDetected && obstacleDistance < scanWidth * 0.5) {
      console.log("Obstacle detected at distance:", obstacleDistance);
      jump();
    }
  } catch (error) {
    console.error("Error in obstacle detection:", error);
  }
}

// Perform jump action
function jump() {
  if (!aiActive) return;

  console.log("Jumping!");

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
}

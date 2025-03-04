document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleAI");
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");

  // Check current state
  chrome.storage.local.get(["aiActive"], function (result) {
    const isActive = result.aiActive || false;
    updateUI(isActive);
  });

  // Toggle AI controller
  toggleButton.addEventListener("click", function () {
    chrome.storage.local.get(["aiActive"], function (result) {
      const newState = !(result.aiActive || false);

      // Save state
      chrome.storage.local.set({ aiActive: newState }, function () {
        updateUI(newState);

        // Send message to content script
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: newState ? "startAI" : "stopAI",
            });
          },
        );
      });
    });
  });

  function updateUI(isActive) {
    if (isActive) {
      toggleButton.textContent = "Stop AI Controller";
      statusIndicator.classList.remove("inactive");
      statusIndicator.classList.add("active");
      statusText.textContent = "AI Controller Active";
    } else {
      toggleButton.textContent = "Start AI Controller";
      statusIndicator.classList.remove("active");
      statusIndicator.classList.add("inactive");
      statusText.textContent = "AI Controller Inactive";
    }
  }
});

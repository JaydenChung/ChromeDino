// Background script for Chrome Dino AI Controller

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome Dino AI Controller extension installed");

  // Initialize state
  chrome.storage.local.set({ aiActive: false });
});

// Listen for tab updates to inject content script into chrome://dino
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("chrome://dino")
  ) {
    // For chrome://dino we need to use scripting API since content_scripts can't run there
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ["content.js"],
      })
      .catch((err) => console.error("Failed to inject script:", err));
  }
});

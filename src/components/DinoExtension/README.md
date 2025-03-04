# Chrome Dino AI Controller Extension

This Chrome extension allows the AI to automatically play the Chrome Dino game by detecting obstacles and jumping over them.

## Installation Instructions

1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your Chrome toolbar

## Usage

1. Open the Chrome Dino game (chrome://dino or go offline and try to visit a website)
2. Click the extension icon in the toolbar
3. Click "Start AI Controller"
4. Watch as the AI automatically plays the game!

## How It Works

The extension uses computer vision techniques to detect obstacles in the game and automatically sends keyboard commands to make the dinosaur jump at the right time.

## Files

- `manifest.json`: Extension configuration
- `popup.html/js`: User interface for controlling the AI
- `content.js`: Contains the AI logic for detecting obstacles and controlling the game
- `background.js`: Background script for extension functionality

## Note

This extension requires permission to access the game page to function properly. It only runs on the Chrome Dino game page and doesn't collect any personal data.
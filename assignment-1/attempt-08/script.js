// Strudel Web is loaded via CDN script tag
// Functions will be available on the window object

// Application state
const state = {
  isPlaying: false,
  padMode: false,
  bpm: 120,
  currentPattern: "bd sd hh oh",
  fullPattern: '$: s("hh4, bd sd")',
  volume: 0.8,
  sensitivity: 5,
  audioContext: null,
  strudelInstance: null,
};

// Pad configuration - mapping keys to sounds and positions
const PAD_CONFIG = [
  { key: "1", sound: "bd", name: "KICK", position: 0 },
  { key: "2", sound: "sd", name: "SNARE", position: 1 },
  { key: "3", sound: "hh", name: "HIHAT", position: 2 },
  { key: "4", sound: "oh", name: "OPEN HH", position: 3 },
  { key: "q", sound: "cy", name: "CYMBAL", position: 4 },
  { key: "w", sound: "rm", name: "RIM", position: 5 },
  { key: "e", sound: "cl", name: "CLAP", position: 6 },
  { key: "r", sound: "cp", name: "COWBELL", position: 7 },
  { key: "a", sound: "mt", name: "MID TOM", position: 8 },
  { key: "s", sound: "lt", name: "LOW TOM", position: 9 },
  { key: "d", sound: "ht", name: "HIGH TOM", position: 10 },
  { key: "f", sound: "cr", name: "CRASH", position: 11 },
  { key: "z", sound: "perc", name: "PERC", position: 12 },
  { key: "x", sound: "tabla", name: "TABLA", position: 13 },
  { key: "c", sound: "bongo", name: "BONGO", position: 14 },
  { key: "v", sound: "conga", name: "CONGA", position: 15 },
];

// DOM elements
let elements = {};

// Initialize the application
async function init() {
  console.log("Initializing Strudel Drum Pad...");

  // Get DOM elements
  elements = {
    audioOverlay: document.getElementById("audio-enable-overlay"),
    enableAudioBtn: document.getElementById("enable-audio-btn"),
    playStopBtn: document.getElementById("play-stop-btn"),
    bpmInput: document.getElementById("bpm-input"),
    settingsBtn: document.getElementById("settings-btn"),
    settingsModal: document.getElementById("settings-modal"),
    closeSettings: document.getElementById("close-settings"),
    padGrid: document.getElementById("drum-pad-grid"),
    padModeIndicator: document.getElementById("pad-mode-indicator"),
    padModeStatus: document.getElementById("pad-mode-status"),
    padModeToggle: document.getElementById("pad-mode-toggle"),
    strudelEditor: document.getElementById("strudel-editor"),
    currentPattern: document.getElementById("current-pattern"),
    volumeSlider: document.getElementById("volume-slider"),
    volumeValue: document.getElementById("volume-value"),
    sensitivitySlider: document.getElementById("sensitivity-slider"),
    sensitivityValue: document.getElementById("sensitivity-value"),
  };

  try {
    // Wait for Strudel to be available
    if (typeof strudel === "undefined") {
      console.log("Waiting for Strudel to load...");
      setTimeout(init, 100);
      return;
    }

    // Initialize audio context
    state.audioContext = strudel.getAudioContext
      ? strudel.getAudioContext()
      : new (window.AudioContext || window.webkitAudioContext)();

    // Check if audio context is suspended
    if (state.audioContext.state === "suspended") {
      showAudioOverlay();
    } else {
      hideAudioOverlay();
    }

    // Create drum pads
    createDrumPads();

    // Set up event listeners
    setupEventListeners();

    // Initialize Strudel editor
    initializeStrudelEditor();

    // Set initial pattern
    updatePatternDisplay();

    console.log("Strudel Drum Pad initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize Strudel Drum Pad:", error);
    showError("Failed to initialize audio. Please refresh and try again.");
  }
}

// Show/hide audio overlay
function showAudioOverlay() {
  elements.audioOverlay.classList.remove("hidden");
}

function hideAudioOverlay() {
  elements.audioOverlay.classList.add("hidden");
}

// Create the 4x4 drum pad grid
function createDrumPads() {
  elements.padGrid.innerHTML = "";

  PAD_CONFIG.forEach((config) => {
    const pad = document.createElement("div");
    pad.className = "pad";
    pad.dataset.key = config.key;
    pad.dataset.sound = config.sound;
    pad.dataset.position = config.position;

    pad.innerHTML = `
            <div class="pad-name">${config.name}</div>
            <div class="pad-key">${config.key.toUpperCase()}</div>
            <div class="pad-sound">${config.sound}</div>
        `;

    // Add click listener
    pad.addEventListener("click", (e) => {
      e.preventDefault();
      triggerPad(config.sound, config.key);
    });

    // Prevent context menu
    pad.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    elements.padGrid.appendChild(pad);
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Audio enable button
  elements.enableAudioBtn.addEventListener("click", async () => {
    try {
      await state.audioContext.resume();
      if (strudel.initAudioOnFirstClick) {
        await strudel.initAudioOnFirstClick();
      }
      hideAudioOverlay();
    } catch (error) {
      console.error("Failed to enable audio:", error);
    }
  });

  // Play/Stop button
  elements.playStopBtn.addEventListener("click", togglePlayStop);

  // BPM input
  elements.bpmInput.addEventListener("input", (e) => {
    state.bpm = parseInt(e.target.value);
    if (state.strudelInstance) {
      state.strudelInstance.setBPM(state.bpm);
    }
  });

  // Settings modal
  elements.settingsBtn.addEventListener("click", () => {
    elements.settingsModal.classList.remove("hidden");
  });

  elements.closeSettings.addEventListener("click", () => {
    elements.settingsModal.classList.add("hidden");
  });

  elements.settingsModal.addEventListener("click", (e) => {
    if (e.target === elements.settingsModal) {
      elements.settingsModal.classList.add("hidden");
    }
  });

  // Volume slider
  elements.volumeSlider.addEventListener("input", (e) => {
    state.volume = e.target.value / 100;
    elements.volumeValue.textContent = e.target.value + "%";
    if (state.strudelInstance) {
      state.strudelInstance.setVolume(state.volume);
    }
  });

  // Sensitivity slider
  elements.sensitivitySlider.addEventListener("input", (e) => {
    state.sensitivity = parseInt(e.target.value);
    elements.sensitivityValue.textContent = e.target.value;
  });

  // Pad mode toggle
  elements.padModeToggle.addEventListener("click", togglePadMode);

  // Keyboard events
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Pad grid focus events
  elements.padGrid.addEventListener("focus", () => {
    if (!state.padMode) {
      togglePadMode();
    }
  });

  elements.padGrid.addEventListener("click", () => {
    elements.padGrid.focus();
  });

  // Global click to exit pad mode
  document.addEventListener("click", (e) => {
    if (
      state.padMode &&
      !elements.padGrid.contains(e.target) &&
      e.target !== elements.padModeToggle
    ) {
      if (state.padMode) {
        togglePadMode();
      }
    }
  });
}

// Toggle pad mode
function togglePadMode() {
  state.padMode = !state.padMode;
  elements.padModeStatus.textContent = state.padMode ? "ON" : "OFF";
  elements.padModeStatus.className = state.padMode ? "active" : "";
  elements.padModeIndicator.className = state.padMode
    ? "pad-mode-indicator active"
    : "pad-mode-indicator";
  elements.padModeToggle.className = state.padMode
    ? "pad-mode-btn active"
    : "pad-mode-btn";

  if (state.padMode) {
    elements.padGrid.focus();
  }
}

// Handle keyboard input
function handleKeyDown(e) {
  // Exit pad mode on Escape
  if (e.key === "Escape") {
    if (state.padMode) {
      togglePadMode();
      e.preventDefault();
      e.stopPropagation();
    }
    return;
  }

  // Only handle pad keys if in pad mode
  if (!state.padMode) {
    return;
  }

  // Ignore if modifier keys are pressed
  if (e.metaKey || e.ctrlKey || e.altKey) {
    return;
  }

  // Ignore if active element is an input
  const activeElement = document.activeElement;
  const isInputActive =
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.contentEditable === "true" ||
      activeElement.classList.contains("strudel-editor"));

  if (isInputActive) {
    return;
  }

  // Find pad configuration for this key
  const padConfig = PAD_CONFIG.find(
    (config) => config.key === e.key.toLowerCase()
  );

  if (padConfig) {
    e.preventDefault();
    e.stopPropagation();
    triggerPad(padConfig.sound, padConfig.key);
  }
}

function handleKeyUp(e) {
  // Handle key release for visual feedback
  const padConfig = PAD_CONFIG.find(
    (config) => config.key === e.key.toLowerCase()
  );
  if (padConfig && state.padMode) {
    const pad = elements.padGrid.querySelector(`[data-key="${padConfig.key}"]`);
    if (pad) {
      pad.classList.remove("active");
    }
  }
}

// Trigger a pad sound
async function triggerPad(sound, key) {
  try {
    // Visual feedback
    const pad = elements.padGrid.querySelector(`[data-key="${key}"]`);
    if (pad) {
      pad.classList.add("triggered");
      setTimeout(() => {
        pad.classList.remove("triggered");
      }, 100);
    }

    // Play sound directly using Strudel
    const pattern = `s("${sound}")`;
    if (strudel.evaluate) {
      await strudel.evaluate(pattern);
    } else {
      console.warn("Strudel evaluate function not available");
    }

    // Update pattern string
    updateCurrentPattern(sound);
  } catch (error) {
    console.error("Failed to trigger pad:", error);
  }
}

// Update the current pattern with new sound
function updateCurrentPattern(newSound) {
  // Add the new sound to the current pattern
  if (state.currentPattern) {
    state.currentPattern += ` ${newSound}`;
  } else {
    state.currentPattern = newSound;
  }

  // Limit pattern length to avoid it getting too long
  const sounds = state.currentPattern.split(" ");
  if (sounds.length > 16) {
    sounds.shift(); // Remove first sound
    state.currentPattern = sounds.join(" ");
  }

  // Update full pattern
  state.fullPattern = `$: s("${state.currentPattern}")`;

  // Update display
  updatePatternDisplay();
}

// Update pattern display in editor
function updatePatternDisplay() {
  elements.currentPattern.textContent = state.fullPattern;

  // Update Strudel editor content
  if (elements.strudelEditor) {
    elements.strudelEditor.textContent = state.fullPattern;
  }
}

// Initialize Strudel editor
function initializeStrudelEditor() {
  // Create simple text editor for now
  elements.strudelEditor.contentEditable = true;
  elements.strudelEditor.textContent = state.fullPattern;

  // Style the editor
  elements.strudelEditor.style.whiteSpace = "pre-wrap";
  elements.strudelEditor.style.outline = "none";

  // Update pattern when editor content changes
  elements.strudelEditor.addEventListener("input", () => {
    const content = elements.strudelEditor.textContent;
    // Extract pattern from Strudel syntax if possible
    const match = content.match(/s\("([^"]+)"\)/);
    if (match) {
      state.currentPattern = match[1];
      state.fullPattern = content;
      elements.currentPattern.textContent = content;
    }
  });
}

// Toggle play/stop
async function togglePlayStop() {
  if (state.isPlaying) {
    // Stop playback
    try {
      if (strudel.spiral && strudel.spiral.stop) {
        strudel.spiral.stop();
      } else if (state.strudelInstance && state.strudelInstance.stop) {
        state.strudelInstance.stop();
      }
      state.isPlaying = false;
      elements.playStopBtn.textContent = "PLAY";
      elements.playStopBtn.classList.remove("active");
    } catch (error) {
      console.error("Failed to stop playback:", error);
    }
  } else {
    // Start playback
    try {
      const pattern = elements.strudelEditor.textContent || state.fullPattern;

      // Evaluate the pattern
      let evalResult;
      if (strudel.evaluate) {
        evalResult = await strudel.evaluate(pattern);
      } else {
        console.warn("Strudel evaluate function not available");
        return;
      }

      if (evalResult) {
        state.strudelInstance = evalResult;
        state.isPlaying = true;
        elements.playStopBtn.textContent = "STOP";
        elements.playStopBtn.classList.add("active");
      }
    } catch (error) {
      console.error("Failed to start playback:", error);
      showError("Invalid pattern. Please check your Strudel syntax.");
    }
  }
}

// Show error message
function showError(message) {
  // Simple error display - could be enhanced
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff0000;
        color: white;
        padding: 15px;
        border: 3px solid #fff;
        font-family: 'IBM Plex Mono', monospace;
        font-weight: 700;
        z-index: 1001;
    `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    document.body.removeChild(errorDiv);
  }, 3000);
}

// Handle audio context state changes
function handleAudioContextStateChange() {
  if (state.audioContext) {
    state.audioContext.addEventListener("statechange", () => {
      if (state.audioContext.state === "suspended") {
        showAudioOverlay();
      } else if (state.audioContext.state === "running") {
        hideAudioOverlay();
      }
    });
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", init);

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.isPlaying) {
    // Pause when page is hidden to avoid issues
    console.log("Page hidden, maintaining audio state");
  }
});

// Export for debugging
window.strudelDrumPad = {
  state,
  elements,
  triggerPad,
  togglePlayStop,
  PAD_CONFIG,
};

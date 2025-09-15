// Global state (Strudel functions loaded globally by clockworker)
let strudelReady = false;
let audioContext = null;
let isPadModeActive = false;
let isPlaying = false;
let currentPattern = '$: s("hh*4, bd sd")';
let volume = 0.75;
let sensitivity = 0.5;

// DOM elements
const elements = {};

// Key mapping for pads
const keyMap = {
  1: "bd",
  2: "sd",
  3: "hh",
  4: "oh",
  q: "cr",
  w: "rim",
  e: "cp",
  r: "cb",
  a: "mt",
  s: "lt",
  d: "ht",
  f: "rd",
  z: "perc",
  x: "sh",
  c: "tb",
  v: "misc",
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
  console.log("Initializing Strudel Drum Pad...");

  // Cache DOM elements
  cacheElements();

  // Initialize event listeners
  setupEventListeners();

  // Initialize Strudel
  await initializeStrudel();

  // Check audio context
  await checkAudioContext();

  console.log("App initialized successfully");
}

function cacheElements() {
  elements.enableSoundOverlay = document.getElementById("enable-sound-overlay");
  elements.enableSoundBtn = document.getElementById("enable-sound-btn");
  elements.padModeCheckbox = document.getElementById("pad-mode-checkbox");
  elements.padModeStatus = document.getElementById("pad-mode-status");
  elements.drumPadGrid = document.getElementById("drum-pad-grid");
  elements.playBtn = document.getElementById("play-btn");
  elements.stopBtn = document.getElementById("stop-btn");
  elements.bpmInput = document.getElementById("bpm-input");
  elements.patternEditor = document.getElementById("pattern-editor");
  elements.clearPatternBtn = document.getElementById("clear-pattern-btn");
  elements.settingsBtn = document.getElementById("settings-btn");
  elements.settingsModal = document.getElementById("settings-modal");
  elements.closeSettingsBtn = document.getElementById("close-settings-btn");
  elements.volumeSlider = document.getElementById("volume-slider");
  elements.volumeValue = document.getElementById("volume-value");
  elements.sensitivitySlider = document.getElementById("sensitivity-slider");
  elements.sensitivityValue = document.getElementById("sensitivity-value");

  // Get all pads
  elements.pads = document.querySelectorAll(".pad");
}

function setupEventListeners() {
  // Enable sound overlay
  elements.enableSoundBtn.addEventListener("click", enableAudioContext);

  // Pad mode toggle
  elements.padModeCheckbox.addEventListener("change", togglePadMode);

  // Drum pad interactions
  elements.pads.forEach((pad) => {
    pad.addEventListener("click", () => triggerPad(pad));
    pad.addEventListener("mousedown", (e) => e.preventDefault());
  });

  // Transport controls
  elements.playBtn.addEventListener("click", togglePlayback);
  elements.stopBtn.addEventListener("click", stopPlayback);
  elements.bpmInput.addEventListener("input", updateBPM);

  // Pattern editor
  elements.patternEditor.addEventListener("input", updatePattern);
  elements.clearPatternBtn.addEventListener("click", clearPattern);

  // Settings modal
  elements.settingsBtn.addEventListener("click", openSettings);
  elements.closeSettingsBtn.addEventListener("click", closeSettings);
  elements.settingsModal.addEventListener("click", (e) => {
    if (e.target === elements.settingsModal) closeSettings();
  });

  // Volume and sensitivity controls
  elements.volumeSlider.addEventListener("input", updateVolume);
  elements.sensitivitySlider.addEventListener("input", updateSensitivity);

  // Keyboard events
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Focus management
  elements.drumPadGrid.addEventListener("click", () => {
    if (!isPadModeActive) {
      elements.drumPadGrid.focus();
    }
  });

  // Click outside to deactivate pad mode
  document.addEventListener("click", (e) => {
    if (
      isPadModeActive &&
      !elements.drumPadGrid.contains(e.target) &&
      !elements.padModeCheckbox.contains(e.target)
    ) {
      deactivatePadMode();
    }
  });

  // Escape key to deactivate pad mode
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isPadModeActive) {
      deactivatePadMode();
    }
  });
}

async function initializeStrudel() {
  try {
    console.log("Initializing Strudel Web with local samples...");

    // Wait for Strudel Web to be available
    let attempts = 0;
    while (attempts < 50) {
      if (typeof initStrudel !== "undefined") {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (typeof initStrudel === "undefined") {
      throw new Error("Strudel Web failed to load");
    }

    // Initialize Strudel Web with prebaked samples (correct format)
    await initStrudel({
      prebake: () =>
        samples({
          bd: "samples/bd.wav",
          sd: "samples/sd.wav",
          rim: "samples/rim.wav",
          cp: "samples/cp.wav",
          hh: "samples/hh.wav",
          oh: "samples/oh.wav",
          cr: "samples/cr.wav",
          rd: "samples/rd.wav",
          ht: "samples/ht.wav",
          mt: "samples/mt.wav",
          lt: "samples/lt.wav",
          sh: "samples/sh.wav",
          cb: "samples/cb.wav",
          tb: "samples/tb.wav",
          perc: "samples/perc.wav",
          misc: "samples/misc.wav",
          fx: "samples/fx.wav",
        }),
    });

    strudelReady = true;
    console.log("Strudel Web initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Strudel Web:", error);
    showError("Failed to initialize audio engine. Please refresh the page.");
  }
}

async function checkAudioContext() {
  try {
    // Get audio context from Strudel
    audioContext = getAudioContext();

    if (audioContext && audioContext.state === "suspended") {
      elements.enableSoundOverlay.classList.remove("hidden");
    } else {
      elements.enableSoundOverlay.classList.add("hidden");
    }
  } catch (error) {
    console.error("Audio context check failed:", error);
  }
}

async function enableAudioContext() {
  try {
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }

    elements.enableSoundOverlay.classList.add("hidden");
    console.log("Audio context enabled");
  } catch (error) {
    console.error("Failed to enable audio context:", error);
  }
}

function togglePadMode() {
  if (elements.padModeCheckbox.checked) {
    activatePadMode();
  } else {
    deactivatePadMode();
  }
}

function activatePadMode() {
  isPadModeActive = true;
  elements.padModeCheckbox.checked = true;
  elements.padModeStatus.textContent = "ON";
  elements.padModeStatus.classList.add("active");
  elements.drumPadGrid.focus();
}

function deactivatePadMode() {
  isPadModeActive = false;
  elements.padModeCheckbox.checked = false;
  elements.padModeStatus.textContent = "OFF";
  elements.padModeStatus.classList.remove("active");
  elements.drumPadGrid.blur();
}

function handleKeyDown(e) {
  // Check if we should handle this key event
  if (!shouldHandleKeyEvent(e)) return;

  const key = e.key.toLowerCase();

  // Handle pad keys
  if (keyMap[key]) {
    e.preventDefault();
    e.stopPropagation();

    const sound = keyMap[key];
    const pad = document.querySelector(`[data-sound="${sound}"]`);

    if (pad && !pad.classList.contains("triggered")) {
      triggerPad(pad);
    }
  }
}

function handleKeyUp(e) {
  // Just for visual feedback completion
  const key = e.key.toLowerCase();
  if (keyMap[key] && shouldHandleKeyEvent(e)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function shouldHandleKeyEvent(e) {
  // Don't handle if modifiers are pressed (preserve browser shortcuts)
  if (e.metaKey || e.ctrlKey || e.altKey) return false;

  // Don't handle if active element is an input
  const activeElement = document.activeElement;
  const isInput =
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.contentEditable === "true" ||
      activeElement === elements.patternEditor);

  if (isInput) return false;

  // Handle if pad mode is active OR drum pad grid has focus
  return isPadModeActive || document.activeElement === elements.drumPadGrid;
}

async function triggerPad(pad) {
  if (!strudelReady) return;

  const sound = pad.dataset.sound;
  const label = pad.dataset.label;

  // Visual feedback
  pad.classList.add("triggered");
  setTimeout(() => {
    pad.classList.remove("triggered");
  }, 150);

  try {
    // Play individual sound using Strudel Web
    const pattern = `s("${sound}").gain(${volume})`;
    evaluate(pattern);

    // Add to pattern editor (append to current pattern)
    appendToPattern(sound);

    console.log(`Triggered ${label} (${sound})`);
  } catch (error) {
    console.error(`Failed to trigger ${sound}:`, error);
  }
}

function appendToPattern(sound) {
  const editor = elements.patternEditor;
  let pattern = editor.value.trim();

  // Simple pattern building - append sound to existing pattern
  if (pattern === '$: s("hh*4, bd sd")' || pattern === "") {
    pattern = `$: s("${sound}")`;
  } else if (pattern.includes('s("') && pattern.includes('")')) {
    // Insert before the closing quote
    const lastQuoteIndex = pattern.lastIndexOf('")');
    if (lastQuoteIndex !== -1) {
      pattern =
        pattern.slice(0, lastQuoteIndex) +
        ` ${sound}` +
        pattern.slice(lastQuoteIndex);
    }
  } else {
    // Fallback: create new pattern
    pattern = `$: s("${sound}")`;
  }

  editor.value = pattern;
  updatePattern();
}

function updatePattern() {
  currentPattern = elements.patternEditor.value;
}

function clearPattern() {
  elements.patternEditor.value = '$: s("hh*4, bd sd")';
  currentPattern = elements.patternEditor.value;
}

async function togglePlayback() {
  if (!strudelReady) return;

  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

async function startPlayback() {
  if (!strudelReady) return;

  try {
    const pattern = elements.patternEditor.value.trim() || currentPattern;

    // Evaluate the pattern
    evaluate(pattern);

    isPlaying = true;
    elements.playBtn.textContent = "PAUSE";
    elements.playBtn.classList.add("active");

    console.log("Playback started:", pattern);
  } catch (error) {
    console.error("Failed to start playback:", error);
    showError("Failed to play pattern. Check pattern syntax.");
  }
}

function stopPlayback() {
  if (!strudelReady) return;

  try {
    // Multiple stop methods for robustness (from original prompt)

    // Method 1: Primary stop
    if (typeof hush !== "undefined") {
      hush(); // Stops all Strudel sounds immediately
    }

    // Method 2: Spiral control
    if (typeof spiral !== "undefined" && spiral && spiral.stop) {
      spiral.stop();
    }

    // Method 3: Silence evaluation
    if (typeof evaluate !== "undefined") {
      evaluate("silence");
    }

    // Method 4: Stop any ongoing patterns
    if (typeof stop !== "undefined") {
      stop();
    }

    // Method 5: Clear any scheduled patterns
    if (window.scheduler && window.scheduler.clear) {
      window.scheduler.clear();
    }

    isPlaying = false;
    elements.playBtn.textContent = "PLAY";
    elements.playBtn.classList.remove("active");

    console.log("Playback stopped using multiple methods");
  } catch (error) {
    console.error("Failed to stop playback:", error);
  }
}

function updateBPM() {
  const bpm = parseInt(elements.bpmInput.value);
  if (bpm >= 60 && bpm <= 200) {
    try {
      // Note: BPM is typically handled by patterns in Strudel
      // For now, just log the change
      console.log(`BPM updated to: ${bpm}`);
    } catch (error) {
      console.error("Failed to update BPM:", error);
    }
  }
}

function openSettings() {
  elements.settingsModal.classList.remove("hidden");
}

function closeSettings() {
  elements.settingsModal.classList.add("hidden");
}

function updateVolume() {
  volume = elements.volumeSlider.value / 100;
  elements.volumeValue.textContent = `${elements.volumeSlider.value}%`;
}

function updateSensitivity() {
  sensitivity = elements.sensitivitySlider.value / 100;
  elements.sensitivityValue.textContent = `${elements.sensitivitySlider.value}%`;
}

function showError(message) {
  console.error("Error:", message);
  // Could implement a toast notification here
  alert(message);
}

// Utility functions
function getAudioContext() {
  try {
    // Try different ways to access audio context from Strudel
    if (window.superdough && window.superdough.webaudio) {
      return window.superdough.webaudio.ctx;
    }
    // Create new AudioContext if not available from Strudel
    if (window.AudioContext || window.webkitAudioContext) {
      return new (window.AudioContext || window.webkitAudioContext)();
    }
  } catch (error) {
    console.error("Failed to get audio context:", error);
  }
  return null;
}

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden && isPlaying) {
    // Optionally pause when page is hidden
    // stopPlayback();
  }
});

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (isPlaying) {
    stopPlayback();
  }
});

// Error handling for uncaught errors
window.addEventListener("error", (e) => {
  console.error("Uncaught error:", e.error);
  if (e.error.message && e.error.message.toLowerCase().includes("strudel")) {
    showError("Audio engine error occurred. Please refresh the page.");
  }
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
  if (
    e.reason &&
    e.reason.message &&
    e.reason.message.toLowerCase().includes("audio")
  ) {
    showError("Audio initialization failed. Please refresh the page.");
  }
});

console.log("Strudel Drum Pad script loaded");

// Global variables
let strudelInitialized = false;
let currentSequence = [];
let isPlaying = false;
let currentBPM = 120;
let currentBank = "tr909";
let volume = 0.8;

// Sound bank mappings for TR-909
const soundMappings = {
  bd: "bd", // Bass drum
  sd: "sd", // Snare drum
  hh: "hh", // Hi-hat
  oh: "oh", // Open hi-hat
  cp: "cp", // Clap
  rs: "rs", // Rim shot
  cb: "cb", // Cowbell
  ch: "ch", // Closed hi-hat
  lt: "lt", // Low tom
  mt: "mt", // Mid tom
  ht: "ht", // High tom
  op: "op", // Open
  cr: "cr", // Crash
  ri: "ri", // Ride
  sh: "sh", // Shaker
  ag: "ag", // Agogo
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeStrudel();
  setupEventListeners();
  updateCodeDisplay();
});

// Initialize Strudel with sound loading
async function initializeStrudel() {
  try {
    // Initialize Strudel with prebake to load samples
    initStrudel({
      prebake: () => {
        // Load TR-909 samples
        return samples("github:tidalcycles/dirt-samples");
      },
    });

    strudelInitialized = true;
    console.log("Strudel initialized successfully");

    // Set initial tempo
    if (typeof cps !== "undefined") {
      cps(currentBPM / 60);
    }
  } catch (error) {
    console.error("Failed to initialize Strudel:", error);
    alert("Failed to initialize Strudel. Please refresh the page.");
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Pad click events
  const pads = document.querySelectorAll(".pad");
  pads.forEach((pad) => {
    pad.addEventListener("click", () => handlePadClick(pad));
  });

  // Keyboard events
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Control buttons
  document.getElementById("play-btn").addEventListener("click", togglePlayback);
  document.getElementById("stop-btn").addEventListener("click", stopPlayback);
  document
    .getElementById("settings-btn")
    .addEventListener("click", openSettings);

  // BPM control
  document.getElementById("bpm").addEventListener("input", updateBPM);

  // Settings modal
  document
    .getElementById("close-settings")
    .addEventListener("click", closeSettings);
  document
    .getElementById("save-settings")
    .addEventListener("click", saveSettings);
  document.getElementById("volume").addEventListener("input", updateVolume);

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("settings-modal");
    if (event.target === modal) {
      closeSettings();
    }
  });
}

// Handle pad clicks
function handlePadClick(pad) {
  const key = pad.dataset.key;
  const sound = pad.dataset.sound;

  // Add visual feedback
  pad.classList.add("active");
  setTimeout(() => {
    pad.classList.remove("active");
  }, 150);

  // Play sound immediately
  playSound(sound);

  // Add to sequence
  addToSequence(sound);
}

// Handle keyboard events
function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  const pad = document.querySelector(`[data-key="${key}"]`);

  if (pad && !event.repeat) {
    const sound = pad.dataset.sound;

    // Add visual feedback
    pad.classList.add("active");

    // Play sound immediately
    playSound(sound);

    // Add to sequence
    addToSequence(sound);
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  const pad = document.querySelector(`[data-key="${key}"]`);

  if (pad) {
    pad.classList.remove("active");
  }
}

// Play individual sound
function playSound(sound) {
  if (!strudelInitialized) return;

  try {
    // Create a simple pattern for immediate playback
    const pattern = `s("${sound}").bank("${currentBank}")`;
    evaluate(pattern);
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

// Add sound to current sequence
function addToSequence(sound) {
  // For simplicity, we'll create a pattern with all pressed sounds
  // In a more advanced version, you could track timing and create complex patterns
  if (!currentSequence.includes(sound)) {
    currentSequence.push(sound);
    updateCodeDisplay();
  }
}

// Update the code display
function updateCodeDisplay() {
  const codeOutput = document.getElementById("code-output");

  if (currentSequence.length === 0) {
    codeOutput.textContent = `$: s("bd sd").bank("${currentBank}")`;
  } else {
    const soundString = currentSequence.join(" ");
    codeOutput.textContent = `$: s("${soundString}").bank("${currentBank}")`;
  }
}

// Toggle playback
function togglePlayback() {
  const playBtn = document.getElementById("play-btn");

  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

// Start playback
function startPlayback() {
  if (!strudelInitialized) return;

  const playBtn = document.getElementById("play-btn");
  playBtn.textContent = "STOP";
  playBtn.classList.add("active");
  isPlaying = true;

  try {
    // Create and play the sequence
    const soundString =
      currentSequence.length > 0 ? currentSequence.join(" ") : "bd sd";
    const pattern = `s("${soundString}").bank("${currentBank}")`;

    // Evaluate and play the pattern
    evaluate(pattern);
  } catch (error) {
    console.error("Error starting playback:", error);
    stopPlayback();
  }
}

// Stop playback
function stopPlayback() {
  const playBtn = document.getElementById("play-btn");
  playBtn.textContent = "PLAY";
  playBtn.classList.remove("active");
  isPlaying = false;

  try {
    if (typeof hush !== "undefined") {
      hush();
    }
  } catch (error) {
    console.error("Error stopping playback:", error);
  }
}

// Update BPM
function updateBPM() {
  const bpmInput = document.getElementById("bpm");
  currentBPM = parseInt(bpmInput.value);

  try {
    if (typeof cps !== "undefined") {
      cps(currentBPM / 60);
    }
  } catch (error) {
    console.error("Error updating BPM:", error);
  }
}

// Open settings modal
function openSettings() {
  const modal = document.getElementById("settings-modal");
  modal.style.display = "block";

  // Set current values
  document.getElementById("sound-bank").value = currentBank;
  document.getElementById("volume").value = volume * 100;
  document.getElementById("volume-value").textContent =
    Math.round(volume * 100) + "%";
}

// Close settings modal
function closeSettings() {
  const modal = document.getElementById("settings-modal");
  modal.style.display = "none";
}

// Save settings
function saveSettings() {
  currentBank = document.getElementById("sound-bank").value;
  volume = document.getElementById("volume").value / 100;

  // Update code display with new bank
  updateCodeDisplay();

  // Close modal
  closeSettings();

  console.log("Settings saved:", { bank: currentBank, volume: volume });
}

// Update volume display
function updateVolume() {
  const volumeSlider = document.getElementById("volume");
  const volumeValue = document.getElementById("volume-value");
  volumeValue.textContent = volumeSlider.value + "%";
}

// Clear sequence (utility function)
function clearSequence() {
  currentSequence = [];
  updateCodeDisplay();
}

// Add some example sequences (bonus feature)
function loadExampleSequence(example) {
  const examples = {
    basic: ["bd", "sd", "hh"],
    complex: ["bd", "sd", "hh", "oh", "cp"],
    minimal: ["bd", "hh"],
  };

  if (examples[example]) {
    currentSequence = [...examples[example]];
    updateCodeDisplay();
  }
}

// Export current sequence as Strudel code (bonus feature)
function exportSequence() {
  const soundString =
    currentSequence.length > 0 ? currentSequence.join(" ") : "bd sd";
  const code = `$: s("${soundString}").bank("${currentBank}")`;

  // Copy to clipboard
  navigator.clipboard.writeText(code).then(() => {
    console.log("Sequence copied to clipboard:", code);
    // You could add a visual feedback here
  });
}

// Initialize with a default sequence
setTimeout(() => {
  if (strudelInitialized) {
    currentSequence = ["bd", "sd", "hh"];
    updateCodeDisplay();
  }
}, 1000);

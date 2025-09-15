// Drum Pad Application
class DrumPadApp {
  constructor() {
    this.isInitialized = false;
    this.currentPattern = [];
    this.soundSettings = {};
    this.keyMapping = {
      1: { row: 0, col: 0 },
      2: { row: 0, col: 1 },
      3: { row: 0, col: 2 },
      4: { row: 0, col: 3 },
      q: { row: 1, col: 0 },
      w: { row: 1, col: 1 },
      e: { row: 1, col: 2 },
      r: { row: 1, col: 3 },
      a: { row: 2, col: 0 },
      s: { row: 2, col: 1 },
      d: { row: 2, col: 2 },
      f: { row: 2, col: 3 },
      z: { row: 3, col: 0 },
      x: { row: 3, col: 1 },
      c: { row: 3, col: 2 },
      v: { row: 3, col: 3 },
    };

    // Default sound settings for each pad
    this.defaultSounds = [
      "bd",
      "sd",
      "hh",
      "oh",
      "cp",
      "rim",
      "shaker",
      "crash",
      "kick",
      "snare",
      "hat",
      "openhat",
      "perc",
      "click",
      "pop",
      "tick",
    ];

    this.availableSounds = [
      { name: "Kick Drum", value: "bd", description: "Bass drum" },
      { name: "Snare Drum", value: "sd", description: "Snare drum" },
      { name: "Hi-Hat", value: "hh", description: "Closed hi-hat" },
      { name: "Open Hat", value: "oh", description: "Open hi-hat" },
      { name: "Clap", value: "cp", description: "Hand clap" },
      { name: "Rim Shot", value: "rim", description: "Rim shot" },
      { name: "Shaker", value: "shaker", description: "Shaker percussion" },
      { name: "Crash", value: "crash", description: "Crash cymbal" },
      { name: "Kick", value: "kick", description: "Alternative kick" },
      { name: "Snare", value: "snare", description: "Alternative snare" },
      { name: "Hat", value: "hat", description: "Alternative hat" },
      {
        name: "Open Hat",
        value: "openhat",
        description: "Alternative open hat",
      },
      { name: "Percussion", value: "perc", description: "General percussion" },
      { name: "Click", value: "click", description: "Click sound" },
      { name: "Pop", value: "pop", description: "Pop sound" },
      { name: "Tick", value: "tick", description: "Tick sound" },
      { name: "Tom", value: "tom", description: "Tom drum" },
      { name: "Ride", value: "ride", description: "Ride cymbal" },
      { name: "Bell", value: "bell", description: "Bell sound" },
      { name: "Wood", value: "wood", description: "Wood block" },
    ];

    this.init();
  }

  async init() {
    try {
      // Initialize Strudel
      await initStrudel({
        prebake: () => samples("github:tidalcycles/dirt-samples"),
      });

      this.isInitialized = true;
      console.log("Strudel initialized successfully");

      // Initialize sound settings
      this.initializeSoundSettings();

      // Create drum pad UI
      this.createDrumPadGrid();

      // Set up event listeners
      this.setupEventListeners();

      // Create settings modal
      this.createSettingsModal();
    } catch (error) {
      console.error("Failed to initialize Strudel:", error);
      alert(
        "Failed to initialize audio. Please refresh the page and try again."
      );
    }
  }

  initializeSoundSettings() {
    // Initialize sound settings for each pad
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const padIndex = row * 4 + col;
        const key = `${row}-${col}`;
        this.soundSettings[key] = this.defaultSounds[padIndex] || "bd";
      }
    }
  }

  createDrumPadGrid() {
    const grid = document.getElementById("drum-pad-grid");
    grid.innerHTML = "";

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const pad = document.createElement("div");
        pad.className = "drum-pad";
        pad.dataset.row = row;
        pad.dataset.col = col;

        const key = this.getKeyForPosition(row, col);
        const sound = this.soundSettings[`${row}-${col}`];

        pad.innerHTML = `
                    <div class="drum-pad-label">${key.toUpperCase()}</div>
                    <div class="drum-pad-sound">${sound}</div>
                `;

        pad.addEventListener("click", () => this.triggerPad(row, col));
        grid.appendChild(pad);
      }
    }
  }

  getKeyForPosition(row, col) {
    const keys = [
      "1",
      "2",
      "3",
      "4",
      "q",
      "w",
      "e",
      "r",
      "a",
      "s",
      "d",
      "f",
      "z",
      "x",
      "c",
      "v",
    ];
    return keys[row * 4 + col];
  }

  setupEventListeners() {
    // Keyboard event listeners
    document.addEventListener("keydown", (e) => {
      if (this.keyMapping[e.key.toLowerCase()]) {
        e.preventDefault();
        const { row, col } = this.keyMapping[e.key.toLowerCase()];
        this.triggerPad(row, col);
      }
    });

    // Button event listeners
    document
      .getElementById("play-btn")
      .addEventListener("click", () => this.playPattern());
    document
      .getElementById("stop-btn")
      .addEventListener("click", () => this.stopPattern());
    document
      .getElementById("copy-code")
      .addEventListener("click", () => this.copyCode());

    // Settings modal
    const settingsBtn = document.getElementById("settings-btn");
    const modal = document.getElementById("settings-modal");
    const closeBtn = document.querySelector(".close");

    settingsBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  createSettingsModal() {
    const soundGrid = document.getElementById("sound-grid");
    soundGrid.innerHTML = "";

    this.availableSounds.forEach((sound) => {
      const option = document.createElement("div");
      option.className = "sound-option";
      option.dataset.sound = sound.value;

      option.innerHTML = `
                <h4>${sound.name}</h4>
                <p>${sound.description}</p>
            `;

      option.addEventListener("click", () => this.selectSound(sound.value));
      soundGrid.appendChild(option);
    });
  }

  selectSound(soundValue) {
    // Remove previous selection
    document.querySelectorAll(".sound-option").forEach((option) => {
      option.classList.remove("selected");
    });

    // Add selection to clicked option
    document
      .querySelector(`[data-sound="${soundValue}"]`)
      .classList.add("selected");

    // Store the selected sound for the current pad being configured
    this.selectedSound = soundValue;

    // Add click listeners to drum pads for sound assignment
    this.setupSoundAssignment();
  }

  setupSoundAssignment() {
    const pads = document.querySelectorAll(".drum-pad");
    pads.forEach((pad) => {
      pad.addEventListener("click", (e) => {
        if (this.selectedSound) {
          e.stopPropagation();
          const row = parseInt(pad.dataset.row);
          const col = parseInt(pad.dataset.col);
          this.assignSoundToPad(row, col, this.selectedSound);
        }
      });
    });
  }

  assignSoundToPad(row, col, sound) {
    const key = `${row}-${col}`;
    this.soundSettings[key] = sound;

    // Update the pad display
    const pad = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    const soundElement = pad.querySelector(".drum-pad-sound");
    soundElement.textContent = sound;

    // Remove selection
    document.querySelectorAll(".sound-option").forEach((option) => {
      option.classList.remove("selected");
    });
    this.selectedSound = null;
  }

  triggerPad(row, col) {
    if (!this.isInitialized) return;

    const pad = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    const sound = this.soundSettings[`${row}-${col}`];

    // Visual feedback
    pad.classList.add("active", "pressed");
    setTimeout(() => {
      pad.classList.remove("active", "pressed");
    }, 150);

    // Play sound
    try {
      s(sound).play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }

    // Add to pattern
    this.addToPattern(row, col, sound);
  }

  addToPattern(row, col, sound) {
    const timestamp = Date.now();
    this.currentPattern.push({
      row,
      col,
      sound,
      timestamp,
    });

    this.updateCodeDisplay();
  }

  updateCodeDisplay() {
    const codeOutput = document.getElementById("code-output");

    if (this.currentPattern.length === 0) {
      codeOutput.value =
        "// No pattern recorded yet\n// Click pads or press keys to create a pattern";
      return;
    }

    // Group sounds by type
    const soundGroups = {};
    this.currentPattern.forEach((note) => {
      if (!soundGroups[note.sound]) {
        soundGroups[note.sound] = [];
      }
      soundGroups[note.sound].push(note);
    });

    // Generate Strudel code
    let code = "// Generated drum pattern\n";
    code += "d1 $ ";

    const patterns = [];
    Object.keys(soundGroups).forEach((sound) => {
      const notes = soundGroups[sound];
      const pattern = `s("${sound}")`;
      patterns.push(pattern);
    });

    if (patterns.length > 0) {
      code += patterns.join(" ~ ");
    } else {
      code += "silence";
    }

    code += "\n\n// Alternative: Stack patterns\n";
    code += "// d1 $ stack [\n";
    Object.keys(soundGroups).forEach((sound) => {
      code += `//   s("${sound}")\n`;
    });
    code += "// ]";

    codeOutput.value = code;
  }

  playPattern() {
    if (!this.isInitialized) return;

    const codeOutput = document.getElementById("code-output");
    const code = codeOutput.value;

    if (code && !code.startsWith("//")) {
      try {
        evaluate(code);
      } catch (error) {
        console.error("Error evaluating pattern:", error);
        alert("Error playing pattern. Check the generated code.");
      }
    }
  }

  stopPattern() {
    if (!this.isInitialized) return;

    try {
      hush();
    } catch (error) {
      console.error("Error stopping pattern:", error);
    }
  }

  copyCode() {
    const codeOutput = document.getElementById("code-output");
    codeOutput.select();
    document.execCommand("copy");

    // Visual feedback
    const copyBtn = document.getElementById("copy-code");
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1000);
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.drumPadApp = new DrumPadApp();
});

// Prevent default behavior for keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
    // Allow dev tools
    return;
  }

  // Prevent default for our mapped keys
  if (
    [
      "1",
      "2",
      "3",
      "4",
      "q",
      "w",
      "e",
      "r",
      "a",
      "s",
      "d",
      "f",
      "z",
      "x",
      "c",
      "v",
    ].includes(e.key.toLowerCase())
  ) {
    e.preventDefault();
  }
});



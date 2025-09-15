// Drum Pad Application
class DrumPadApp {
  constructor() {
    this.isStrudelInitialized = false;
    this.currentPattern = [];
    this.selectedSounds = {};
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

    // Default drum sounds for TR-909
    this.defaultSounds = {
      bd: "bd", // Bass drum
      sd: "sd", // Snare drum
      hh: "hh", // Hi-hat
      oh: "oh", // Open hi-hat
      cr: "cr", // Crash
      cp: "cp", // Clap
      rs: "rs", // Rim shot
      lt: "lt", // Low tom
      mt: "mt", // Mid tom
      ht: "ht", // High tom
      cb: "cb", // Cowbell
      cy: "cy", // Cymbal
      sh: "sh", // Shaker
      ag: "ag", // Agogo
      ma: "ma", // Maracas
      wh: "wh", // Whistle
    };

    this.init();
  }

  async init() {
    try {
      // Initialize Strudel
      await this.initStrudel();
      this.setupUI();
      this.setupEventListeners();
      this.generateDrumPadGrid();
      this.populateSoundOptions();
      this.updateCodeDisplay();
    } catch (error) {
      console.error("Failed to initialize:", error);
    }
  }

  async initStrudel() {
    try {
      // Initialize Strudel with TR-909 samples
      initStrudel({
        prebake: () => samples("github:tidalcycles/dirt-samples"),
      });

      this.isStrudelInitialized = true;
      console.log("Strudel initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Strudel:", error);
      throw error;
    }
  }

  setupUI() {
    // Get DOM elements
    this.drumPadGrid = document.getElementById("drumPadGrid");
    this.codeOutput = document.getElementById("codeOutput");
    this.playBtn = document.getElementById("playBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.settingsBtn = document.getElementById("settingsBtn");
    this.settingsModal = document.getElementById("settingsModal");
    this.closeSettingsBtn = document.getElementById("closeSettingsBtn");
    this.copyCodeBtn = document.getElementById("copyCodeBtn");
    this.soundGrid = document.getElementById("soundGrid");
  }

  setupEventListeners() {
    // Play/Stop buttons
    this.playBtn.addEventListener("click", () => this.playPattern());
    this.stopBtn.addEventListener("click", () => this.stopPattern());

    // Settings modal
    this.settingsBtn.addEventListener("click", () => this.openSettings());
    this.closeSettingsBtn.addEventListener("click", () => this.closeSettings());
    this.settingsModal.addEventListener("click", (e) => {
      if (e.target === this.settingsModal) {
        this.closeSettings();
      }
    });

    // Copy code button
    this.copyCodeBtn.addEventListener("click", () => this.copyCode());

    // Keyboard events
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
    document.addEventListener("keyup", (e) => this.handleKeyRelease(e));
  }

  generateDrumPadGrid() {
    this.drumPadGrid.innerHTML = "";

    // Create 4x4 grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const pad = document.createElement("div");
        pad.className = "drum-pad";
        pad.dataset.row = row;
        pad.dataset.col = col;

        // Find the key for this position
        const key = Object.keys(this.keyMapping).find(
          (k) =>
            this.keyMapping[k].row === row && this.keyMapping[k].col === col
        );

        // Set default sound
        const soundKeys = Object.keys(this.defaultSounds);
        const soundIndex = row * 4 + col;
        const defaultSound = soundKeys[soundIndex] || "bd";
        this.selectedSounds[`${row}-${col}`] = defaultSound;

        pad.innerHTML = `
                    <div class="key-label">${key ? key.toUpperCase() : ""}</div>
                    <div class="sound-label">${defaultSound.toUpperCase()}</div>
                `;

        pad.addEventListener("click", () => this.triggerPad(row, col));
        this.drumPadGrid.appendChild(pad);
      }
    }
  }

  populateSoundOptions() {
    this.soundGrid.innerHTML = "";

    // Add pad selection area
    const padSelectionDiv = document.createElement("div");
    padSelectionDiv.className = "pad-selection";
    padSelectionDiv.innerHTML = "<h3>SELECT PAD TO CONFIGURE:</h3>";

    const padGrid = document.createElement("div");
    padGrid.className = "settings-pad-grid";

    // Create mini pad grid for selection
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const miniPad = document.createElement("div");
        miniPad.className = "mini-pad";
        miniPad.dataset.row = row;
        miniPad.dataset.col = col;

        const key = Object.keys(this.keyMapping).find(
          (k) =>
            this.keyMapping[k].row === row && this.keyMapping[k].col === col
        );

        miniPad.innerHTML = `
                    <div class="mini-key">${key ? key.toUpperCase() : ""}</div>
                    <div class="mini-sound">${this.selectedSounds[
                      `${row}-${col}`
                    ].toUpperCase()}</div>
                `;

        miniPad.addEventListener("click", () => this.selectPad(row, col));
        padGrid.appendChild(miniPad);
      }
    }

    padSelectionDiv.appendChild(padGrid);
    this.soundGrid.appendChild(padSelectionDiv);

    // Add sound options
    const soundOptionsDiv = document.createElement("div");
    soundOptionsDiv.className = "sound-options";
    soundOptionsDiv.innerHTML = "<h3>SELECT SOUND:</h3>";

    const soundGrid = document.createElement("div");
    soundGrid.className = "sound-grid-inner";

    Object.entries(this.defaultSounds).forEach(([key, value]) => {
      const option = document.createElement("div");
      option.className = "sound-option";
      option.textContent = key.toUpperCase();
      option.dataset.sound = key;

      option.addEventListener("click", () => this.selectSound(option));
      soundGrid.appendChild(option);
    });

    soundOptionsDiv.appendChild(soundGrid);
    this.soundGrid.appendChild(soundOptionsDiv);

    // Add buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "settings-buttons";

    const applyBtn = document.createElement("button");
    applyBtn.className = "control-btn";
    applyBtn.textContent = "APPLY SOUND";
    applyBtn.addEventListener("click", () => this.applySoundToPad());

    const clearBtn = document.createElement("button");
    clearBtn.className = "control-btn";
    clearBtn.textContent = "CLEAR PATTERN";
    clearBtn.addEventListener("click", () => this.clearPattern());

    buttonContainer.appendChild(applyBtn);
    buttonContainer.appendChild(clearBtn);
    this.soundGrid.appendChild(buttonContainer);
  }

  selectPad(row, col) {
    // Remove previous pad selection
    this.soundGrid.querySelectorAll(".mini-pad").forEach((pad) => {
      pad.classList.remove("selected");
    });

    // Add selection to clicked pad
    const selectedPad = this.soundGrid.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    selectedPad.classList.add("selected");

    // Store selected pad
    this.currentSelectedPad = { row, col };

    // Highlight current sound
    const currentSound = this.selectedSounds[`${row}-${col}`];
    this.soundGrid.querySelectorAll(".sound-option").forEach((opt) => {
      opt.classList.remove("selected");
      if (opt.dataset.sound === currentSound) {
        opt.classList.add("selected");
      }
    });
  }

  selectSound(optionElement) {
    // Remove previous selection
    this.soundGrid.querySelectorAll(".sound-option").forEach((opt) => {
      opt.classList.remove("selected");
    });

    // Add selection to clicked option
    optionElement.classList.add("selected");

    // Store selected sound
    this.currentSelectedSound = optionElement.dataset.sound;
  }

  applySoundToPad() {
    if (!this.currentSelectedPad || !this.currentSelectedSound) {
      alert("Please select both a pad and a sound");
      return;
    }

    const { row, col } = this.currentSelectedPad;
    this.updatePadSound(row, col, this.currentSelectedSound);

    // Update mini pad display
    const miniPad = this.soundGrid.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    const miniSound = miniPad.querySelector(".mini-sound");
    miniSound.textContent = this.currentSelectedSound.toUpperCase();

    // Show confirmation
    const applyBtn = this.soundGrid.querySelector(".control-btn");
    const originalText = applyBtn.textContent;
    applyBtn.textContent = "APPLIED!";
    setTimeout(() => {
      applyBtn.textContent = originalText;
    }, 1000);
  }

  triggerPad(row, col) {
    if (!this.isStrudelInitialized) return;

    const sound = this.selectedSounds[`${row}-${col}`];
    const padElement = this.drumPadGrid.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );

    // Visual feedback
    padElement.classList.add("active");
    setTimeout(() => {
      padElement.classList.remove("active");
    }, 150);

    // Play sound
    this.playSound(sound);

    // Add to pattern
    this.addToPattern(sound);
  }

  playSound(sound) {
    try {
      // Play individual sound using Strudel
      evaluate(`s("${sound}").bank("tr909").play()`);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  addToPattern(sound) {
    // Add sound to current pattern
    this.currentPattern.push(sound);
    this.updateCodeDisplay();
  }

  updateCodeDisplay() {
    if (this.currentPattern.length === 0) {
      this.codeOutput.textContent = '$: s("").bank("tr909")';
      return;
    }

    // Create pattern string
    const patternString = this.currentPattern.join(" ");
    this.codeOutput.textContent = `$: s("${patternString}").bank("tr909")`;
  }

  playPattern() {
    if (!this.isStrudelInitialized || this.currentPattern.length === 0) return;

    try {
      const patternString = this.currentPattern.join(" ");
      evaluate(`s("${patternString}").bank("tr909").play()`);
    } catch (error) {
      console.error("Error playing pattern:", error);
    }
  }

  stopPattern() {
    if (!this.isStrudelInitialized) return;

    try {
      hush();
    } catch (error) {
      console.error("Error stopping pattern:", error);
    }
  }

  handleKeyPress(event) {
    const key = event.key.toLowerCase();

    if (this.keyMapping[key]) {
      event.preventDefault();
      const { row, col } = this.keyMapping[key];
      this.triggerPad(row, col);
    }
  }

  handleKeyRelease(event) {
    // Handle key release if needed
  }

  openSettings() {
    this.settingsModal.style.display = "block";
  }

  closeSettings() {
    this.settingsModal.style.display = "none";
  }

  copyCode() {
    const code = this.codeOutput.textContent;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        // Visual feedback
        const originalText = this.copyCodeBtn.textContent;
        this.copyCodeBtn.textContent = "COPIED!";
        setTimeout(() => {
          this.copyCodeBtn.textContent = originalText;
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy code:", err);
      });
  }

  // Method to update sound for a specific pad
  updatePadSound(row, col, sound) {
    this.selectedSounds[`${row}-${col}`] = sound;

    // Update visual display
    const padElement = this.drumPadGrid.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    const soundLabel = padElement.querySelector(".sound-label");
    soundLabel.textContent = sound.toUpperCase();
  }

  clearPattern() {
    this.currentPattern = [];
    this.updateCodeDisplay();

    // Show confirmation
    const clearBtn = this.soundGrid.querySelector(".control-btn:last-child");
    const originalText = clearBtn.textContent;
    clearBtn.textContent = "CLEARED!";
    setTimeout(() => {
      clearBtn.textContent = originalText;
    }, 1000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DrumPadApp();
});

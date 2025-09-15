import {
  initStrudel,
  evaluate,
  hush,
} from "./node_modules/@strudel/web/dist/index.mjs";

class DrumPad {
  constructor() {
    this.strudel = null;
    this.isPlaying = false;
    this.bpm = 120;
    this.selectedSounds = {};
    this.activePads = new Set();

    // Keyboard mapping: 1234qwerasdfzxcv
    this.keyMap = {
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

    // Default sounds for each pad
    this.defaultSounds = [
      ["bd", "sd", "hh", "oh"],
      ["cp", "rim", "shaker", "tamb"],
      ["kick", "snare", "hat", "crash"],
      ["tom1", "tom2", "tom3", "tom4"],
    ];

    this.init();
  }

  async init() {
    try {
      // Initialize Strudel
      this.strudel = await initStrudel();

      this.createDrumPadGrid();
      this.setupEventListeners();
      this.initializeSounds();
      this.updateStrudelCode();

      console.log("Drum pad initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Strudel:", error);
    }
  }

  createDrumPadGrid() {
    const grid = document.getElementById("drumPadGrid");
    grid.innerHTML = "";

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const pad = document.createElement("div");
        pad.className = "drum-pad";
        pad.dataset.row = row;
        pad.dataset.col = col;

        // Add key label
        const keyLabel = document.createElement("div");
        keyLabel.className = "key-label";
        keyLabel.textContent = this.getKeyForPosition(row, col);
        pad.appendChild(keyLabel);

        // Add sound label
        const soundLabel = document.createElement("div");
        soundLabel.className = "sound-label";
        soundLabel.textContent = this.defaultSounds[row][col];
        pad.appendChild(soundLabel);

        pad.addEventListener("mousedown", () => this.activatePad(row, col));
        pad.addEventListener("mouseup", () => this.deactivatePad(row, col));
        pad.addEventListener("mouseleave", () => this.deactivatePad(row, col));

        grid.appendChild(pad);
      }
    }
  }

  getKeyForPosition(row, col) {
    const keys = [
      ["1", "2", "3", "4"],
      ["q", "w", "e", "r"],
      ["a", "s", "d", "f"],
      ["z", "x", "c", "v"],
    ];
    return keys[row][col];
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (this.keyMap[key]) {
        e.preventDefault();
        const { row, col } = this.keyMap[key];
        this.activatePad(row, col);
      }
    });

    document.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase();
      if (this.keyMap[key]) {
        e.preventDefault();
        const { row, col } = this.keyMap[key];
        this.deactivatePad(row, col);
      }
    });

    // Play button
    document.getElementById("playBtn").addEventListener("click", () => {
      this.togglePlayback();
    });

    // BPM control
    document.getElementById("bpm").addEventListener("input", (e) => {
      this.bpm = parseInt(e.target.value);
      // Note: Strudel Web handles BPM through pattern code
    });

    // Settings modal
    document.getElementById("settingsBtn").addEventListener("click", () => {
      this.openSettings();
    });

    document.getElementById("closeSettings").addEventListener("click", () => {
      this.closeSettings();
    });

    // Close modal when clicking outside
    document.getElementById("settingsModal").addEventListener("click", (e) => {
      if (e.target.id === "settingsModal") {
        this.closeSettings();
      }
    });
  }

  initializeSounds() {
    // Initialize selected sounds with defaults
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const key = `${row}-${col}`;
        this.selectedSounds[key] = this.defaultSounds[row][col];
      }
    }
  }

  activatePad(row, col) {
    const pad = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    if (pad && !pad.classList.contains("active")) {
      pad.classList.add("active");
      this.activePads.add(`${row}-${col}`);
      this.updateStrudelCode();
      this.playSound(row, col);
    }
  }

  deactivatePad(row, col) {
    const pad = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    if (pad) {
      pad.classList.remove("active");
      this.activePads.delete(`${row}-${col}`);
      this.updateStrudelCode();
    }
  }

  playSound(row, col) {
    if (!this.strudel) return;

    const sound = this.selectedSounds[`${row}-${col}`];
    const code = `$: s("${sound}").bank("tr909")`;

    try {
      evaluate(code, true);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  updateStrudelCode() {
    const codeElement = document.getElementById("strudelCode");

    if (this.activePads.size === 0) {
      codeElement.textContent = '$: s("bd").bank("tr909")';
      return;
    }

    const sounds = Array.from(this.activePads).map((key) => {
      return this.selectedSounds[key];
    });

    const code = `$: s("${sounds.join(" ")}").bank("tr909")`;
    codeElement.textContent = code;
  }

  togglePlayback() {
    const playBtn = document.getElementById("playBtn");

    if (!this.isPlaying) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  startPlayback() {
    if (!this.strudel) return;

    const sounds = Array.from(this.activePads).map((key) => {
      return this.selectedSounds[key];
    });

    if (sounds.length === 0) {
      // Play a basic 8-beat pattern if no pads are active
      const code = `$: s("hh*4, bd sd").bank("tr909")`;
      evaluate(code, true);
    } else {
      const code = `$: s("${sounds.join(" ")}").bank("tr909")`;
      evaluate(code, true);
    }

    this.isPlaying = true;
    document.getElementById("playBtn").textContent = "STOP";
    document.getElementById("playBtn").classList.add("active");
  }

  stopPlayback() {
    if (!this.strudel) return;

    hush();
    this.isPlaying = false;
    document.getElementById("playBtn").textContent = "PLAY";
    document.getElementById("playBtn").classList.remove("active");
  }

  openSettings() {
    this.populateSoundOptions();
    document.getElementById("settingsModal").style.display = "block";
  }

  closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
  }

  populateSoundOptions() {
    const soundGrid = document.getElementById("soundGrid");
    soundGrid.innerHTML = "";

    // Common drum sounds from Strudel
    const soundOptions = [
      "bd",
      "sd",
      "hh",
      "oh",
      "cp",
      "rim",
      "shaker",
      "tamb",
      "kick",
      "snare",
      "hat",
      "crash",
      "tom1",
      "tom2",
      "tom3",
      "tom4",
      "clap",
      "perc",
      "bell",
      "ride",
      "openhat",
      "closedhat",
      "hihat",
    ];

    soundOptions.forEach((sound) => {
      const option = document.createElement("div");
      option.className = "sound-option";
      option.textContent = sound;
      option.addEventListener("click", () => this.selectSound(sound));
      soundGrid.appendChild(option);
    });
  }

  selectSound(sound) {
    // Remove previous selection
    document.querySelectorAll(".sound-option").forEach((opt) => {
      opt.classList.remove("selected");
    });

    // Add selection to clicked option
    event.target.classList.add("selected");

    // Store the selected sound for the next pad click
    this.tempSelectedSound = sound;

    // Add click listeners to pads for sound assignment
    this.addSoundAssignmentListeners();
  }

  addSoundAssignmentListeners() {
    const pads = document.querySelectorAll(".drum-pad");

    const assignSound = (e) => {
      const row = parseInt(e.currentTarget.dataset.row);
      const col = parseInt(e.currentTarget.dataset.col);
      const key = `${row}-${col}`;

      this.selectedSounds[key] = this.tempSelectedSound;

      // Update the sound label on the pad
      const soundLabel = e.currentTarget.querySelector(".sound-label");
      soundLabel.textContent = this.tempSelectedSound;

      // Remove listeners
      pads.forEach((pad) => {
        pad.removeEventListener("click", assignSound);
      });

      // Close settings
      this.closeSettings();
    };

    pads.forEach((pad) => {
      pad.addEventListener("click", assignSound);
    });
  }
}

// Initialize the drum pad when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new DrumPad();
});

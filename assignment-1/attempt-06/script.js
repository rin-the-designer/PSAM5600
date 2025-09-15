// MIDI Drum Pad - Strudel Web Implementation
// Features: 4x4 pad grid, Web Audio, Strudel integration, dark mode UI

import { SampleManager } from "./samples.js";

class DrumPadApp {
  constructor() {
    // Audio system
    this.audioContext = null;
    this.masterGain = null;
    this.sampleBuffers = new Map();
    this.padGains = new Map();
    this.isAudioEnabled = false;
    this.audioContextSuspended = true;

    // Sample management
    this.sampleManager = new SampleManager();
    this.currentBank = "tr909";
    this.availableBanks = this.sampleManager.getAvailableBanks();
    this.isPlaying = false;
    this.bpm = 120;

    // Pad configuration
    this.padLayout = [
      ["1", "2", "3", "4"],
      ["q", "w", "e", "r"],
      ["a", "s", "d", "f"],
      ["z", "x", "c", "v"],
    ];

    // Sample mappings for keys to samples
    this.sampleMappings = [
      "hh",
      "oh",
      "cr",
      "rd",
      "bd",
      "sd",
      "rim",
      "clap",
      "lt",
      "mt",
      "ht",
      "perc",
      "cb",
      "cy",
      "tambourine",
      "click",
    ];

    // State management
    this.keyStates = new Map();
    this.activeTimeout = new Map();

    // Initialize the app
    this.init();
  }

  async init() {
    try {
      await this.initializeAudio();
      this.createPadGrid();
      this.setupEventListeners();
      await this.loadSamples();
      this.loadSettings();
      this.checkAudioState();
    } catch (error) {
      this.showToast("Initialization error: " + error.message, "error");
    }
  }

  async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        latencyHint: "interactive",
      });

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);

      // Create gain nodes for each pad
      this.padLayout.flat().forEach((key) => {
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.masterGain);
        this.padGains.set(key, gainNode);
      });

      this.audioContextSuspended = this.audioContext.state === "suspended";
    } catch (error) {
      throw new Error("Failed to initialize audio context: " + error.message);
    }
  }

  async loadSamples() {
    const loadingPromises = [];
    const keys = this.padLayout.flat();

    keys.forEach((key, index) => {
      const sampleName = this.sampleMappings[index];
      loadingPromises.push(this.loadSample(key, sampleName));
    });

    await Promise.allSettled(loadingPromises);
  }

  async loadSample(key, sampleName) {
    try {
      this.updatePadDisplay(key, true);
      const audioBuffer = await this.sampleManager.loadSample(
        sampleName,
        this.currentBank,
        this.audioContext
      );
      this.sampleBuffers.set(key, audioBuffer);
      this.updatePadDisplay(key, false);
    } catch (error) {
      console.warn(`Failed to load sample for key ${key}:`, error);
      this.disablePad(key);
      this.showToast(
        `Failed to load sample for ${key}: ${error.message}`,
        "warning"
      );
    }
  }

  createPadGrid() {
    const padGrid = document.getElementById("padGrid");
    padGrid.innerHTML = "";

    this.padLayout.forEach((row, rowIndex) => {
      row.forEach((key, colIndex) => {
        const pad = document.createElement("div");
        pad.className = "pad loading";
        pad.dataset.key = key;
        pad.dataset.row = rowIndex;
        pad.dataset.col = colIndex;

        const index = rowIndex * 4 + colIndex;
        const sampleName = this.sampleMappings[index];
        const displayName = this.sampleManager.getSampleDisplayName(sampleName);

        pad.innerHTML = `
                    <div class="sample-name">${displayName}</div>
                    <div class="key-label">${key.toUpperCase()}</div>
                `;

        // Add event listeners for mouse/touch
        pad.addEventListener("mousedown", (e) => this.handlePadTrigger(key, e));
        pad.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            this.handlePadTrigger(key, e);
          },
          { passive: false }
        );

        padGrid.appendChild(pad);
      });
    });
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));

    // Transport controls
    document
      .getElementById("playStopBtn")
      .addEventListener("click", () => this.togglePlayback());
    document.getElementById("bpmInput").addEventListener("change", (e) => {
      this.bpm = parseInt(e.target.value);
      localStorage.setItem("drumPadBpm", this.bpm);
      this.updatePattern();
    });

    // Settings
    document
      .getElementById("settingsBtn")
      .addEventListener("click", () => this.showSettings());
    document
      .getElementById("closeSettingsBtn")
      .addEventListener("click", () => this.hideSettings());
    document
      .getElementById("saveSettingsBtn")
      .addEventListener("click", () => this.saveSettings());

    // Code editor
    document
      .getElementById("strudelCode")
      .addEventListener("input", () => this.updatePattern());
    document
      .getElementById("clearPatternBtn")
      .addEventListener("click", () => this.clearPattern());

    // Enable sound overlay
    document
      .getElementById("enableSoundBtn")
      .addEventListener("click", () => this.enableSound());

    // Handle visibility changes for mobile Safari
    document.addEventListener("visibilitychange", () => {
      if (
        !document.hidden &&
        this.audioContext &&
        this.audioContext.state === "suspended"
      ) {
        this.resumeAudioContext();
      }
    });

    // Handle page unload
    window.addEventListener("beforeunload", () => {
      if (this.audioContext) {
        this.audioContext.close();
      }
    });
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();

    // Prevent autorepeat
    if (this.keyStates.get(key)) {
      return;
    }

    if (this.padLayout.flat().includes(key)) {
      e.preventDefault();
      this.keyStates.set(key, true);
      this.handlePadTrigger(key, e);
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    this.keyStates.set(key, false);
  }

  async handlePadTrigger(key, event) {
    if (!this.isAudioEnabled) {
      this.showEnableSoundOverlay();
      return;
    }

    if (!this.sampleBuffers.has(key)) {
      return; // Pad is disabled or sample not loaded
    }

    // Resume audio context if needed
    await this.resumeAudioContext();

    // Play sample immediately
    this.playSample(key);

    // Visual feedback
    this.animatePad(key);

    // Update Strudel pattern
    this.addToPattern(key);
  }

  async playSample(key) {
    if (!this.audioContext || !this.sampleBuffers.has(key)) {
      return;
    }

    try {
      const buffer = this.sampleBuffers.get(key);
      const gainNode = this.padGains.get(key);

      // Create a new source node for each playback
      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = buffer;

      // Create gain envelope to avoid clicks
      const envelopeGain = this.audioContext.createGain();
      sourceNode.connect(envelopeGain);
      envelopeGain.connect(gainNode);

      const now = this.audioContext.currentTime;
      const attackTime = 0.002; // 2ms attack
      const releaseTime = 0.15; // 150ms release

      // Apply envelope
      envelopeGain.gain.setValueAtTime(0, now);
      envelopeGain.gain.linearRampToValueAtTime(1, now + attackTime);
      envelopeGain.gain.exponentialRampToValueAtTime(
        0.01,
        now + buffer.duration + releaseTime
      );

      // Start playback
      sourceNode.start(now);
      sourceNode.stop(now + buffer.duration + releaseTime);
    } catch (error) {
      console.error("Error playing sample:", error);
    }
  }

  animatePad(key) {
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
      pad.classList.add("active");

      // Clear existing timeout
      if (this.activeTimeout.has(key)) {
        clearTimeout(this.activeTimeout.get(key));
      }

      // Remove active class after animation
      const timeout = setTimeout(() => {
        pad.classList.remove("active");
        this.activeTimeout.delete(key);
      }, 150);

      this.activeTimeout.set(key, timeout);
    }
  }

  addToPattern(key) {
    const keyIndex = this.padLayout.flat().indexOf(key);
    const sampleName = this.sampleMappings[keyIndex];
    const codeEditor = document.getElementById("strudelCode");

    // Simple pattern building - append to current line
    const currentPattern = codeEditor.value;

    // Basic implementation: just add sample to a simple sequence
    if (currentPattern.includes("$:")) {
      // Pattern already exists, could enhance this logic
      console.log(`Adding ${sampleName} to pattern`);
    } else {
      // Initialize with basic pattern
      codeEditor.value = `$: s("${sampleName}").bank("${this.currentBank}")`;
    }
  }

  togglePlayback() {
    const button = document.getElementById("playStopBtn");
    const playIcon = button.querySelector(".play-icon");
    const stopIcon = button.querySelector(".stop-icon");
    const btnText = button.querySelector(".btn-text");

    this.isPlaying = !this.isPlaying;
    button.dataset.playing = this.isPlaying;

    if (this.isPlaying) {
      playIcon.classList.add("hidden");
      stopIcon.classList.remove("hidden");
      btnText.textContent = "STOP";
      this.startPlayback();
    } else {
      playIcon.classList.remove("hidden");
      stopIcon.classList.add("hidden");
      btnText.textContent = "PLAY";
      this.stopPlayback();
    }
  }

  startPlayback() {
    // This would integrate with Strudel's evaluation system
    // For now, we'll implement a basic version
    console.log(
      "Starting playback with pattern:",
      document.getElementById("strudelCode").value
    );
  }

  stopPlayback() {
    console.log("Stopping playback");
  }

  updatePattern() {
    if (this.isPlaying) {
      // Re-evaluate pattern if playing
      this.startPlayback();
    }
  }

  clearPattern() {
    document.getElementById("strudelCode").value =
      '$: s("hh*4, bd sd").bank("tr909")';
    this.updatePattern();
  }

  updatePadDisplay(key, loading = true) {
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
      if (loading) {
        pad.classList.add("loading");
      } else {
        pad.classList.remove("loading");
      }
    }
  }

  disablePad(key) {
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
      pad.classList.add("disabled");
      pad.classList.remove("loading");
    }
  }

  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        this.audioContextSuspended = false;
        this.hideEnableSoundOverlay();
      } catch (error) {
        console.error("Failed to resume audio context:", error);
      }
    }
  }

  async enableSound() {
    try {
      await this.resumeAudioContext();
      this.isAudioEnabled = true;
      this.hideEnableSoundOverlay();
    } catch (error) {
      this.showToast("Failed to enable sound: " + error.message, "error");
    }
  }

  checkAudioState() {
    if (this.audioContextSuspended && !this.isAudioEnabled) {
      this.showEnableSoundOverlay();
    }
  }

  showEnableSoundOverlay() {
    document.getElementById("enableSoundOverlay").classList.remove("hidden");
  }

  hideEnableSoundOverlay() {
    document.getElementById("enableSoundOverlay").classList.add("hidden");
  }

  showSettings() {
    // Populate bank options
    const bankSelect = document.getElementById("bankSelect");
    bankSelect.innerHTML = "";
    this.availableBanks.forEach((bank) => {
      const option = document.createElement("option");
      option.value = bank;
      option.textContent = bank.toUpperCase();
      if (bank === this.currentBank) {
        option.selected = true;
      }
      bankSelect.appendChild(option);
    });

    document.getElementById("settingsModal").classList.remove("hidden");
  }

  hideSettings() {
    document.getElementById("settingsModal").classList.add("hidden");
  }

  async saveSettings() {
    const newBank = document.getElementById("bankSelect").value;

    if (newBank !== this.currentBank) {
      this.currentBank = newBank;
      localStorage.setItem("drumPadBank", newBank);

      // Reload samples for new bank
      this.sampleBuffers.clear();
      this.createPadGrid(); // Recreate grid with new labels
      await this.loadSamples();
    }

    this.hideSettings();
  }

  loadSettings() {
    const savedBank = localStorage.getItem("drumPadBank");
    if (savedBank && this.availableBanks.includes(savedBank)) {
      this.currentBank = savedBank;
    }

    // Update BPM from localStorage
    const savedBpm = localStorage.getItem("drumPadBpm");
    if (savedBpm) {
      this.bpm = parseInt(savedBpm);
      document.getElementById("bpmInput").value = this.bpm;
    }
  }

  showToast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DrumPadApp();
});

// Handle module loading errors
window.addEventListener("error", (e) => {
  console.error("Application error:", e.error);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
});

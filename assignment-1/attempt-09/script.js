// MIDI Drum Pad with Strudel Web Integration
class DrumPad {
  constructor() {
    this.isInitialized = false;
    this.isPlaying = false;
    this.padModeActive = false;
    this.currentPattern = '$: s("hh*4, bd sd")';
    this.bpm = 120;
    this.volume = 75;
    this.sensitivity = 5;

    // Wait for DOM and Strudel to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      // Wait for Strudel functions to be available
      await this.waitForStrudel();

      // Check audio context state
      await this.handleAudioContext();

      // Initialize UI components
      this.initializeElements();
      this.bindEvents();
      this.setupKeyboardHandling();
      this.updatePatternEditor();

      console.log("Drum Pad initialized successfully");
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Drum Pad:", error);
      this.showError("Failed to initialize. Please refresh the page.");
    }
  }

  async waitForStrudel() {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      // Check for functions in order of preference
      if (
        typeof evaluate !== "undefined" &&
        typeof samples !== "undefined" &&
        typeof hush !== "undefined"
      ) {
        return true;
      }

      if (window.evaluate && window.samples && window.hush) {
        // Make global references
        window.evaluate = window.evaluate;
        window.samples = window.samples;
        window.hush = window.hush;
        return true;
      }

      if (window.strudel && window.strudel.evaluate) {
        // Make global references from nested object
        window.evaluate = window.strudel.evaluate;
        window.samples = window.strudel.samples;
        window.hush = window.strudel.hush;
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    throw new Error("Strudel Web functions not available after timeout");
  }

  async handleAudioContext() {
    // Check for suspended audio context
    if (
      typeof AudioContext !== "undefined" ||
      typeof webkitAudioContext !== "undefined"
    ) {
      const context = new (window.AudioContext || window.webkitAudioContext)();

      if (context.state === "suspended") {
        this.showEnableSoundOverlay();
      }
    }
  }

  showEnableSoundOverlay() {
    const overlay = document.getElementById("enable-sound-overlay");
    const enableBtn = document.getElementById("enable-sound-btn");

    overlay.classList.remove("hidden");

    enableBtn.addEventListener("click", async () => {
      try {
        // Resume audio context
        const context = new (window.AudioContext ||
          window.webkitAudioContext)();
        await context.resume();

        // Test Strudel with a simple sound
        this.playPad("bd");

        overlay.classList.add("hidden");
      } catch (error) {
        console.error("Failed to enable audio:", error);
      }
    });
  }

  initializeElements() {
    // Get all necessary DOM elements
    this.elements = {
      padGrid: document.getElementById("drum-pad-grid"),
      pads: document.querySelectorAll(".pad"),
      playBtn: document.getElementById("play-btn"),
      stopBtn: document.getElementById("stop-btn"),
      bpmInput: document.getElementById("bpm-input"),
      patternEditor: document.getElementById("pattern-editor"),
      clearPatternBtn: document.getElementById("clear-pattern"),
      padModeToggle: document.getElementById("pad-mode-toggle"),
      padModeStatus: document.getElementById("pad-mode-status"),
      settingsBtn: document.getElementById("settings-btn"),
      settingsModal: document.getElementById("settings-modal"),
      closeSettings: document.getElementById("close-settings"),
      volumeControl: document.getElementById("volume-control"),
      volumeDisplay: document.getElementById("volume-display"),
      sensitivityControl: document.getElementById("sensitivity-control"),
      sensitivityDisplay: document.getElementById("sensitivity-display"),
    };

    // Set initial values
    this.elements.bpmInput.value = this.bpm;
    this.elements.patternEditor.value = this.currentPattern;
    this.elements.volumeControl.value = this.volume;
    this.elements.sensitivityControl.value = this.sensitivity;
  }

  bindEvents() {
    // Pad click events
    this.elements.pads.forEach((pad) => {
      pad.addEventListener("click", (e) => {
        const sound = pad.getAttribute("data-sound");
        this.triggerPad(pad, sound);
      });
    });

    // Transport controls
    this.elements.playBtn.addEventListener("click", () => this.play());
    this.elements.stopBtn.addEventListener("click", () => this.stop());

    // BPM control
    this.elements.bpmInput.addEventListener("input", (e) => {
      this.bpm = Math.max(60, Math.min(200, parseInt(e.target.value) || 120));
      this.elements.bpmInput.value = this.bpm;
    });

    // Pattern editor
    this.elements.patternEditor.addEventListener("input", (e) => {
      this.currentPattern = e.target.value;
    });

    this.elements.clearPatternBtn.addEventListener("click", () => {
      this.currentPattern = "";
      this.elements.patternEditor.value = "";
    });

    // Pad mode toggle
    this.elements.padModeToggle.addEventListener("click", () => {
      this.togglePadMode();
    });

    // Settings modal
    this.elements.settingsBtn.addEventListener("click", () => {
      this.elements.settingsModal.classList.remove("hidden");
    });

    this.elements.closeSettings.addEventListener("click", () => {
      this.elements.settingsModal.classList.add("hidden");
    });

    // Settings controls
    this.elements.volumeControl.addEventListener("input", (e) => {
      this.volume = parseInt(e.target.value);
      this.elements.volumeDisplay.textContent = this.volume + "%";
    });

    this.elements.sensitivityControl.addEventListener("input", (e) => {
      this.sensitivity = parseInt(e.target.value);
      this.elements.sensitivityDisplay.textContent = this.sensitivity;
    });

    // Click outside to close modal
    this.elements.settingsModal.addEventListener("click", (e) => {
      if (e.target === this.elements.settingsModal) {
        this.elements.settingsModal.classList.add("hidden");
      }
    });

    // Click outside pad grid to deactivate pad mode
    document.addEventListener("click", (e) => {
      if (
        this.padModeActive &&
        !this.elements.padGrid.contains(e.target) &&
        e.target !== this.elements.padModeToggle
      ) {
        this.deactivatePadMode();
      }
    });
  }

  setupKeyboardHandling() {
    // Keyboard event handling with proper focus management
    document.addEventListener("keydown", (e) => {
      // Only handle keys when pad mode is active or pad grid has focus
      const shouldHandleKey =
        this.padModeActive || document.activeElement === this.elements.padGrid;

      if (!shouldHandleKey) {
        return;
      }

      // Ignore if active element is input, textarea, or contenteditable
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.contentEditable === "true" ||
          activeElement === this.elements.patternEditor)
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (preserve browser shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Handle escape key
      if (e.key === "Escape") {
        this.deactivatePadMode();
        this.elements.padGrid.blur();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Handle pad keys
      const key = e.key.toLowerCase();
      const validKeys = "1234qwerasdfzxcv";

      if (validKeys.includes(key)) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (pad) {
          const sound = pad.getAttribute("data-sound");
          this.triggerPad(pad, sound);

          // Only prevent default when in pad mode
          if (this.padModeActive) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    });

    // Focus handling for pad grid
    this.elements.padGrid.addEventListener("focus", () => {
      // Visual indicator that pad grid is focused
    });

    this.elements.padGrid.addEventListener("blur", () => {
      // Remove visual indicator when focus is lost
    });
  }

  togglePadMode() {
    if (this.padModeActive) {
      this.deactivatePadMode();
    } else {
      this.activatePadMode();
    }
  }

  activatePadMode() {
    this.padModeActive = true;
    this.elements.padModeStatus.textContent = "PAD MODE: ON";
    this.elements.padModeStatus.classList.add("active");
    this.elements.padGrid.focus();
  }

  deactivatePadMode() {
    this.padModeActive = false;
    this.elements.padModeStatus.textContent = "PAD MODE: OFF";
    this.elements.padModeStatus.classList.remove("active");
  }

  triggerPad(padElement, sound) {
    // Visual feedback
    padElement.classList.add("triggered");
    setTimeout(() => {
      padElement.classList.remove("triggered");
    }, 100);

    // Play sound
    this.playPad(sound);

    // Update pattern if not playing transport
    if (!this.isPlaying) {
      this.appendToPattern(sound);
    }
  }

  playPad(sound) {
    try {
      // Apply volume scaling
      const volumeScale = this.volume / 100;

      // Use Strudel to play individual sound
      if (typeof evaluate !== "undefined") {
        evaluate(`once $ s("${sound}").gain(${volumeScale})`);
      } else if (window.evaluate) {
        window.evaluate(`once $ s("${sound}").gain(${volumeScale})`);
      } else {
        console.warn("Strudel evaluate function not available");
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  appendToPattern(sound) {
    // Add sound to current pattern
    if (this.currentPattern.trim() === "") {
      this.currentPattern = `$: s("${sound}")`;
    } else {
      // Extract the pattern content between quotes
      const match = this.currentPattern.match(/s\("([^"]*)"\)/);
      if (match) {
        const currentSounds = match[1];
        const newPattern = currentSounds ? `${currentSounds} ${sound}` : sound;
        this.currentPattern = this.currentPattern.replace(
          /s\("[^"]*"\)/,
          `s("${newPattern}")`
        );
      } else {
        // Fallback: append to end
        this.currentPattern += ` ${sound}`;
      }
    }

    this.updatePatternEditor();
  }

  updatePatternEditor() {
    if (this.elements.patternEditor.value !== this.currentPattern) {
      this.elements.patternEditor.value = this.currentPattern;
    }
  }

  async play() {
    if (this.isPlaying) {
      return;
    }

    try {
      // Get current pattern from editor
      const pattern = this.elements.patternEditor.value.trim();

      if (!pattern) {
        console.warn("No pattern to play");
        return;
      }

      // Set BPM if needed
      if (typeof cpm !== "undefined") {
        evaluate(`cpm(${this.bpm})`);
      }

      // Evaluate the pattern
      if (typeof evaluate !== "undefined") {
        evaluate(pattern);
      } else if (window.evaluate) {
        window.evaluate(pattern);
      } else {
        throw new Error("Evaluate function not available");
      }

      this.isPlaying = true;
      this.elements.playBtn.textContent = "PLAYING";
      this.elements.playBtn.classList.add("playing");
    } catch (error) {
      console.error("Error playing pattern:", error);
      this.showError("Error playing pattern. Check syntax.");
    }
  }

  stop() {
    try {
      // Use multiple stop methods for reliability

      // Method 1: Primary stop using hush
      if (typeof hush !== "undefined") {
        hush();
      } else if (window.hush) {
        window.hush();
      }

      // Method 2: Spiral control
      if (typeof spiral !== "undefined" && spiral.stop) {
        spiral.stop();
      } else if (window.spiral && window.spiral.stop) {
        window.spiral.stop();
      }

      // Method 3: Silence evaluation
      if (typeof evaluate !== "undefined") {
        evaluate("silence");
      } else if (window.evaluate) {
        window.evaluate("silence");
      }
    } catch (error) {
      console.error("Error stopping playback:", error);
    }

    this.isPlaying = false;
    this.elements.playBtn.textContent = "PLAY";
    this.elements.playBtn.classList.remove("playing");
  }

  showError(message) {
    // Simple error display - could be enhanced with a modal
    console.error(message);
    alert(message);
  }
}

// Handle browser permissions policy warnings
window.addEventListener("error", (e) => {
  if (
    e.message.includes("Permissions-Policy") &&
    e.message.includes("browsing-topics")
  ) {
    // Ignore permissions policy warnings about browsing-topics
    e.preventDefault();
    return false;
  }
});

// Initialize the drum pad when script loads
const drumPad = new DrumPad();

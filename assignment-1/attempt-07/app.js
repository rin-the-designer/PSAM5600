// Strudel MIDI Drum Pad Application
class DrumPadApp {
  constructor() {
    // Audio system
    this.audioContext = null;
    this.samples = new Map();
    this.currentBank = "tr909";

    // Strudel integration
    this.strudel = null;
    this.isPlaying = false;
    this.currentPattern = [];

    // UI elements
    this.pads = [];
    this.codeEditor = null;
    this.bpmInput = null;

    // Sound mappings
    this.soundMap = {
      1: "bd",
      2: "sd",
      3: "hh",
      4: "oh",
      q: "rim",
      w: "clap",
      e: "lt",
      r: "mt",
      a: "ht",
      s: "cr",
      d: "cy",
      f: "cb",
      z: "perc",
      x: "rd",
      c: "click",
      v: "tambourine",
    };

    // Initialization
    this.init();
  }

  async init() {
    try {
      console.log("Initializing Drum Pad App...");

      // Initialize audio context
      this.initAudioContext();

      // Load saved settings
      this.loadSettings();

      // Setup UI event listeners
      this.setupUI();

      // Load samples for current bank
      await this.loadSamples(this.currentBank);

      // Initialize Strudel
      await this.initStrudel();

      // Setup keyboard listeners
      this.setupKeyboardListeners();

      console.log("Drum Pad App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.showToast("Failed to initialize app: " + error.message, "error");
    }
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        latencyHint: "interactive",
      });

      // Check if context needs to be resumed
      if (this.audioContext.state === "suspended") {
        this.showEnableSoundOverlay();
      }

      console.log("AudioContext initialized:", this.audioContext.state);
    } catch (error) {
      console.error("Failed to create AudioContext:", error);
      throw new Error("Web Audio not supported in this browser");
    }
  }

  showEnableSoundOverlay() {
    const overlay = document.getElementById("enable-sound-overlay");
    const enableBtn = document.getElementById("enable-sound-btn");

    overlay.classList.remove("hidden");

    enableBtn.onclick = async () => {
      try {
        await this.audioContext.resume();
        overlay.classList.add("hidden");
        console.log("AudioContext resumed");
      } catch (error) {
        console.error("Failed to resume AudioContext:", error);
        this.showToast("Failed to enable audio: " + error.message, "error");
      }
    };
  }

  async loadSamples(bankName) {
    console.log(`Loading samples for bank: ${bankName}`);

    const sounds = Object.values(this.soundMap);
    const loadPromises = sounds.map((sound) =>
      this.loadSample(bankName, sound)
    );

    try {
      await Promise.all(loadPromises);
      console.log(`All samples loaded for bank: ${bankName}`);
      this.enableAllPads();
    } catch (error) {
      console.error(`Failed to load some samples for bank: ${bankName}`, error);
    }
  }

  async loadSample(bankName, soundName) {
    const url = `./public/samples/${bankName}/${soundName}.wav`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.samples.set(`${bankName}:${soundName}`, audioBuffer);
      console.log(`Loaded sample: ${bankName}:${soundName}`);
    } catch (error) {
      console.error(
        `Failed to load sample ${soundName} from ${bankName}:`,
        error
      );
      this.showToast(
        `Missing sample: ${soundName}.wav in ${bankName}`,
        "error"
      );
      this.disablePad(soundName);
      throw error;
    }
  }

  playSample(soundName) {
    const sampleKey = `${this.currentBank}:${soundName}`;
    const audioBuffer = this.samples.get(sampleKey);

    if (!audioBuffer) {
      console.warn(`Sample not found: ${sampleKey}`);
      return;
    }

    try {
      // Create a new source node for each play (allows overlapping)
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;

      // Short attack/release to avoid clicks
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + 0.01);
      gainNode.gain.setValueAtTime(1, now + audioBuffer.duration - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + audioBuffer.duration);

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();

      console.log(`Played sample: ${sampleKey}`);
    } catch (error) {
      console.error(`Failed to play sample ${sampleKey}:`, error);
    }
  }

  setupUI() {
    // Get UI elements
    this.pads = Array.from(document.querySelectorAll(".pad"));
    this.codeEditor = document.getElementById("code-editor");
    this.bpmInput = document.getElementById("bpm-input");

    // Transport controls
    document
      .getElementById("play-btn")
      .addEventListener("click", () => this.play());
    document
      .getElementById("stop-btn")
      .addEventListener("click", () => this.stop());

    // BPM input
    this.bpmInput.addEventListener("change", (e) =>
      this.setBPM(parseInt(e.target.value))
    );

    // Editor controls
    document
      .getElementById("clear-pattern")
      .addEventListener("click", () => this.clearPattern());
    document
      .getElementById("reset-pattern")
      .addEventListener("click", () => this.resetPattern());

    // Settings modal
    document
      .getElementById("settings-btn")
      .addEventListener("click", () => this.showSettings());
    document
      .getElementById("close-settings")
      .addEventListener("click", () => this.hideSettings());
    document
      .getElementById("apply-settings")
      .addEventListener("click", () => this.applySettings());

    // Pad click listeners
    this.pads.forEach((pad) => {
      pad.addEventListener("click", () => this.hitPad(pad));
      pad.addEventListener("mousedown", () => this.highlightPad(pad, true));
      pad.addEventListener("mouseup", () => this.highlightPad(pad, false));
      pad.addEventListener("mouseleave", () => this.highlightPad(pad, false));
    });

    console.log("UI event listeners setup complete");
  }

  setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (this.soundMap[key]) {
        e.preventDefault();
        const pad = this.findPadByKey(key);
        if (pad) {
          this.hitPad(pad);
        }
      }
    });

    // Resume audio context on first user interaction
    const resumeAudio = () => {
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
    };

    document.addEventListener("click", resumeAudio, { once: true });
    document.addEventListener("keydown", resumeAudio, { once: true });

    console.log("Keyboard listeners setup complete");
  }

  findPadByKey(key) {
    return this.pads.find((pad) => pad.dataset.key === key);
  }

  hitPad(pad) {
    const sound = pad.dataset.sound;
    const key = pad.dataset.key;

    if (pad.classList.contains("disabled")) {
      return;
    }

    // Play sound immediately
    this.playSample(sound);

    // Visual feedback
    this.flashPad(pad);

    // Add to pattern
    this.addToPattern(sound);

    // Update editor
    this.updateEditor();

    console.log(`Hit pad: ${key} (${sound})`);
  }

  flashPad(pad) {
    pad.classList.add("hit");
    setTimeout(() => {
      pad.classList.remove("hit");
    }, 100);
  }

  highlightPad(pad, highlight) {
    if (highlight) {
      pad.classList.add("active");
    } else {
      pad.classList.remove("active");
    }
  }

  addToPattern(sound) {
    this.currentPattern.push(sound);

    // Keep pattern reasonable length
    if (this.currentPattern.length > 32) {
      this.currentPattern = this.currentPattern.slice(-16);
    }
  }

  updateEditor() {
    const patternString = this.currentPattern.join(" ");
    const strudelCode = `$: s("${patternString}").bank("${this.currentBank}")`;
    this.codeEditor.value = strudelCode;
  }

  clearPattern() {
    this.currentPattern = [];
    this.updateEditor();
  }

  resetPattern() {
    this.currentPattern = [];
    this.codeEditor.value = `$: s("hh*4, bd sd").bank("${this.currentBank}")`;
  }

  enableAllPads() {
    this.pads.forEach((pad) => {
      pad.classList.remove("disabled");
    });
  }

  disablePad(soundName) {
    const pad = this.pads.find((p) => p.dataset.sound === soundName);
    if (pad) {
      pad.classList.add("disabled");
    }
  }

  async initStrudel() {
    try {
      console.log("Initializing Strudel...");

      // Wait for Strudel to be available
      await new Promise((resolve) => {
        const checkStrudel = () => {
          if (
            typeof window.evaluate !== "undefined" &&
            typeof window.hush !== "undefined"
          ) {
            resolve();
          } else {
            setTimeout(checkStrudel, 100);
          }
        };
        checkStrudel();
      });

      // Strudel globals are available
      this.strudel = {
        evaluate: window.evaluate,
        hush: window.hush,
        setBPM: window.setBPM || (() => console.warn("setBPM not available")),
      };

      // Set initial BPM
      this.setBPM(120);

      console.log("Strudel initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Strudel:", error);
      // Continue without Strudel - pads will still work
      this.showToast(
        "Strudel sequencer unavailable, pads will work standalone",
        "error"
      );
    }
  }

  async play() {
    if (!this.strudel) {
      this.showToast("Strudel not available", "error");
      return;
    }

    try {
      const code = this.codeEditor.value;

      // Evaluate and play the pattern
      this.strudel.evaluate(code);

      this.isPlaying = true;
      document.getElementById("play-btn").classList.add("active");
      document.getElementById("stop-btn").classList.remove("active");

      console.log("Pattern playing:", code);
    } catch (error) {
      console.error("Failed to play pattern:", error);
      this.showToast("Pattern error: " + error.message, "error");
    }
  }

  stop() {
    if (!this.strudel) {
      return;
    }

    try {
      this.strudel.hush();

      this.isPlaying = false;
      document.getElementById("play-btn").classList.remove("active");
      document.getElementById("stop-btn").classList.add("active");

      console.log("Pattern stopped");
    } catch (error) {
      console.error("Failed to stop pattern:", error);
    }
  }

  setBPM(bpm) {
    if (this.strudel && this.strudel.setBPM) {
      this.strudel.setBPM(bpm);
    }
    console.log("BPM set to:", bpm);
  }

  showSettings() {
    const modal = document.getElementById("settings-modal");
    const bankSelect = document.getElementById("sound-bank");

    bankSelect.value = this.currentBank;
    modal.classList.remove("hidden");
  }

  hideSettings() {
    document.getElementById("settings-modal").classList.add("hidden");
  }

  async applySettings() {
    const bankSelect = document.getElementById("sound-bank");
    const newBank = bankSelect.value;

    if (newBank !== this.currentBank) {
      try {
        await this.loadSamples(newBank);
        this.currentBank = newBank;
        this.saveSettings();
        this.resetPattern();
        this.showToast(`Switched to ${newBank} sound bank`, "success");
      } catch (error) {
        this.showToast(`Failed to load ${newBank} sound bank`, "error");
        bankSelect.value = this.currentBank; // Revert selection
        return;
      }
    }

    this.hideSettings();
  }

  loadSettings() {
    const saved = localStorage.getItem("drumPadSettings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.currentBank = settings.soundBank || "tr909";
        console.log("Settings loaded:", settings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }

  saveSettings() {
    const settings = {
      soundBank: this.currentBank,
    };

    try {
      localStorage.setItem("drumPadSettings", JSON.stringify(settings));
      console.log("Settings saved:", settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        container.removeChild(toast);
      }
    }, 4000);

    console.log(`Toast (${type}):`, message);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.drumPadApp = new DrumPadApp();
});

// Handle Permissions-Policy warnings (ignore them)
const originalWarn = console.warn;
console.warn = function (...args) {
  const message = args.join(" ");
  if (
    message.includes("Permissions-Policy") &&
    message.includes("browsing-topics")
  ) {
    return; // Ignore this specific warning
  }
  originalWarn.apply(console, args);
};

// Sample management for the MIDI Drum Pad
// This module handles loading and management of drum samples

export class SampleManager {
  constructor() {
    this.baseUrl = "./samples/";
    this.fallbackUrls = {
      // Freesound.org hosted samples (replace with actual URLs or local files)
      tr909: {
        hh: "https://cdn.freesound.org/previews/316/316847_5123451-hq.mp3",
        oh: "https://cdn.freesound.org/previews/316/316848_5123451-hq.mp3",
        cr: "https://cdn.freesound.org/previews/316/316849_5123451-hq.mp3",
        rd: "https://cdn.freesound.org/previews/316/316850_5123451-hq.mp3",
        bd: "https://cdn.freesound.org/previews/316/316851_5123451-hq.mp3",
        sd: "https://cdn.freesound.org/previews/316/316852_5123451-hq.mp3",
        rim: "https://cdn.freesound.org/previews/316/316853_5123451-hq.mp3",
        clap: "https://cdn.freesound.org/previews/316/316854_5123451-hq.mp3",
        lt: "https://cdn.freesound.org/previews/316/316855_5123451-hq.mp3",
        mt: "https://cdn.freesound.org/previews/316/316856_5123451-hq.mp3",
        ht: "https://cdn.freesound.org/previews/316/316857_5123451-hq.mp3",
        perc: "https://cdn.freesound.org/previews/316/316858_5123451-hq.mp3",
        cb: "https://cdn.freesound.org/previews/316/316859_5123451-hq.mp3",
        cy: "https://cdn.freesound.org/previews/316/316860_5123451-hq.mp3",
        tambourine:
          "https://cdn.freesound.org/previews/316/316861_5123451-hq.mp3",
        click: "https://cdn.freesound.org/previews/316/316862_5123451-hq.mp3",
      },
    };

    // Generate simple oscillator-based sounds as backup
    this.backupSounds = {
      hh: { type: "noise", frequency: 8000, duration: 0.1, gain: 0.3 },
      oh: { type: "noise", frequency: 6000, duration: 0.3, gain: 0.4 },
      cr: { type: "noise", frequency: 4000, duration: 0.8, gain: 0.5 },
      rd: { type: "noise", frequency: 3000, duration: 0.6, gain: 0.4 },
      bd: { type: "sine", frequency: 60, duration: 0.5, gain: 0.8 },
      sd: { type: "noise", frequency: 2000, duration: 0.2, gain: 0.6 },
      rim: { type: "noise", frequency: 1500, duration: 0.1, gain: 0.5 },
      clap: { type: "noise", frequency: 2500, duration: 0.15, gain: 0.5 },
      lt: { type: "sine", frequency: 80, duration: 0.4, gain: 0.7 },
      mt: { type: "sine", frequency: 120, duration: 0.3, gain: 0.7 },
      ht: { type: "sine", frequency: 200, duration: 0.25, gain: 0.7 },
      perc: { type: "sine", frequency: 400, duration: 0.2, gain: 0.5 },
      cb: { type: "square", frequency: 800, duration: 0.3, gain: 0.4 },
      cy: { type: "noise", frequency: 5000, duration: 1.0, gain: 0.3 },
      tambourine: { type: "noise", frequency: 7000, duration: 0.4, gain: 0.3 },
      click: { type: "square", frequency: 2000, duration: 0.05, gain: 0.5 },
    };
  }

  async loadSample(sampleName, bank, audioContext) {
    // Try to load from local files first
    try {
      const localUrl = `${this.baseUrl}${bank}/${sampleName}.wav`;
      const buffer = await this.fetchAndDecode(localUrl, audioContext);
      return buffer;
    } catch (error) {
      console.log(
        `Local sample not found for ${sampleName}, trying fallback...`
      );
    }

    // Try fallback URLs
    try {
      if (this.fallbackUrls[bank] && this.fallbackUrls[bank][sampleName]) {
        const fallbackUrl = this.fallbackUrls[bank][sampleName];
        const buffer = await this.fetchAndDecode(fallbackUrl, audioContext);
        return buffer;
      }
    } catch (error) {
      console.log(
        `Fallback sample not found for ${sampleName}, generating synthetic...`
      );
    }

    // Generate synthetic sound as last resort
    return this.generateSyntheticSound(sampleName, audioContext);
  }

  async fetchAndDecode(url, audioContext) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  generateSyntheticSound(sampleName, audioContext) {
    const soundConfig =
      this.backupSounds[sampleName] || this.backupSounds["click"];
    const { type, frequency, duration, gain } = soundConfig;

    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const channelData = buffer.getChannelData(0);

    if (type === "noise") {
      // Generate filtered noise
      for (let i = 0; i < length; i++) {
        channelData[i] =
          (Math.random() * 2 - 1) * gain * Math.exp(-i / (length * 0.3));
      }
    } else if (type === "sine") {
      // Generate sine wave with envelope
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 5); // Exponential decay
        channelData[i] =
          Math.sin(2 * Math.PI * frequency * t) * gain * envelope;
      }
    } else if (type === "square") {
      // Generate square wave with envelope
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 8); // Faster decay
        const square = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
        channelData[i] = square * gain * envelope;
      }
    }

    return buffer;
  }

  getSampleDisplayName(sampleName) {
    const displayNames = {
      hh: "HI-HAT",
      oh: "OPEN-HAT",
      cr: "CRASH",
      rd: "RIDE",
      bd: "KICK",
      sd: "SNARE",
      rim: "RIMSHOT",
      clap: "CLAP",
      lt: "LOW-TOM",
      mt: "MID-TOM",
      ht: "HI-TOM",
      perc: "PERC",
      cb: "COWBELL",
      cy: "CYMBAL",
      tambourine: "TAMB",
      click: "CLICK",
    };

    return displayNames[sampleName] || sampleName.toUpperCase();
  }

  getAvailableBanks() {
    return ["tr909", "tr808", "linndrm", "cr78", "kit"];
  }

  getSamplesForBank(bank) {
    return [
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
  }
}

// Generate basic drum samples using Web Audio API
// Run this in a browser console to generate WAV files

class SampleGenerator {
  constructor() {
    this.sampleRate = 44100;
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
  }

  // Generate a basic kick drum
  generateKick(duration = 0.5) {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / this.sampleRate;
      const envelope = Math.exp(-t * 15);
      const frequency = 60 * (1 - t * 2);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  // Generate a snare drum
  generateSnare(duration = 0.3) {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / this.sampleRate;
      const envelope = Math.exp(-t * 25);
      const tone = Math.sin(2 * Math.PI * 200 * t) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.7;
      data[i] = (tone + noise) * envelope * 0.2;
    }

    return buffer;
  }

  // Generate a hi-hat
  generateHiHat(duration = 0.1) {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / this.sampleRate;
      const envelope = Math.exp(-t * 50);
      const noise = Math.random() * 2 - 1;
      data[i] = noise * envelope * 0.1;
    }

    return buffer;
  }

  // Generate a simple tone
  generateTone(frequency, duration = 0.2) {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / this.sampleRate;
      const envelope = Math.exp(-t * 10);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.15;
    }

    return buffer;
  }

  // Convert AudioBuffer to WAV file data
  bufferToWav(buffer) {
    const length = buffer.length;
    const data = new Float32Array(length);
    buffer.copyFromChannel(data, 0);

    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }

    return arrayBuffer;
  }

  // Download a buffer as WAV file
  downloadWav(buffer, filename) {
    const wavData = this.bufferToWav(buffer);
    const blob = new Blob([wavData], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generate all drum samples
  generateAll() {
    console.log("Generating drum samples...");

    const samples = {
      bd: this.generateKick(),
      sd: this.generateSnare(),
      hh: this.generateHiHat(),
      oh: this.generateHiHat(0.2),
      rim: this.generateTone(300, 0.1),
      clap: this.generateSnare(0.1),
      lt: this.generateTone(150),
      mt: this.generateTone(120),
      ht: this.generateTone(100),
      cr: this.generateHiHat(0.3),
      cy: this.generateHiHat(0.5),
      cb: this.generateTone(80),
      perc: this.generateTone(400, 0.1),
      rd: this.generateTone(200, 0.3),
      click: this.generateTone(1000, 0.05),
      tambourine: this.generateHiHat(0.15),
    };

    // Download each sample
    Object.entries(samples).forEach(([name, buffer]) => {
      setTimeout(() => {
        this.downloadWav(buffer, `${name}.wav`);
      }, 100 * Object.keys(samples).indexOf(name));
    });

    console.log("Sample generation complete. Check downloads folder.");
  }
}

// Usage instructions
console.log(`
To generate drum samples:

1. Open browser console
2. Paste this entire script
3. Run: const generator = new SampleGenerator(); generator.generateAll();
4. Move downloaded files to public/samples/tr909/

Note: This generates basic synthesized drum sounds for testing.
For production use, replace with high-quality drum samples.
`);

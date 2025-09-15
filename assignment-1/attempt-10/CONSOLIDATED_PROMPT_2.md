# Comprehensive Prompt: Web-based MIDI Drum Pad with Strudel Web

Build a complete web-based MIDI drum pad using the Strudel Web package with the following specifications:

## Core Requirements

### UI Design

- **Layout**: 4×4 grid of drum pads (16 total)
- **Style**: Dark mode, brutalist design inspired by Teenage Engineering
- **Typography**: IBM Plex Mono font family
- **Aesthetics**: Bold borders, no border radius, high contrast
- **Visual Feedback**: Pads highlight with green flash animation on hit
- **Controls**: Play/Stop buttons, BPM numeric input (60-200), minimal Settings modal

### Pad Mapping & Audio

- **Keyboard Mapping**: Exactly map `1234qwerasdfzxcv` keys to 16 pad positions
- **Sound Assignment**: Each pad triggers local sample files using standard Strudel naming:
  - Row 1 (1234): BD → SD → HH → OH (Bass, Snare, Closed Hat, Open Hat)
  - Row 2 (QWER): CR → RIM → CP → CB (Crash, Rimshot, Clap, Cowbell)
  - Row 3 (ASDF): MT → LT → HT → RD (Mid Tom, Low Tom, High Tom, Ride)
  - Row 4 (ZXCV): PERC → SH → TB → MISC (Percussion, Shaker, Tambourine, Miscellaneous)
- **Playback**: Instant, low-latency sound triggering; multiple pads can play simultaneously
- **Audio Source**: Local `.wav` files from `samples/` folder

### Local Sample Requirements

All samples must be in standard Strudel format:

- **File Format**: `.wav` files for optimal compatibility
- **Naming Convention**: Use standard abbreviations (bd, sd, hh, oh, etc.)
- **Location**: Must be placed in `samples/` folder relative to `index.html`
- **Quality**: 16+ kHz sample rate recommended for low latency
- **No Dependencies**: Local files eliminate network loading delays

### Strudel Integration

- **Strudel**: https://www.npmjs.com/package/@strudel/web - Read through documentation for correct implementation
- **Pattern Editor**: Live Strudel code editor panel showing current pattern
- **Pattern Building**: Each pad hit appends its token to pattern string (e.g., `$: s("bd sd hh*4")`)
- **Preset Pattern**: Initialize with `$: s("hh*4, bd sd")` (note: `hh*4` not `hh4`)
- **Transport**: Play/Stop buttons evaluate editor content via Strudel Web API
- **Independence**: Individual pad triggers work independently of transport playback

### Critical Keyboard Behavior

- **Pad Mode System**: Implement visible "Pad Mode" toggle with indicator
- **Focus Management**: Keys only work when pad grid has focus OR Pad Mode is ON
- **Input Safety**: Ignore key events when active element is input/textarea/contenteditable/Strudel editor
- **Modifier Protection**: Ignore events with meta/ctrl/alt keys to preserve browser shortcuts
- **Event Handling**: Use preventDefault/stopPropagation ONLY when Pad Mode is active
- **Exit Methods**: Escape key or clicking outside deactivates Pad Mode
- **Visual Indicators**: Clear focus ring and mode status display

### Technical Implementation

#### Strudel Setup (Critical)

```javascript
// In HTML, immediately after Strudel CDN script
initStrudel({
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
```

#### Audio Context Handling

- Check for `audioContext.state === "suspended"`
- Show "Enable Sound" overlay button when suspended
- Resume audio context on user interaction
- Ignore Permissions-Policy warnings about 'browsing-topics'

#### Proper Stop Functionality

Implement robust stop with multiple methods:

```javascript
// Method 1: Primary stop
if (typeof hush !== "undefined") {
  hush(); // Stops all Strudel sounds immediately
}

// Method 2: Spiral control
if (typeof spiral !== "undefined" && spiral.stop) {
  spiral.stop();
}

// Method 3: Silence evaluation
evaluate("silence");
```

#### Error Handling & Initialization Flow

1. Load Strudel CDN script
2. Call `initStrudel()` with sample prebaking
3. Wait for functions: `evaluate`, `hush`, `spiral`, `superdough`
4. Initialize audio context (handle suspension)
5. Create UI elements and bind events
6. Set up keyboard event handling with proper focus management

### File Structure

```
project/
├── index.html          # Main HTML structure
├── style.css           # Brutalist dark mode styling
├── script.js           # Main JavaScript functionality
├── package.json        # Vite and @strudel/web dependencies
├── README.md           # Documentation
└── samples/            # Local audio sample files
    ├── bd.wav          # Bass drum
    ├── sd.wav          # Snare drum
    ├── hh.wav          # Closed hihat
    ├── oh.wav          # Open hihat
    ├── cr.wav          # Crash cymbal
    ├── rd.wav          # Ride cymbal
    ├── rim.wav         # Rimshot
    ├── cp.wav          # Clap
    ├── cb.wav          # Cowbell
    ├── ht.wav          # High tom
    ├── mt.wav          # Mid tom
    ├── lt.wav          # Low tom
    ├── sh.wav          # Shaker
    ├── tb.wav          # Tambourine
    ├── perc.wav        # Percussion
    ├── misc.wav        # Miscellaneous
    └── fx.wav          # Effects
```

### Key Technical Details

#### Strudel API Access Patterns

```javascript
// Check for functions in this order:
if (typeof evaluate !== "undefined") {
  // Global function available after initStrudel()
} else if (window.evaluate) {
  // Window object access
} else if (window.strudel && window.strudel.evaluate) {
  // Nested object access
}
```

#### Pattern Syntax Examples

- Basic beat: `$: s("bd sd hh sd")`
- Polyrhythm: `$: s("bd*2 sd hh*4, cy/2 oh*3")`
- Repetition: Use `*` for multiplication (e.g., `hh*4` not `hh4`)

#### CSS Grid Layout

```css
.drum-pad-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #000;
  border: 4px solid #333;
}

.pad {
  aspect-ratio: 1;
  background: #222;
  border: 3px solid #444;
  min-height: 80px;
}

.pad.triggered {
  background: #00ff00;
  animation: padHit 0.1s ease;
}
```

### Settings Modal Features

- Volume control (0-100%)
- Pad sensitivity adjustment
- Local sample library (no remote dependencies)

### Browser Compatibility

- Target: Chrome (primary)
- Requirement: Modern browser with Web Audio API support
- Handle audio context autoplay policies

### Expected Behavior

- **No 404 errors**: All resources load correctly
- **Instant pad response**: Sub-100ms audio latency
- **Pattern mirroring**: Editor updates reflect pad activity
- **Transport functionality**: Play/Stop controls work reliably
- **Keyboard isolation**: No interference with browser shortcuts or typing
- **Visual consistency**: Brutalist aesthetic throughout

### Development Setup

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@strudel/web": "^1.2.5"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

### References

- https://www.npmjs.com/package/@strudel/web
- https://strudel.cc/workshop/first-sounds/
- https://strudel.cc/learn/samples/

### Testing Checklist

- [ ] All 16 pads trigger sounds instantly
- [ ] All 17 sample files exist in `samples/` folder and load correctly
- [ ] Keyboard shortcuts work only in Pad Mode
- [ ] Play/Stop controls pattern playback
- [ ] Stop button immediately silences all audio
- [ ] Pattern editor updates with pad hits
- [ ] No conflicts with browser shortcuts
- [ ] Audio context suspension handled properly
- [ ] Responsive design works on different screen sizes
- [ ] Settings modal functions correctly
- [ ] Visual feedback (pad animations) works smoothly
- [ ] No 404 errors for sample file loading

### Common Pitfalls to Avoid

1. **Sample Loading**: Must call `initStrudel()` with local sample file mapping
2. **Pattern Syntax**: Use `hh*4` not `hh4` for repetition
3. **Stop Functionality**: Use `hush()` for immediate silence
4. **Keyboard Events**: Only handle when Pad Mode is active
5. **Audio Context**: Handle suspended state with user interaction
6. **Focus Management**: Prevent conflicts with input elements
7. **Sample Files**: Ensure all `.wav` files exist in `samples/` folder with correct names

### Success Criteria

The final application should be a fully functional drum pad that:

- Looks professionally designed with brutalist aesthetics
- Responds instantly to both mouse and keyboard input
- Integrates seamlessly with Strudel's pattern system
- Provides clear visual and audio feedback
- Handles edge cases and errors gracefully
- Works reliably in Chrome without any 404s or JavaScript errors

Build this as a complete, production-ready web application that demonstrates professional front-end development skills and proper integration with the Strudel Web audio library.

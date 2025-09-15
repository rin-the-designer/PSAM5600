# MIDI Drum Pad - Strudel Web

A professional web-based MIDI drum pad application built with Strudel Web, featuring a brutalist dark mode design and real-time pattern generation.

## Features

### 🥁 Drum Pad Grid

- **4×4 grid** of responsive drum pads (16 total)
- **Instant audio feedback** with sub-100ms latency
- **Visual feedback** with green flash animations
- **Multiple trigger methods**: Mouse clicks and keyboard shortcuts

### ⌨️ Keyboard Mapping

```
1234  →  BD SD HH OH     (Kick, Snare, Hi-Hat, Open Hi-Hat)
QWER  →  CY RM CL CP     (Cymbal, Rim, Clap, Cowbell)
ASDF  →  MT LT HT CR     (Mid Tom, Low Tom, High Tom, Crash)
ZXCV  →  PERC TABLA BONGO CONGA
```

### 🎵 Strudel Integration

- **Live pattern editor** with syntax highlighting
- **Real-time pattern building** as you play pads
- **Transport controls** (Play/Stop) with BPM control (60-200)
- **Default samples** from Strudel's dirt-samples library

### 🎛️ Advanced Controls

- **Pad Mode system** with visual indicator and toggle
- **Smart focus management** - keys only work when appropriate
- **Settings modal** with volume and sensitivity controls
- **Robust stop functionality** using multiple methods

## Quick Start

### Development Server

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

## Usage Guide

### Basic Operation

1. **Enable Audio**: Click "ACTIVATE AUDIO" if prompted (required for Web Audio API)
2. **Toggle Pad Mode**: Click "TOGGLE PAD MODE" or focus the pad grid to enable keyboard shortcuts
3. **Play Pads**: Click pads with mouse or use keyboard shortcuts (1-4, Q-R, A-F, Z-V)
4. **Build Patterns**: Pad hits automatically build patterns in the editor
5. **Playback**: Use PLAY/STOP buttons to control pattern playback

### Keyboard Controls

- **Pad Mode ON**: All mapped keys trigger pads and are captured
- **Pad Mode OFF**: Keys only work when pad grid has focus
- **Escape**: Exit pad mode and remove focus
- **Modifier keys**: Always preserved for browser shortcuts (Cmd/Ctrl/Alt + key)

### Pattern Editor

The pattern editor uses Strudel's pattern syntax:

- `$: s("bd sd hh oh")` - Basic sequence
- `$: s("hh*4, bd sd")` - Polyrhythm with repetition
- `$: s("bd*2 sd hh*4, cy/2 oh*3")` - Complex patterns

### Settings

- **Volume**: 0-100% audio output level
- **Pad Sensitivity**: 1-10 responsiveness level
- Access via SETTINGS button

## Technical Details

### Dependencies

- **Strudel Web**: Loaded via CDN (@strudel.cycles/web@0.11.0)
- **Vite**: Development server (5.0.0+)
- **IBM Plex Mono**: Font from Google Fonts

### Audio Context Handling

The app automatically:

- Detects suspended audio contexts
- Shows activation overlay when needed
- Resumes audio context on user interaction
- Handles browser autoplay policies

### Browser Support

- **Primary target**: Chrome (latest)
- **Requirements**: Modern browser with Web Audio API support
- **Mobile**: Responsive design works on tablets and phones

## File Structure

```
project/
├── index.html          # Main HTML structure with Strudel CDN
├── style.css           # Brutalist dark mode styling
├── script.js           # Core functionality and Strudel integration
├── package.json        # Vite development dependencies
└── README.md           # This documentation
```

## Key Features Implementation

### Strudel Initialization

```javascript
initStrudel({
  prebake: () => samples("github:tidalcycles/dirt-samples"),
});
```

### Robust Stop Functionality

```javascript
// Multiple stop methods for reliability
hush(); // Primary stop
spiral.stop(); // Spiral control
evaluate("silence"); // Silence evaluation
```

### Smart Keyboard Handling

- Only captures keys when pad mode is active or pad grid focused
- Preserves browser shortcuts (ignores modifier keys)
- Prevents conflicts with input elements and pattern editor
- Visual feedback for current input mode

### Pattern Building

- Pads automatically append to pattern string
- Syntax: `$: s("bd sd hh*4")` format
- Real-time editor updates
- Independent pad triggering during playback

## Troubleshooting

### Audio Not Working

1. Check browser permissions for audio
2. Click "ACTIVATE AUDIO" button if shown
3. Ensure volume is not muted (check Settings)
4. Try refreshing the page

### Keyboard Not Responding

1. Enable Pad Mode using the toggle button
2. Click on the pad grid to focus it
3. Ensure you're not typing in an input field
4. Press Escape to reset focus state

### Pattern Playback Issues

1. Check pattern syntax in editor
2. Use STOP button to clear any stuck sounds
3. Verify BPM is set (60-200 range)
4. Try the preset pattern: `$: s("hh*4, bd sd")`

## Design Principles

### Brutalist Aesthetic

- **High contrast**: Black backgrounds, white text, green highlights
- **Bold borders**: 3-4px solid borders throughout
- **No border radius**: Sharp, angular design
- **IBM Plex Mono**: Monospace font for technical feel

### User Experience

- **Instant feedback**: Sub-100ms audio and visual response
- **Clear affordances**: Visual indicators for all interactive states
- **Keyboard-first**: Optimized for performance-style playing
- **Error handling**: Graceful degradation with user feedback

## Performance

- **Audio latency**: <100ms for pad triggers
- **Visual feedback**: 60fps animations
- **Pattern processing**: Real-time with no blocking
- **Memory usage**: Optimized for long sessions

## License

MIT License - Feel free to use and modify for your projects.

---

Built with ❤️ using Strudel Web and modern web technologies.

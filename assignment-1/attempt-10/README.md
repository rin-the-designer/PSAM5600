# Strudel Drum Pad

A professional web-based MIDI drum pad built with Strudel Web, featuring a brutalist dark mode design inspired by Teenage Engineering aesthetics.

![Strudel Drum Pad](https://img.shields.io/badge/Status-Ready-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## Features

### 🥁 Drum Pad Grid

- **4×4 grid** of responsive drum pads (16 total)
- **Instant audio triggering** with sub-100ms latency
- **Visual feedback** with green flash animations
- **Dual input modes**: Mouse clicks and keyboard shortcuts

### ⌨️ Keyboard Mapping

- **Row 1 (1234)**: BD → SD → HH → OH (Bass, Snare, Closed Hat, Open Hat)
- **Row 2 (QWER)**: CR → RIM → CP → CB (Crash, Rimshot, Clap, Cowbell)
- **Row 3 (ASDF)**: MT → LT → HT → RD (Mid Tom, Low Tom, High Tom, Ride)
- **Row 4 (ZXCV)**: PERC → SH → TB → MISC (Percussion, Shaker, Tambourine, Misc)

### 🎛️ Smart Pad Mode System

- **Toggle activation**: Click the Pad Mode switch or focus the drum grid
- **Safe key handling**: Only captures keys when appropriate
- **Browser shortcut protection**: Preserves Cmd/Ctrl shortcuts
- **Input field isolation**: Ignores keys when typing in text fields
- **Visual indicators**: Clear focus ring and status display

### 🎵 Strudel Integration

- **Live pattern editor** with syntax highlighting
- **Real-time pattern building**: Pad hits append to pattern string
- **Transport controls**: Play/Stop with BPM adjustment (60-200)
- **Pattern examples**: Pre-loaded with `$: s("hh*4, bd sd")`

### 🎨 Brutalist Design

- **Dark mode interface** with high contrast
- **IBM Plex Mono typography** throughout
- **Bold borders, no rounded corners**
- **Teenage Engineering inspired aesthetics**
- **Responsive design** for all screen sizes

### 🔧 Advanced Features

- **Volume control** (0-100%)
- **Pad sensitivity adjustment**
- **Audio context handling** with suspend/resume
- **Robust stop functionality** with multiple methods
- **Local sample library** (no network dependencies)

## Quick Start

### Prerequisites

- Modern web browser with Web Audio API support
- Node.js and npm (for development)

### Installation

1. **Clone or download** this project
2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Open in browser**: Navigate to the provided localhost URL

### Production Build

```bash
npm run build
```

## File Structure

```
strudel-drum-pad/
├── index.html          # Main application structure
├── style.css           # Brutalist dark mode styling
├── script.js           # Core functionality and Strudel integration
├── package.json        # Dependencies and build scripts
├── README.md          # This documentation
└── samples/           # Local audio sample files
    ├── bd.wav         # Bass drum
    ├── sd.wav         # Snare drum
    ├── hh.wav         # Closed hihat
    ├── oh.wav         # Open hihat
    ├── cr.wav         # Crash cymbal
    ├── rd.wav         # Ride cymbal
    ├── rim.wav        # Rimshot
    ├── cp.wav         # Clap
    ├── cb.wav         # Cowbell
    ├── ht.wav         # High tom
    ├── mt.wav         # Mid tom
    ├── lt.wav         # Low tom
    ├── sh.wav         # Shaker
    ├── tb.wav         # Tambourine
    ├── perc.wav       # Percussion
    ├── misc.wav       # Miscellaneous
    └── fx.wav         # Effects
```

## Usage Guide

### Basic Operation

1. **Enable Audio**: If prompted, click "Enable Sound" to activate audio context
2. **Activate Pad Mode**: Toggle the "PAD MODE" switch in the header
3. **Play Pads**:
   - Click pads with mouse
   - Use keyboard shortcuts (1234qwerasdfzxcv)
4. **Pattern Control**: Use Play/Stop buttons to control pattern playback

### Pattern Building

The pattern editor uses Strudel syntax:

- **Basic beat**: `$: s("bd sd hh sd")`
- **Polyrhythm**: `$: s("bd*2 sd hh*4, cy/2 oh*3")`
- **Repetition**: Use `*` for multiplication (e.g., `hh*4`)

### Keyboard Shortcuts

| Key | Sound | Label | Description   |
| --- | ----- | ----- | ------------- |
| 1   | bd    | BD    | Bass Drum     |
| 2   | sd    | SD    | Snare Drum    |
| 3   | hh    | HH    | Closed Hi-hat |
| 4   | oh    | OH    | Open Hi-hat   |
| Q   | cr    | CR    | Crash Cymbal  |
| W   | rim   | RIM   | Rimshot       |
| E   | cp    | CP    | Hand Clap     |
| R   | cb    | CB    | Cowbell       |
| A   | mt    | MT    | Mid Tom       |
| S   | lt    | LT    | Low Tom       |
| D   | ht    | HT    | High Tom      |
| F   | rd    | RD    | Ride Cymbal   |
| Z   | perc  | PERC  | Percussion    |
| X   | sh    | SH    | Shaker        |
| C   | tb    | TB    | Tambourine    |
| V   | misc  | MISC  | Miscellaneous |

### Settings

Access the settings modal via the gear icon:

- **Volume**: Master volume control (0-100%)
- **Pad Sensitivity**: Adjusts pad response sensitivity
- **Sample Library**: View loaded local samples

## Technical Details

### Strudel Integration

The app initializes Strudel with local sample mapping:

```javascript
await initStrudel({
  prebake: () =>
    samples({
      bd: "samples/bd.wav",
      sd: "samples/sd.wav",
      // ... all 17 samples
    }),
});
```

### Audio Context Handling

- Automatically detects suspended audio context
- Shows "Enable Sound" overlay when needed
- Handles browser autoplay policies gracefully

### Stop Functionality

Robust stop implementation with multiple methods:

```javascript
// Primary stop
if (typeof hush !== "undefined") {
  hush();
}

// Spiral control
if (typeof spiral !== "undefined" && spiral.stop) {
  spiral.stop();
}

// Silence evaluation
evaluate("silence");
```

## Browser Support

- **Primary**: Chrome (recommended)
- **Requirements**: Modern browser with Web Audio API support
- **Mobile**: Responsive design works on tablets and phones

## Troubleshooting

### Audio Issues

- **No sound**: Click "Enable Sound" if overlay appears
- **Latency**: Ensure browser supports low-latency audio
- **Missing samples**: Check that all .wav files exist in samples/ folder

### Keyboard Issues

- **Keys not working**: Activate Pad Mode or click drum grid to focus
- **Browser shortcuts**: Ensure Pad Mode is off when using Cmd/Ctrl shortcuts
- **Typing interference**: Click outside drum grid or press Escape to deactivate

### Performance

- **Slow response**: Close other audio/video applications
- **High CPU**: Reduce browser tab count or restart browser

## Development

### Dependencies

- **@strudel/web**: ^1.2.5 (audio engine)
- **vite**: ^5.0.0 (development server)

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Code Structure

- **index.html**: Application structure and layout
- **style.css**: Brutalist styling and responsive design
- **script.js**: Core logic, event handling, and Strudel integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Strudel**: Powerful web-based audio programming environment
- **Teenage Engineering**: Design inspiration
- **IBM Plex Mono**: Typography choice for brutalist aesthetic

---

**Built with ❤️ and lots of ☕**

For questions or support, please open an issue in the repository.

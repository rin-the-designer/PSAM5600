# MIDI Drum Pad - Strudel Web

A web-based MIDI drum pad with 4×4 grid layout, inspired by Teenage Engineering's design aesthetic. Features dark-mode UI, Web Audio API integration, and keyboard mapping.

## Features

### Core Functionality

- **4×4 Drum Pad Grid**: Click or use mapped keys to trigger samples
- **Keyboard Mapping**: `1234qwerasdfzxcv` (4 rows × 4 columns)
- **Web Audio API**: Shared AudioContext with per-pad gain nodes and envelopes
- **Sample Management**: Preloaded samples with fallback to synthetic sounds
- **Full Polyphony**: Multiple simultaneous pad hits supported

### UI/UX

- **Dark Mode**: Teenage Engineering inspired brutalist design
- **IBM Plex Mono**: Typography throughout
- **Visual Feedback**: Pad highlighting on trigger
- **Responsive Design**: Mobile-friendly layout
- **Touch Support**: Works on mobile devices

### Audio Features

- **Multiple Banks**: TR-909, TR-808, Linn Drum, CR-78, Kit
- **Sample Preloading**: All samples loaded at startup
- **Envelope Shaping**: 2ms attack, 150ms release to avoid clicks
- **Error Handling**: Graceful degradation with synthetic sounds
- **Mobile Safari**: Proper AudioContext handling

### Transport & Pattern

- **BPM Control**: Adjustable from 60-200 BPM
- **Play/Stop**: Transport controls
- **Pattern Editor**: Strudel-style code editor
- **Settings**: Bank selection with localStorage persistence

## Quick Start

### Option 1: Local HTTP Server (Recommended)

```bash
# Clone or download the project
cd midi-drum-pad-strudel

# Start a local server (Python 3)
python -m http.server 8000

# Or use Node.js
npx http-server -p 8000

# Open in browser
open http://localhost:8000
```

### Option 2: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

## Keyboard Layout

```
┌─────┬─────┬─────┬─────┐
│  1  │  2  │  3  │  4  │ ← Hi-Hat, Open Hat, Crash, Ride
├─────┼─────┼─────┼─────┤
│  Q  │  W  │  E  │  R  │ ← Kick, Snare, Rim, Clap
├─────┼─────┼─────┼─────┤
│  A  │  S  │  D  │  F  │ ← Low Tom, Mid Tom, Hi Tom, Perc
├─────┼─────┼─────┼─────┤
│  Z  │  X  │  C  │  V  │ ← Cowbell, Cymbal, Tambourine, Click
└─────┴─────┴─────┴─────┘
```

## Usage

1. **First Time**: Click "Enable Sound" when prompted
2. **Play Pads**: Click pads or press mapped keys
3. **Change Banks**: Settings → Select bank → Save
4. **Set BPM**: Adjust the BPM input (60-200)
5. **Pattern Mode**: Use Play/Stop for pattern playback
6. **Code Editor**: View/edit Strudel patterns

## Technical Details

### Audio Architecture

- **AudioContext**: Single shared context with `latencyHint: "interactive"`
- **Sample Loading**: Fetch + decodeAudioData with fallbacks
- **Playback**: Fresh AudioBufferSourceNode per trigger
- **Gain Structure**: Master → Per-Pad → Envelope
- **Mobile Support**: Context resume on user gestures

### File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Dark mode Teenage Engineering styling
├── script.js           # Main application logic
├── samples.js          # Sample management system
├── package.json        # Project configuration
└── README.md          # This file
```

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari (desktop): Full support
- Safari (mobile): Full support with gesture handling
- Note: Requires ES6 modules support

## Development

### Customization

- **Add Banks**: Extend `samples.js` → `SampleManager`
- **Modify Layout**: Update `padLayout` in `script.js`
- **Styling**: Edit CSS variables in `styles.css`
- **Samples**: Add local samples to `./samples/[bank]/` directories

### Sample Integration

The app will attempt to load samples from:

1. Local files: `./samples/[bank]/[sample].wav`
2. Fallback URLs (configurable in `samples.js`)
3. Synthetic generation (as last resort)

### Real Strudel Integration

To integrate with full Strudel Web package:

1. Install: `npm install @strudel/web`
2. Replace sample management with Strudel's system
3. Implement pattern evaluation using Strudel's API

## Troubleshooting

### Audio Issues

- **No Sound**: Check "Enable Sound" overlay
- **Mobile Safari**: Ensure user gesture before playback
- **Latency**: Use Chrome for best performance
- **Sample Loading**: Check browser console for errors

### Common Issues

- **Module Errors**: Ensure serving via HTTP (not file://)
- **CORS Errors**: Use local server, not direct file opening
- **Touch Issues**: Ensure touch events aren't blocked

## License

MIT License - See project repository for details.

## Credits

- Inspired by Teenage Engineering's design philosophy
- Uses Web Audio API for low-latency audio
- Synthetic drum sounds generated procedurally
- Built for modern web browsers with ES6 modules

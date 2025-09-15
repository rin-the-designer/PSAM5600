# Strudel MIDI Drum Pad

A web-based MIDI drum pad application built with the Strudel Web package, featuring a 4×4 grid of pads with brutalist UI design inspired by Teenage Engineering.

## Features

- **4×4 Drum Pad Grid**: Tactile pads with keyboard mapping (1234qwerasdfzxcv)
- **Low-Latency Audio**: Custom AudioContext implementation for instant pad response
- **Strudel Integration**: Code editor for pattern programming and sequencing
- **Sound Banks**: Switchable drum kits (TR-909, TR-808, Acoustic) with localStorage persistence
- **Brutalist UI**: Dark mode, bold borders, IBM Plex Mono typography
- **Transport Controls**: Play/Stop buttons with BPM control
- **Error Handling**: Toast notifications for missing samples and audio issues

## Sound Mapping

```
1: BD    2: SD    3: HH    4: OH
Q: RIM   W: CLAP  E: LT    R: MT
A: HT    S: CR    D: CY    F: CB
Z: PERC  X: RD    C: CLICK V: TAMB
```

## Installation & Usage

1. **Start the server:**

   ```bash
   npm start
   # or
   python3 -m http.server 8000
   ```

2. **Open in browser:**

   ```
   http://localhost:8000
   ```

3. **Enable audio:** Click "Enable Sound" when prompted (Chrome requires user gesture)

4. **Play pads:** Click pads or use keyboard keys (1234qwerasdfzxcv)

5. **Use Strudel:** Edit patterns in the code editor and click PLAY

## Sample Structure

```
public/samples/
├── tr909/
│   ├── bd.wav
│   ├── sd.wav
│   ├── hh.wav
│   └── ...
├── tr808/
└── acoustic/
```

## Default Pattern

```javascript
$: s("hh*4, bd sd").bank("tr909");
```

## Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Web Audio API support
- **Safari**: Web Audio API support

## Technical Notes

- Uses Web Audio API with `latencyHint: "interactive"`
- Samples preloaded into AudioBuffers for instant playback
- Polyphonic playback with short attack/release envelopes
- Strudel patterns run independently of pad triggers
- localStorage for settings persistence

## Error Handling

- Missing samples show toast notifications and disable affected pads
- Suspended AudioContext shows "Enable Sound" overlay
- Strudel evaluation errors displayed in toast notifications
- Permissions-Policy warnings filtered from console

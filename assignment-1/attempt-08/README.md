# Strudel Drum Pad

A web-based MIDI drum pad built with Strudel Web, featuring a brutalist dark mode interface inspired by Teenage Engineering aesthetics.

## Features

- **4×4 Drum Pad Grid**: 16 responsive pads with tactile feedback
- **Keyboard Mapping**: Full keyboard support with 1234qwerasdfzxcv key mapping
- **Real-time Audio**: Instant sound playback using Strudel's default sounds
- **Pattern Editor**: Live Strudel code editor that captures pad activity
- **Transport Controls**: Play/Stop buttons with BPM control
- **Focus Management**: Smart keyboard handling that doesn't interfere with typing
- **Dark Brutalist UI**: Bold borders, IBM Plex Mono typography, no-frills aesthetic

## Usage

### Starting the Application

1. **Development Mode**:

   ```bash
   npm run dev
   ```

   Then open http://localhost:5173 in Chrome

2. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

### Controls

#### Drum Pads

- **Click** any pad to trigger sounds instantly
- **Keyboard**: Use 1234qwerasdfzxcv keys when Pad Mode is active
- **Pad Mode**: Toggle with the "TOGGLE" button or click on the pad grid to activate

#### Transport

- **PLAY/STOP**: Evaluates and plays the current Strudel pattern
- **BPM**: Adjust tempo (60-200 BPM)
- **Settings**: Volume and sensitivity controls

#### Pattern Editor

- Shows live Strudel code: `$: s("hh4, bd sd")`
- Updates automatically as you play pads
- Edit directly to create custom patterns
- Press PLAY to execute your patterns

### Keyboard Behavior

**Pad Mode** must be active to use keyboard shortcuts:

- **Activate**: Click the pad grid or press the TOGGLE button
- **Deactivate**: Press `Escape` or click outside the pad area
- **Safe Typing**: Keys are ignored when typing in inputs, textareas, or the editor
- **No Conflicts**: Meta/Ctrl/Alt shortcuts pass through normally

### Sound Mapping

| Key | Pad | Sound | Description |
| --- | --- | ----- | ----------- |
| 1   | 1   | bd    | Kick Drum   |
| 2   | 2   | sd    | Snare Drum  |
| 3   | 3   | hh    | Hi-Hat      |
| 4   | 4   | oh    | Open Hi-Hat |
| Q   | 5   | cy    | Cymbal      |
| W   | 6   | rm    | Rim Shot    |
| E   | 7   | cl    | Clap        |
| R   | 8   | cp    | Cowbell     |
| A   | 9   | mt    | Mid Tom     |
| S   | 10  | lt    | Low Tom     |
| D   | 11  | ht    | High Tom    |
| F   | 12  | cr    | Crash       |
| Z   | 13  | perc  | Percussion  |
| X   | 14  | tabla | Tabla       |
| C   | 15  | bongo | Bongo       |
| V   | 16  | conga | Conga       |

### Audio Setup

If you see "Enable Sound":

1. Click the **Enable Sound** button
2. This resumes the audio context (required by browsers)
3. The overlay disappears and pads become active

### Example Patterns

Try these in the editor:

```javascript
// Basic 4/4 beat
$: s("bd sd hh sd");

// Complex polyrhythm
$: s("bd*2 sd hh*4, cy/2 oh*3");

// Preset demo
$: s("hh4, bd sd");
```

## Browser Support

- **Recommended**: Chrome (tested)
- **Required**: Modern browser with Web Audio API support
- **Mobile**: Touch events supported for pad interactions

## Technical Details

- **Framework**: Vanilla JavaScript with Strudel Web CDN
- **Build Tool**: Vite
- **Audio**: Web Audio API via Strudel
- **Styling**: CSS Grid with brutalist design principles
- **Fonts**: IBM Plex Mono from Google Fonts

## Troubleshooting

- **No Sound**: Click "Enable Sound" to resume audio context
- **Keys Not Working**: Ensure Pad Mode is active (green indicator)
- **Pattern Errors**: Check Strudel syntax in editor
- **404 Errors**: Run `npm run dev` and check console for issues

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Built for PSAM5600 Assignment 1 - Web-based MIDI controllers using Strudel Web.

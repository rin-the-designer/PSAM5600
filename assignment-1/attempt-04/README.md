# MIDI Drum Pad

A web-based MIDI drum pad built with Strudel Web, featuring a Teenage Engineering-inspired design.

## Features

- **4x4 Drum Pad Grid**: 16 pads arranged in a 4x4 grid
- **Keyboard Mapping**: Use keys `1234qwerasdfzxcv` to trigger pads
- **Strudel Integration**: Generates and plays Strudel code with TR-909 bank
- **Sound Selection**: Choose from various drum sounds via settings
- **BPM Control**: Adjust tempo from 60-200 BPM
- **Play/Stop**: Play the current pattern or stop playback
- **Dark Theme**: Teenage Engineering-inspired dark mode design
- **IBM Plex Mono Font**: Clean, monospace typography

## Usage

### Keyboard Controls

- `1`, `2`, `3`, `4` - Top row pads
- `q`, `w`, `e`, `r` - Second row pads
- `a`, `s`, `d`, `f` - Third row pads
- `z`, `x`, `c`, `v` - Bottom row pads

### Mouse Controls

- Click and hold pads to activate them
- Click SETTINGS to change sounds
- Use PLAY button to start/stop playback
- Adjust BPM with the number input

### Sound Selection

1. Click SETTINGS button
2. Choose a sound from the grid
3. Click any pad to assign that sound
4. Settings will close automatically

## Installation & Running

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:8000`

## Strudel Code Generation

The drum pad generates Strudel code based on active pads. For example:

- Single pad: `$: s("bd").bank("tr909")`
- Multiple pads: `$: s("bd sd hh").bank("tr909")`
- Default pattern: `$: s("hh*4, bd sd").bank("tr909")`

## Technical Details

- Built with vanilla JavaScript and ES6 modules
- Uses Strudel Web package for audio synthesis
- Responsive design with mobile support
- No external CSS frameworks - pure CSS with custom styling
- IBM Plex Mono font for consistent typography

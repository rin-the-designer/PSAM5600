# MIDI Drum Pad

A web-based MIDI drum pad built with Strudel Web, featuring a 4x4 grid interface with Teenage Engineering-inspired design.

## Features

- **4x4 Drum Pad Grid**: Visual drum pad interface with 16 pads
- **Keyboard Mapping**: Map keys `1234qwerasdfzxcv` to drum pad positions
- **Sound Selection**: Choose from various Strudel sound options
- **Real-time Code Generation**: Automatically generates Strudel code as you play
- **Dark Theme**: Teenage Engineering-inspired dark mode design
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. **Open the Application**: Double-click `index.html` to open in your browser
2. **Initialize Audio**: Click any pad or press a key to initialize the audio context
3. **Play Drums**:
   - Click on drum pads with your mouse
   - Use keyboard keys: `1234qwerasdfzxcv`
4. **Customize Sounds**: Click "Settings" to change sounds for each pad
5. **Generate Code**: The app automatically generates Strudel code as you play
6. **Play Patterns**: Click "Play" to execute the generated Strudel code
7. **Stop**: Click "Stop" to silence the audio

## Keyboard Mapping

```
Row 1: 1 2 3 4
Row 2: Q W E R
Row 3: A S D F
Row 4: Z X C V
```

## Available Sounds

The app includes various drum sounds from Strudel's sample library:

- **bd** - Bass drum
- **sd** - Snare drum
- **hh** - Closed hi-hat
- **oh** - Open hi-hat
- **cp** - Hand clap
- **rim** - Rim shot
- **shaker** - Shaker percussion
- **crash** - Crash cymbal
- **kick** - Alternative kick
- **snare** - Alternative snare
- **hat** - Alternative hat
- **openhat** - Alternative open hat
- **perc** - General percussion
- **click** - Click sound
- **pop** - Pop sound
- **tick** - Tick sound
- **tom** - Tom drum
- **ride** - Ride cymbal
- **bell** - Bell sound
- **wood** - Wood block

## Customizing Sounds

1. Click the "Settings" button
2. Select a sound from the available options
3. Click on any drum pad to assign that sound to it
4. The pad will update to show the new sound

## Generated Code

The app automatically generates Strudel code based on your drum pattern. Examples:

```javascript
// Simple pattern
d1 $ s("bd") ~ s("sd") ~ s("hh")

// Stacked patterns
d1 $ stack [
  s("bd")
  s("sd")
  s("hh")
]
```

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses Strudel Web package for audio synthesis
- Loads samples from TidalCycles dirt-samples repository
- Responsive design with CSS Grid and Flexbox
- Keyboard event handling for MIDI-like experience

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Note: Due to browser autoplay policies, you may need to interact with the page before audio will play.

## Files

- `index.html` - Main HTML structure
- `styles.css` - CSS styling and layout
- `script.js` - JavaScript functionality and Strudel integration
- `README.md` - This documentation

## Dependencies

- Strudel Web package (loaded from CDN)
- TidalCycles dirt-samples (loaded automatically)

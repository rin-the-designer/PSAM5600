# Strudel MIDI Drum Pad

A web-based MIDI drum pad built with the Strudel Web package, featuring a Teenage Engineering-inspired design.

## Features

- **4×4 Grid Layout**: 16 drum pads arranged in a clean grid
- **Keyboard Mapping**: Use keys `1234qwerasdfzxcv` to trigger pads
- **Real-time Sound Playback**: Immediate audio feedback when pressing pads
- **Sequencing**: Build patterns and play them back with adjustable BPM
- **Sound Banks**: Multiple drum machine sound banks available (TR-909, TR-808, DMC series)
- **Dark Mode Design**: Minimal, brutalist aesthetic inspired by Teenage Engineering
- **Responsive**: Works on desktop and mobile devices

## Usage

1. **Open `index.html`** in a web browser
2. **Click pads or use keyboard** to trigger drum sounds
3. **Adjust BPM** using the tempo control
4. **Press PLAY** to sequence your pattern
5. **Access SETTINGS** to change sound banks and volume

## Keyboard Mapping

```
Row 1: 1 2 3 4  (BD SD HH OH)
Row 2: Q W E R  (CP RS CB CH)
Row 3: A S D F  (LT MT HT OP)
Row 4: Z X C V  (CR RI SH AG)
```

## Sound Banks

- **TR-909**: Classic Roland TR-909 drum machine sounds
- **TR-808**: Classic Roland TR-808 drum machine sounds
- **DMC Series**: Various DMC drum machine sound banks (DMC1-DMC20)

## Technical Details

- Built with [Strudel Web](https://codeberg.org/uzu/strudel/src/branch/main/packages/web)
- Uses IBM Plex Mono font for that digital aesthetic
- Responsive CSS Grid layout
- Real-time audio processing with Web Audio API
- No external dependencies beyond Strudel Web package

## Browser Compatibility

- Modern browsers with Web Audio API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Example Patterns

The drum pad generates Strudel code automatically. Examples:

- Basic: `$: s("bd sd").bank("tr909")`
- Complex: `$: s("bd sd hh oh cp").bank("tr909")`
- Minimal: `$: s("bd hh").bank("tr909")`

## Development

To modify or extend the drum pad:

1. Edit `script.js` for functionality
2. Edit `styles.css` for visual design
3. Edit `index.html` for structure

The code is modular and well-commented for easy customization.

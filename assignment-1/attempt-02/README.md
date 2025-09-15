# Strudel Drum Pad

A web-based MIDI drum pad built with Strudel Web, featuring a 4x4 grid interface inspired by Teenage Engineering's design aesthetic.

## Features

- **4x4 Drum Pad Grid**: Visual drum pad interface with keyboard mapping
- **Keyboard Controls**: Map keys `1234qwerasdfzxcv` to drum pad positions
- **TR-909 Sound Bank**: Uses Strudel's TR-909 drum samples
- **Real-time Code Generation**: Generates Strudel code as you play
- **Customizable Sounds**: Settings page to assign different sounds to each pad
- **Dark Theme**: Teenage Engineering-inspired design with IBM Plex Mono font

## Usage

### Basic Operation

1. **Open** `index.html` in your web browser
2. **Click** drum pads or **press** keyboard keys to trigger sounds
3. **Press PLAY** to play the generated pattern
4. **Press STOP** to stop playback
5. **Click COPY CODE** to copy the generated Strudel code

### Keyboard Mapping

The drum pad is mapped to these keys:

```
1 2 3 4
q w e r
a s d f
z x c v
```

### Sound Configuration

1. **Click SETTINGS** to open the configuration panel
2. **Select a pad** from the mini grid
3. **Choose a sound** from the available options
4. **Click APPLY SOUND** to assign the sound to the selected pad
5. **Click CLEAR PATTERN** to reset the current pattern

### Available Sounds

The drum pad includes these TR-909 sounds:

- `bd` - Bass drum
- `sd` - Snare drum
- `hh` - Hi-hat
- `oh` - Open hi-hat
- `cr` - Crash
- `cp` - Clap
- `rs` - Rim shot
- `lt` - Low tom
- `mt` - Mid tom
- `ht` - High tom
- `cb` - Cowbell
- `cy` - Cymbal
- `sh` - Shaker
- `ag` - Agogo
- `ma` - Maracas
- `wh` - Whistle

## Generated Code

The drum pad generates Strudel code in this format:

```javascript
$: s("bd sd hh").bank("tr909");
```

Where the sound sequence represents the order in which pads were triggered.

## Technical Details

- Built with **Strudel Web** package (@strudel/web@1.2.5)
- Uses **IBM Plex Mono** font for that technical aesthetic
- **No border radius** for a rough, industrial feel
- **Dark mode** color scheme inspired by Teenage Engineering
- **Responsive design** that works on desktop and mobile

## Browser Requirements

- Modern web browser with Web Audio API support
- JavaScript enabled
- Internet connection (for loading Strudel package and samples)

## Example Patterns

Try these keyboard sequences to create common drum patterns:

**Basic Beat**: `1` `3` `q` `e` (bd, sd, hh, hh)
**Snare Roll**: `3` `3` `3` `3` (sd, sd, sd, sd)
**Hi-hat Pattern**: `q` `w` `e` `r` (hh, hh, hh, hh)

Enjoy making beats with your Strudel Drum Pad!

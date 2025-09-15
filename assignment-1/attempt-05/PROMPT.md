I want to build a web-based MIDI drum pad using the Strudel Web package (@https://codeberg.org/uzu/strudel/src/branch/main/packages/web ).

Requirements: 1. UI Design
• 4×4 grid pad layout, in dark mode.
• Style: inspired by Teenage Engineering products (minimal, digital aesthetic).
• Font: IBM Plex Mono.
• Grid style: boxed/outlined layout with bold borders, no border radius, giving a rough/brutalist feel. 2. Pad Mapping & Interaction
• Keys mapped to: 1234qwerasdfzxcv (e.g., pressing q = column 1, row 2).
• Clicking a pad or pressing a mapped key should:
• Play the assigned drum sound.
• Write corresponding Strudel code (e.g., .bank("tr909")).
• Multiple pads pressed together = sounds play together. 3. Sound & Sequencing
• Default .bank = "tr909".
• Example code snippet for an 8-beat drum:
$: s("hh\*4, bd sd").bank("tr909") 4. Controls / Settings
• Play button: play the sequence.
• BPM input: adjustable tempo.
• Settings page: users can select sound banks (from Strudel’s available options).

Make sure the sound is loaded too.s

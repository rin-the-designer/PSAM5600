claude-4-sonnet

Build a web-based MIDI drum pad using the Strudel Web package (https://codeberg.org/uzu/strudel/src/branch/main/packages/web).

Functional requirements:
• UI: 4×4 grid of pads in dark mode, boxed/outlined brutalist style (bold borders, no border radius), inspired by Teenage Engineering. Use IBM Plex Mono. Pads highlight on hit. Include Play/Stop buttons, a BPM numeric input, and a Settings page with selectable sound bank (default = “tr909”, persisted to localStorage).
• Pad/Key mapping: Map exactly to 1234qwerasdfzxcv → 16 pad positions. Example mapping:
1: bd 2: sd 3: hh 4: oh
q: rim w: clap e: lt r: mt
a: ht s: cr d: cy f: cb
z: perc x: rd c: click v: tambourine
• Audio playback: Place WAV files in /public/samples// (e.g., /samples/tr909/bd.wav, etc.). On init, preload all 16 samples into a shared AudioContext({ latencyHint: “interactive” }) using fetch + decodeAudioData. Fail fast if missing (no external fallback). Resume AudioContext on first user gesture (click/keydown). On pad hit (click or mapped key): play a fresh AudioBufferSourceNode with a short attack/release to avoid clicks; allow polyphony and overlapping hits. Pads must always play immediately (do not depend on Strudel’s transport for latency).
• Strudel integration: Show a Strudel code editor panel. Every pad hit also appends its token into the current pattern string and updates the editor with code like:
$: s(“bd sd hh oh”).bank(“tr909”)
Provide a preset “basic 8-beat” example:
$: s(“hh\*4, bd sd”).bank(“tr909”)
Play/Stop buttons evaluate the editor content via Strudel Web API. Pads continue to trigger sounds directly even while transport runs.

Error handling:
• If a sample is missing, show a toast (“Missing sample: .wav in ”) and disable only that pad.
• If audioCtx.state === “suspended”, show an overlay “Enable Sound” button that resumes the context.
• Ignore/remove unrelated Permissions-Policy: browsing-topics warnings.

Init flow: 1. Preload samples for default bank “tr909”. 2. Bind pad click + key listeners. 3. Setup Strudel editor + transport. 4. Load saved bank from localStorage or fallback to “tr909”. 5. Initialize editor with preset $: s(“hh\*4, bd sd”).bank(“tr909”).

Acceptance criteria: No 404s, no Freesound fallbacks, all 16 pads play instantly on hit, Strudel editor mirrors pad activity, Play/Stop runs Strudel patterns, Settings reloads sample banks, UI matches the specified brutalist grid style.

Note: This is for testing on Chrome.

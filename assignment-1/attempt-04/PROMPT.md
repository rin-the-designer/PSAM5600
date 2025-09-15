I want to make a web-based midi drum pad.

1. Get the Sturdel Web package - https://codeberg.org/uzu/strudel/src/branch/main/packages/web
2. Have a 4\*4 pad as the UI. Darkmode colors, have it look something like a digitial version of a product form Teenage Engineering.
3. Use font IBM Plex Mono
4. I want the UI that has a boxed/outlined grid layout, with no border radius. give it a rough feeling.
5. Have the pad mapped to 1234qwerasdfzxcv. so when the user presses q it will play the sound of column 1 row 2.
6. make a settings page to allow users to choose the sound. - use the sound options from Sturdel.
7. clicking the pad or pressing a mapped key on the keyboard should write a code in Sturdel.
8. have the .bank be .bank("tr909").
9. $: s("hh\*4, bd sd").bank("tr909") This is what a basic 8 beat drum would look like in the Strudel code.
10. clicking/pressing a pad together should make the sound play together.
11. the play button should be able to play the sound.
12. There should be a bpm input to change bpm

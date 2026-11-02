# Mega Toss

A minimal browser megavitamin simulator: one capsule, five clockwise revolutions, and independently weighted colors. Plain HTML, CSS, JavaScript and SVG; no runtime or development dependencies.

## Run locally

Install Node.js 22 or newer, then run:

```sh
npm test
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Rebuild after source changes and refresh. No package installation is needed.

## Behavior and organization

- `src/colors.js`: integer rolls 0–32 red, 33–65 blue, 66–98 yellow, 99 green; independent draws per half. Bottom RGB channels are multiplied by 0.90 and rounded.
- `src/capsule.js`: flat SVG matching the supplied capsule silhouette, with separately colored halves and a persistent black outline/divider.
- `src/animation.js`: time-based requestAnimationFrame timeline: 360° over 0.5 seconds, 1080° over 0.75 seconds at 240 RPM, 360° over 0.5 seconds, for five turns in 1.75 seconds. The first turn accelerates uniformly from rest to 240 RPM over 0.5 seconds; the last decelerates from 240 RPM to rest over 0.5 seconds. Both join the middle phase with continuous velocity. Woosh cues follow timeline crossings at 0.625, 0.875 and 1.125 seconds (halfway through spins 2–4). Rendering and audio dispatch occur on the first browser frame at/after each deadline; background-tab throttling can delay presentation, but cannot change the landing or accumulated rotation.
- `src/audio.js`: optional preloaded/decoded Web Audio buffers; each cue creates its own overlapping source. Browser audio is unlocked by Toss. Missing/unavailable files remain silent. Toss waits for preload and audio unlock before starting its synchronized timeline. Both built audio/ and source-hosted public/audio/ paths are supported.
- `src/particles.js`: 25 steady falling capsules for one green; 100 staggered varied ballistic/curved capsules for double green. All use the same weighted colors and darker bottoms, cannot intercept clicks, and are removed after exiting below the viewport or the lifetime limit.
- `src/main.js`: locks overlapping tosses, chooses the landing before animation, cycles independently weighted colors (including 1% green per half) every 125 ms, and applies one landing effect. Temporary green colors never celebrate.

## Settings and modes

Settings are session-local and start at 50% volume with normal mode. All five buttons are disabled from Toss activation through preload, animation, fake-outs, and final landing.

- **Volume:** red/red = 50% gain, empty/red = 25% gain, empty/empty = muted; the next click restores 50%. A shared Web Audio GainNode affects all overlapping sounds.
- **Suspense Mode:** blue/blue = off; purple/orange = on. Each toss chooses a peak of 60–600 RPM, a 0.35–0.8 second acceleration, a 2.4–4.8 second deceleration, and a bounded whole number of turns. 40% finish without an initial fake-out; 20% pause only, 20% pause and change colors, and 20% pause and perform one extra rapid turn. Fake-outs only cycle non-green display colors; they never change the predetermined final pair or play a premature landing sound.
- **Reduced Motion Mode:** activating it turns both its yellow icon and the main capsule horizontal. Toss fades only the two color fills out over 0.5 seconds, pauses for one second, then fades the predetermined colors in together over 0.5 seconds. The outline stays visible, there is no spin or woosh, and the normal throw and appropriate landing sound remain. Existing green celebrations and odds are preserved.
- The two modes cannot be active together. Attempting to switch without disabling the current mode jitters its icon for one second and displays a temporary centered message.

The normal animation in `src/animation.js`, weighted final-color logic, particle effects, and halfway woosh cues are unchanged. New behavior lives in `src/settings.js` and `src/modes.js`. Tests cover volume, busy guards, both conflict directions, fade phases, randomized speed/turn bounds, all fake-out types, and final-only landing callbacks.

## Supplied assets

The supplied reference is included at `public/assets/megavitamin-template.png`. Replace it there if needed; it is a reference, not the rendered graphic. Change SVG geometry in `src/capsule.js` to alter the actual capsule.

The repository includes throw.mp3 (accepted as an alias for thrown.mp3), woosh.mp3 and hit.mp3. The two Green sounds are still optional missing assets. Upload sounds into `public/audio/`:

| File | Cue |
| --- | --- |
| thrown.mp3 | Toss starts |
| woosh.mp3 | Halfway through each constant-speed revolution |
| hit.mp3 | No green landing |
| hit_g.mp3 | Exactly one green landing |
| hit_gg.mp3 | Double green landing |

Green sounds replace the normal landing sound. No replacement audio is generated. Commit assets and push to rebuild the site.

## Testing rare outcomes

On localhost only, run one of these in browser developer tools, then click Toss:

```js
megaTossDebug.forceNext('single')
megaTossDebug.forceNext('double')
megaTossDebug.forceNext('normal')
```

There is no visible debug interface and the hook is not enabled on GitHub Pages. Automated tests cover exhaustive probability buckets, independent draws, all landing decisions, bottom tint, phase angles/speed, and cue dispatch under irregular frame timing.

## GitHub Pages

Repository: https://github.com/darrinjmajocha/mega
Game: https://darrinjmajocha.github.io/mega/

The included workflow tests, builds and deploys main pushes when Pages uses GitHub Actions. Source-branch Pages hosting also works: audio loading supports both public/audio/ in the source and audio/ in the build output. Keep uploaded MP3 files in public/audio/. No package installation is needed.


### Additional suspense behavior

Cruising can smoothly speed up and slow down. After a suspense stop, there is a 5% chance of an extra unchanged normal-mode toss (with throw and halfway woosh cues), or a 20% chance of rapid alternating-direction movements. The first clockwise movement and counterclockwise reversal are guaranteed within that sequence; each subsequent reversal has a 25% continuation chance. Each movement loops its woosh for the movement duration, and a final short movement settles upright. Final colors remain predetermined and only the ultimate landing triggers the landing effect. Volume levels are 50%, 25%, and muted.

Suspense pauses (including before reversals and the rare normal encore) range from 0.1–5.0 seconds in tenths. Linear weights give 0.1 seconds 1.8 times the probability of 5.0 seconds, gently favoring shorter pauses. Pause-only fake-outs hold their colors and orientation until the true landing. All controls remain locked throughout.

Between alternating movements, a fresh uniformly random pause is selected from 0.10 through 1.00 seconds in 0.01-second steps. Controls stay locked and no new woosh starts until the next movement. The initial suspense pause retains its existing 0.1–5.0-second distribution. Normal mode speed is unchanged.

Pause-only suspense endings (15% of initial plans) reveal the predetermined final pair as the capsule stops, hold it unchanged throughout the pause, and land without any additional motion or recoloring. The landing sound and green celebration still wait until the pause ends. Color odds remain unchanged.

### Zany finishes

Stubborn quarter-turn, wind-up, ticking clock, false finish, sleepy spin, and indecisive colors are available as short extra finishes. Color swaps are eligible only when the predetermined halves differ; final outcomes are unchanged. Non-pause-only tosses have a 25% chance of a new effect, with an 45% chance of a second effect, then a 15% conditional chance of a third (maximum three; repeats allowed). Each effect is 0.9–1.7 seconds. Initial no-fake-out probability is now 45%; pause-only is 15%. Short pauses have slightly more weight. Existing normal and reduced modes are unchanged.

Non-pause-only suspense plans have a 3% chance of ending abruptly during cruising at a whole-turn boundary. These endings remain upright, skip further fake-outs, and preserve the final color distribution.

### Colorblind Mode

The independent red/green setting adds centered R, B, Y, and G labels to main and celebration capsules. Its icon flips to green/red with labels when enabled. Labels scale with the SVG and rotate with the capsule, except that the main labels stay upright in Reduced Motion and fade together with their halves. The setting is locked during tosses. Green appears in cycling colors with the same 1% odds per half as landing rolls; cycling green never triggers celebrations.

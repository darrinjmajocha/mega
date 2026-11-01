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
- `src/animation.js`: time-based requestAnimationFrame timeline: 360° over 0.5 seconds, 1080° over 0.75 seconds at 240 RPM, 360° over 0.5 seconds, for five turns in 1.75 seconds. The first turn accelerates uniformly from rest to 240 RPM over 0.5 seconds; the last decelerates from 240 RPM to rest over 0.5 seconds. Both join the middle phase with continuous velocity. Woosh cues follow timeline crossings at 0.50, 0.75 and 1.00 seconds (the starts of spins 2–4). Rendering and audio dispatch occur on the first browser frame at/after each deadline; background-tab throttling can delay presentation, but cannot change the landing or accumulated rotation.
- `src/audio.js`: optional preloaded/decoded Web Audio buffers; each cue creates its own overlapping source. Browser audio is unlocked by Toss. Missing/unavailable files remain silent. Toss waits for preload and audio unlock before starting its synchronized timeline. Both built audio/ and source-hosted public/audio/ paths are supported.
- `src/particles.js`: 10 steady falling capsules for one green; 100 staggered varied ballistic/curved capsules for double green. All use the same weighted colors and darker bottoms, cannot intercept clicks, and are removed after exiting below the viewport or the lifetime limit.
- `src/main.js`: locks overlapping tosses, chooses the landing before animation, cycles red, blue and yellow (no green) every 125 ms, and applies one landing effect. Temporary green colors never celebrate.

## Supplied assets

The supplied reference is included at `public/assets/megavitamin-template.png`. Replace it there if needed; it is a reference, not the rendered graphic. Change SVG geometry in `src/capsule.js` to alter the actual capsule.

The repository includes throw.mp3 (accepted as an alias for thrown.mp3), woosh.mp3 and hit.mp3. The two Green sounds are still optional missing assets. Upload sounds into `public/audio/`:

| File | Cue |
| --- | --- |
| thrown.mp3 | Toss starts |
| woosh.mp3 | Each constant-speed revolution starts |
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

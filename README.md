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

- `src/colors.js`: integer rolls 0–32 red, 33–65 blue, 66–98 yellow, 99 green; independent draws per half. Bottom RGB channels are multiplied by 0.95 and rounded.
- `src/capsule.js`: flat SVG matching the supplied capsule silhouette, with separately colored halves and a persistent black outline/divider.
- `src/animation.js`: time-based requestAnimationFrame timeline: 360° over 0.5 seconds, 1080° over 3 seconds, 360° over 0.5 seconds. Woosh cues follow timeline crossings at 1.5, 2.5 and 3.5 seconds. Rendering and audio dispatch occur on the first browser frame at/after each deadline; background-tab throttling can delay presentation, but cannot change the landing or accumulated rotation.
- `src/audio.js`: optional preloaded/decoded Web Audio buffers; each cue creates its own overlapping source. Browser audio is unlocked by Toss. Missing/unavailable files remain silent. An immediate click before decoding completes can be silent.
- `src/particles.js`: 10 steady falling capsules for one green; 100 staggered varied ballistic/curved capsules for double green. All use the same weighted colors and darker bottoms, cannot intercept clicks, and are removed after exiting below the viewport or the lifetime limit.
- `src/main.js`: locks overlapping tosses, chooses the landing before animation, cycles colors every 125 ms, and applies one landing effect. Temporary green colors never celebrate.

## Supplied assets

The supplied reference is included at `public/assets/megavitamin-template.png`. Replace it there if needed; it is a reference, not the rendered graphic. Change SVG geometry in `src/capsule.js` to alter the actual capsule.

Audio was not supplied. Upload these exact filenames into `public/audio/`:

| File | Cue |
| --- | --- |
| thrown.mp3 | Toss starts |
| woosh.mp3 | Each constant-speed revolution completes |
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

## Publish to GitHub Pages

This delivery is local: the connected GitHub tool does not support creating repositories, and GitHub CLI was unavailable. Install GitHub CLI and authenticate, then run from this project directory:

```sh
gh auth login
git init -b main
git add .
git commit -m "Build Mega Toss simulator"
gh repo create mega-toss --public --source=. --remote=origin
gh api --method POST repos/darrinjmajocha/mega-toss/pages -f build_type=workflow
git push -u origin main
```

If Pages API setup is unavailable, select **Settings → Pages → Source → GitHub Actions** in the repository, then rerun the workflow. If the repository name already exists, inspect it before choosing a different name or connecting a remote; do not overwrite an existing project.

`.github/workflows/pages.yml` tests, builds and publishes on main pushes and manual runs. All app/asset paths are relative so `/mega-toss/` hosting works. Deployment needs Pages and Actions permissions. After a successful workflow, the expected URLs are:

- Repository: https://github.com/darrinjmajocha/mega-toss
- Game: https://darrinjmajocha.github.io/mega-toss/

These are intended destinations, not verified live links. Actual MP3 playback and live Pages deployment require the missing assets and publishing setup.

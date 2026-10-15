# Animation asset pipeline (v1)

## Approved direction versus production readiness

The latest Vaynika character concept is the approved **art direction**. It is not yet a consistent, transparent set of individually reviewed 300×300 gameplay frames.

## Production gates

1. Export **one** full-body side-facing-right master on transparent background, in the approved costume.
2. Confirm facial identity, proportions, armor construction, boots, sword and restrained gold accents.
3. Generate each state as individual 300×300 PNG frames with a fixed foot baseline and consistent camera distance.
4. QA every frame for clipping, inconsistent anatomy, missing equipment, floating feet, background contamination, and sprite silhouette.
5. Pack with Phaser-compatible JSON Hash metadata; filenames and counts are specified in `public/assets/vaynika/README.md`.
6. Load atlas, verify each state and compare browser FPS against the Chrome production baseline (~60 FPS on the test laptop).

## Runtime guarantees

The game continues to run with placeholder animation if the atlas is missing or incomplete. Atlas frame selection does not alter Arcade Physics bodies or movement constants. No per-frame image allocations are required. Animation states are driven by movement/combat input, not random cosmetic actions.

## Performance gates

Test `npm run build && npm run preview` in Chrome and Arc; record average and low-percentile FPS during idle, running, jumping and guard combat. Measure atlas dimensions, memory footprint and load time before expanding resolution. Prefer prepacked atlases over dynamically creating many textures at startup.

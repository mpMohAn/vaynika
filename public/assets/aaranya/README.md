# Optional Aaranya costume atlases

No production sprites are bundled yet. Keep the existing playable placeholder until reviewed transparent artwork is ready.

To preview, supply both files for one costume:
- `public/assets/aaranya/crimson/atlas.png` and `atlas.json`
- `public/assets/aaranya/lehenga/atlas.png` and `atlas.json`

For the **first playable integration**, pack Phaser-compatible JSON Hash metadata with **idle (6), run (8), jump (6)** frames. Other states can be added later: attack (8), block (4), hurt (4), death (4). If any optional state is supplied, include its full frame count. Missing optional animations temporarily display Aaranya's idle art while the existing physics and controls continue. Use names like `idle_00` and `run_07`.

Run `npm run dev` and visit `/?costume=crimson` or `/?costume=lehenga`. Without a query parameter, the original placeholder is used. Missing or incomplete atlases fall back to the placeholder. The overlay keeps the physics body's existing size, offsets, movement, collision, and combat mechanics unchanged.

**Art export requirement:** each atlas frame must use a consistent full canvas height and fixed foot baseline. The visual overlay scales the first idle frame to 82 world pixels high, anchors it at the character's feet, and applies the same scale to every animation. Mixed frame sizes or cropped/trimmed frames will misalign. Use untrimmed 300×300 source frames and a consistent pivot; verify in gameplay.

The costume references are not verified production sprites; generated checkerboard backgrounds are not actual alpha transparency. Extract, clean and align each frame before packing. See `docs/AARANYA_CHARACTER_PRODUCTION.md` for approval and performance gates.

Note: requesting a costume without the corresponding files may log missing-asset network errors, but the playable prototype remains available.

# Vaynika animation atlas

The approved **character concept board is a visual reference**, not an exportable game spritesheet. Do not crop its tiny preview figures and call them final frames.

Place the **reviewed** final assets here:

- `vaynika.png` — transparent packed sprite atlas
- `vaynika.json` — Phaser-compatible JSON Hash atlas metadata

Required named frames (zero-based, padded to two digits):
- `idle_00` … `idle_05`
- `run_00` … `run_07`
- `jump_00` … `jump_05`
- `attack_00` … `attack_07`
- `block_00` … `block_03`
- `hurt_00` … `hurt_03`
- `death_00` … `death_03`

Each source pose should be exported at 300×300 px with transparent background, consistent character scale, center line, foot baseline, facing right and no clipped hair, sword, boots or cloth. Keep collision boxes independent of visible artwork. Pack frames into one or more power-of-two-friendly atlases, avoiding excessive blank space.

**Activation:** Once both files exist and all named frames validate, the game uses the atlas automatically. Until then, the existing lightweight placeholders remain functional.

The final art must preserve Vaynika's approved facial identity, hairstyle, proportions and black/bronze/crimson palette; no magical effects. License original assets CC BY 4.0, and document external asset sources separately.

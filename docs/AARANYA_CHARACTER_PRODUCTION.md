# Aaranya — character production contract (draft)

Status: **production specification, not approved final sprites**. Aaranya is the working character name. Do not rename the existing playable Vaynika prototype or repository until the name is confirmed.

## Reference wardrobe

- **Costume 01 / Crimson Palace:** short, asymmetrical crimson drape with gold embroidery, coordinated blouse, trailing dupatta, jewelry, long dark wavy hair. Retain the established front and back references.
- **Costume 02 / Royal Lehenga:** separate full-length red embroidered lehenga, coordinated blouse and dupatta. Keep front/back detailing consistent.
- Do not include the burgundy shirt / black mini-skirt concept in the current production board.
- Do not substitute the Royal Lehenga for Costume 01 or combine the two silhouettes.
- The concept images are **visual references**, not transparent sprites or a validated turnaround.

## Gameplay master approval

Create and review **one neutral, full-body side-facing-right pose** before any animation sheet. It must be non-explicit, appropriate for movement, and readable at game scale. If the art generator cannot produce it, retain the current placeholder; do not silently change the approved reference design.

Checklist:
- Same facial identity, hairline, complexion and proportions across frames.
- Distinct crimson-and-gold silhouette; no accidental costume crossover.
- No cropped hair, fabric, feet, jewelry or hands.
- Clean transparent background and consistent lighting.
- Foot contact line, ground shadow policy, camera distance and pivot fixed.
- No weapons or new accessories unless approved for that animation state.

## Animation contract (per costume)

| State | Frames | FPS | Loop | Gameplay |
|---|---:|---:|---|---|
| idle | 6 | 6 | yes | neutral breathing |
| run | 8 | 12 | yes | consistent ground contact |
| jump | 6 | 12 | no | takeoff / airborne / landing |
| attack | 8 | 18 | no | clear readable strike |
| block | 4 | 8 | yes | held defensive stance |
| hurt | 4 | 12 | no | brief impact reaction |
| death | 4 | 8 | no | non-looping defeat |

These counts match the existing animation manifest, not yet real exported frames. Start with idle, run and jump; only expand after their identity and motion are reviewed.

## Asset structure

Use a stable atlas key per costume, e.g. `aaranya-crimson-atlas` and `aaranya-lehenga-atlas`. Frame names: `idle_00` … `idle_05`, `run_00` … `run_07`, etc. Store transparent source PNGs separately from packed Phaser atlas PNG/JSON. Keep each costume's source files and exports distinct.

The scene currently uses 52×82 placeholder textures and a 30×72 collision body with offset 11,7. **Do not swap in 300×300 art without adjusting render scale, sprite origin and physics body offsets**; otherwise hitboxes and foot alignment will be wrong. The collision geometry should remain constant in world units after visual replacement.

## Integration gates

1. Approve the neutral master.
2. Export and QA all frames for the first animation state.
3. Pack a Phaser-compatible JSON Hash atlas and validate exact frame names.
4. Load the atlas before registering animations.
5. Test a visual-only sprite swap, preserving movement speed, jump impulse, guard behavior and sword reach.
6. Compare production-build FPS in Chrome and Arc to the existing ~60 FPS Chrome baseline, including idle, run, jump and combat.
7. Only then consider the second costume or cinematic transitions.

**No final sprites have been generated or integrated at this stage.**

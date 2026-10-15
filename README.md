# Vaynika

**Vaynika** is an open-source, cinematic 2D action-platformer set in the fictional Deccan kingdom of Suvarnagiri. Play as Queen Vaynika, a human warrior, strategist and ruler defending her kingdom.

## Status

Early playable browser prototype. Art in this prototype uses **original procedural/vector placeholders**, not approved final character sprites.

## Play locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Use `npm run build` to create `dist/` for static hosting (including Cloudflare Pages).

## Controls

- **A / D** or **Left / Right**: move
- **W / Up / Space**: jump
- **J**: sword attack
- **K / Shift**: block
- **R**: restart

Reach the golden exit after defeating the guard. You can also use the on-screen touch controls.

## Tech

Phaser 3, TypeScript, Vite. Desktop and mobile browser friendly. No backend, accounts, or telemetry.

## Roadmap

1. Movement, collisions, combat and playable room (initial prototype)
2. Approved Vaynika character master, consistent sprite animations and equipment
3. Palace escape level with traps, enemies, camera choreography and sound
4. Narrative, checkpoints, accessibility, testing and performance optimization
5. Public browser release

Read [game design](docs/GAME_DESIGN.md), [architecture](docs/ARCHITECTURE.md), and [asset guide](docs/ASSETS.md).

## Licensing

- **Code**: MIT, see [LICENSE](LICENSE)
- **Original game artwork and other original creative assets**: Creative Commons Attribution 4.0 International (CC BY 4.0), see [ASSET-LICENSE.md](ASSET-LICENSE.md).
- Third-party dependencies retain their own licenses. Contributions must be original or properly licensed.

Copyright (c) 2026 Vaynika contributors.

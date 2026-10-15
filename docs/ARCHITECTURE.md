# Architecture

- **Vite** bundles a static browser game; **TypeScript** enforces contracts.
- **Phaser 3 Arcade Physics** handles player/enemy/platform collision.
- `src/main.ts` owns game initialization and resize scaling.
- `src/scenes/PalaceScene.ts` contains the initial playable vertical slice. Refactor into player, enemy, level, UI and state modules as complexity grows.
- Placeholder textures are drawn programmatically to avoid accidental use of unlicensed art.
- Target fixed logical resolution 960×540, scaling to fit viewport.
- No backend, login, analytics or network dependency beyond initial static file delivery.

## Definition of done for first slice
`npm run build` succeeds; player can move, jump, attack, block, win, lose and restart; screen scales; controls are documented.

## Planned quality checks
Automated build, browser smoke tests, keyboard and touch verification, performance profiling on mid-range Android, and sprite visual QA before final art integration.

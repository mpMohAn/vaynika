import Phaser from 'phaser';

export const VAYNIKA_STATES = {
    idle: { frames: 6, fps: 6, repeat: -1 },
    run: { frames: 8, fps: 12, repeat: -1 },
    jump: { frames: 6, fps: 12, repeat: 0 },
    attack: { frames: 8, fps: 18, repeat: 0 },
    block: { frames: 4, fps: 8, repeat: -1 },
    hurt: { frames: 4, fps: 12, repeat: 0 },
    death: { frames: 4, fps: 8, repeat: 0 }
} as const;

export type VaynikaState = keyof typeof VAYNIKA_STATES;

/**
 * The final art is not yet exported. Enable external sprites only when every
 * required atlas frame is present; otherwise keep the tested prototype art.
 */
export function hasCompleteVaynikaAtlas(scene: Phaser.Scene): boolean {
    if (!scene.textures.exists('vaynika-atlas')) return false;
    const texture = scene.textures.get('vaynika-atlas');
    return Object.entries(VAYNIKA_STATES).every(([state, config]) =>
        Array.from({ length: config.frames }, (_, i) =>
            texture.has(state + '_' + String(i).padStart(2, '0'))
        ).every(Boolean)
    );
}

export function registerVaynikaAtlasAnimations(scene: Phaser.Scene): void {
    if (!hasCompleteVaynikaAtlas(scene)) return;
    for (const [state, config] of Object.entries(VAYNIKA_STATES)) {
        const key = 'vaynika-atlas-' + state;
        if (scene.anims.exists(key)) continue;
        scene.anims.create({
            key,
            frames: Array.from({ length: config.frames }, (_, i) => ({
                key: 'vaynika-atlas',
                frame: state + '_' + String(i).padStart(2, '0')
            })),
            frameRate: config.fps,
            repeat: config.repeat
        });
    }
}

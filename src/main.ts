import Phaser from 'phaser';
import { PalaceScene } from './scenes/PalaceScene';
import './style.css';
import { resolveAvailableCostume } from './animation/costumeAvailability';

const availableCostume = await resolveAvailableCostume(window.location.search);

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 540,
    backgroundColor: '#241d31',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 950 }, debug: false }
    },
    scene: [new PalaceScene(availableCostume)],
    render: { pixelArt: false, antialias: true }
});

// Browser smoke-test hook: available only in Vite development mode.
if (import.meta.env.DEV) Object.assign(window, { __vaynikaGame: game });

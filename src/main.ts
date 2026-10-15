import Phaser from 'phaser';
import { PalaceScene } from './scenes/PalaceScene';
import './style.css';

new Phaser.Game({
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
    scene: [PalaceScene],
    render: { pixelArt: false, antialias: true }
});

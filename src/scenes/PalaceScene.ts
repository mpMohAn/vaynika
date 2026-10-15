import Phaser from 'phaser';
import { hasCompleteCharacterAtlas, registerCharacterAtlasAnimations, type CharacterCostume } from '../animation/characterAnimations';

type Fighter = Phaser.Physics.Arcade.Sprite;

export class PalaceScene extends Phaser.Scene {
    private player!: Fighter;
    private characterVisual?: Phaser.GameObjects.Sprite;
    private costume: CharacterCostume | null = null;
    private guard!: Fighter;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys!: Record<string, Phaser.Input.Keyboard.Key>;
    private health = 5;
    private guardHealth = 3;
    private lastAttack = 0;
    private lastGuardAttack = 0;
    private invulnerableUntil = 0;
    private gameOver = false;
    private guardAlive = true;
    private healthText!: Phaser.GameObjects.Text;
    private statusText!: Phaser.GameObjects.Text;
    private touch = { left: false, right: false, jump: false, attack: false, block: false };
    private attackPressed = false;
    private swordEffect!: Phaser.GameObjects.Rectangle;
    private fpsText!: Phaser.GameObjects.Text;
    private showFps = false;
    private nextFpsUpdate = 0;
    private guardWindupUntil = 0;
    private guardReadyAt = 0;
    private lastPlayerTint = -1;
    private exitHintShown = false;
    private sampleUpdateMs = 0;
    private sampleFrames = 0;
    private lastUpdateMs = 0;
    private attackAnimationUntil = 0;

    constructor(availableCostume: CharacterCostume | null = null) {
        super('Palace');
        this.costume = availableCostume;
    }

    preload(): void {
        // Opt-in art preview: ?costume=crimson or ?costume=lehenga.
        // Missing/incomplete assets never disable the existing playable prototype.
        if (this.costume) {
            const name = this.costume;
            this.load.atlas('aaranya-' + name + '-atlas',
                'assets/aaranya/' + name + '/atlas.png',
                'assets/aaranya/' + name + '/atlas.json');
        }
    }

    create(): void {
        this.health = 5;
        this.guardHealth = 3;
        this.lastAttack = 0;
        this.lastGuardAttack = 0;
        this.invulnerableUntil = 0;
        this.gameOver = false;
        this.guardAlive = true;
        this.touch = { left: false, right: false, jump: false, attack: false, block: false };
        this.attackPressed = false;
        this.guardWindupUntil = 0;
        this.guardReadyAt = 0;
        this.showFps = true;
        this.nextFpsUpdate = 0;
        this.lastPlayerTint = -1;
        this.exitHintShown = false;
        this.sampleUpdateMs = 0;
        this.sampleFrames = 0;
        this.lastUpdateMs = 0;
        this.attackAnimationUntil = 0;

        this.makeTextures();
        this.registerAnimations();
        this.cameras.main.setBackgroundColor('#30283b');
        this.add.rectangle(480, 255, 960, 510, 0x3b3045);
        this.add.rectangle(480, 420, 960, 200, 0x554050);
        for (let x = 60; x < 960; x += 160) {
            this.add.rectangle(x, 265, 28, 315, 0xa78372);
            this.add.rectangle(x, 115, 55, 20, 0xd1ab84);
            this.add.rectangle(x, 418, 58, 16, 0x806055);
        }
        this.add.text(480, 36, 'VAYNIKA  •  THE PALACE ESCAPE', {
            fontFamily: 'Georgia, serif', fontSize: '28px', color: '#f8dbac'
        }).setOrigin(0.5);

        const platforms = this.physics.add.staticGroup();
        const ground = platforms.create(480, 518, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.refreshBody();
        const ledge = platforms.create(450, 365, 'ledge') as Phaser.Physics.Arcade.Sprite;
        ledge.refreshBody();

        this.player = this.physics.add.sprite(130, 430, 'vaynika');
        this.player.setCollideWorldBounds(true).setMaxVelocity(250, 750);
        this.player.body!.setSize(30, 72).setOffset(11, 7);
        this.physics.add.collider(this.player, platforms);
        this.player.play('vaynika-idle');
        this.createCharacterVisual();

        this.guard = this.physics.add.sprite(670, 430, 'guard');
        this.guard.setCollideWorldBounds(true);
        this.guard.body!.setSize(32, 72).setOffset(10, 7);
        this.physics.add.collider(this.guard, platforms);

        this.add.rectangle(916, 430, 44, 100, 0x9b723b).setStrokeStyle(3, 0xf4cd7d);
        this.add.text(916, 362, 'EXIT', { fontSize: '16px', color: '#ffdf9c' }).setOrigin(0.5);
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keys = this.input.keyboard!.addKeys('A,D,W,J,K,R,SHIFT,SPACE,F') as Record<string, Phaser.Input.Keyboard.Key>;
        this.healthText = this.add.text(24, 75, '', { fontSize: '19px', color: '#ffe5c1' });
        this.statusText = this.add.text(480, 115, '', { fontSize: '20px', color: '#fff0ca', align: 'center' }).setOrigin(0.5);
        this.add.text(480, 505, 'A/D MOVE   •   W/SPACE JUMP   •   J ATTACK   •   K BLOCK   •   R RESTART', {
            fontSize: '14px', color: '#f6e5d4'
        }).setOrigin(0.5);
        this.swordEffect = this.add.rectangle(0, 0, 47, 7, 0xf4e9ca).setVisible(false);
        this.fpsText = this.add.text(710, 75, 'FPS -- | CPU --ms', { fontSize: '18px', color: '#d9e9d2', backgroundColor: '#211d2d', padding: { x: 8, y: 5 } }).setDepth(100).setVisible(true);
        this.setupTouch();
        this.refreshHud();
    }

    update(time: number): void {
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.scene.restart();
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
            this.showFps = !this.showFps;
            this.fpsText.setVisible(this.showFps);
        }
        if (this.showFps && time >= this.nextFpsUpdate) {
            const meanUpdate = this.sampleFrames ? this.sampleUpdateMs / this.sampleFrames : 0;
            this.fpsText.setText('FPS ' + Math.round(this.game.loop.actualFps) + ' | CPU ' + meanUpdate.toFixed(2) + 'ms');
            this.sampleFrames = 0;
            this.sampleUpdateMs = 0;
            this.nextFpsUpdate = time + 500;
        }
        if (this.gameOver) return;
        const updateStart = performance.now();

        const left = this.cursors.left.isDown || this.keys.A.isDown || this.touch.left;
        const right = this.cursors.right.isDown || this.keys.D.isDown || this.touch.right;
        const jump = this.cursors.up.isDown || this.cursors.space.isDown ||
            this.keys.W.isDown || this.keys.SPACE.isDown || this.touch.jump;
        const block = this.keys.K.isDown || this.keys.SHIFT.isDown || this.touch.block;
        const attack = this.keys.J.isDown || this.touch.attack;
        const direction = Number(right) - Number(left);
        this.player.setVelocityX(block ? 0 : direction * 225);
        if (direction !== 0) this.player.setFlipX(direction < 0);
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (jump && body.blocked.down && !block) this.player.setVelocityY(-470);
        const animation = time < this.invulnerableUntil ? 'hurt' :
            block ? 'block' : time < this.attackAnimationUntil ? 'attack' :
            !body.blocked.down ? 'jump' : direction !== 0 ? 'run' : 'idle';
        const animationKey = 'vaynika-' + animation;
        if (this.player.anims.currentAnim?.key !== animationKey) this.player.play(animationKey);
        if (this.characterVisual) {
            const visualKey = 'aaranya-' + this.costume + '-' + animation;
            if (this.characterVisual.anims.currentAnim?.key !== visualKey) {
                this.characterVisual.play(visualKey);
            }
            this.characterVisual.setPosition(this.player.x, this.player.y + 41);
            this.characterVisual.setFlipX(this.player.flipX);
        }
        const desiredTint = block ? 0x91c8db : time < this.invulnerableUntil ? 0xffa7a7 : 0xffffff;
        if (desiredTint !== this.lastPlayerTint) {
            this.player.setTint(desiredTint);
            this.characterVisual?.setTint(desiredTint);
            this.lastPlayerTint = desiredTint;
        }

        if (attack && !this.attackPressed && !block && time - this.lastAttack > 350) {
            this.lastAttack = time;
            this.attackAnimationUntil = time + 240;
            const facing = this.player.flipX ? -1 : 1;
            this.tweens.killTweensOf(this.swordEffect);
            this.swordEffect.setPosition(this.player.x + facing * 39, this.player.y - 9);
            this.swordEffect.setAlpha(1).setVisible(true);
            this.tweens.add({ targets: this.swordEffect, alpha: 0, duration: 160,
                onComplete: () => this.swordEffect.setVisible(false) });
            if (this.guardAlive && Math.abs(this.player.x - this.guard.x) < 90 &&
                Math.abs(this.player.y - this.guard.y) < 55 &&
                (this.guard.x - this.player.x) * facing > 0) {
                this.guardHealth--;
                this.guard.setTint(0xff7777);
                this.time.delayedCall(160, () => { if (this.guard.active) this.guard.clearTint(); });
                if (this.guardHealth <= 0) {
                    this.guardAlive = false;
                    this.guard.disableBody(true, true);
                    this.statusText.setText('Guard defeated — reach the golden exit!');
                }
                this.refreshHud();
            }
        }
        this.attackPressed = attack;

        if (this.guardAlive) {
            const distance = this.player.x - this.guard.x;
            this.guard.setFlipX(distance < 0);
            this.guard.setVelocityX(Math.abs(distance) > 75 && Math.abs(distance) < 340 ?
                Math.sign(distance) * 75 : 0);
            const inRange = Math.abs(distance) < 66 && Math.abs(this.player.y - this.guard.y) < 60;
            // Telegraph before striking: the player has time to react and block.
            if (this.guardWindupUntil > 0 && time >= this.guardWindupUntil) {
                this.guardWindupUntil = 0;
                this.guard.clearTint();
                this.lastGuardAttack = time;
                this.guardReadyAt = time + 1050;
                if (inRange && !block && time >= this.invulnerableUntil) this.damage(time);
            } else if (this.guardWindupUntil === 0 && inRange && time >= this.guardReadyAt) {
                this.guardWindupUntil = time + 400;
                this.guard.setTint(0xffcc66);
            }
        }

        if (this.player.x > 885 && body.blocked.down) {
            if (!this.guardAlive) this.finish('VICTORY! Suvarnagiri will never kneel. Press R to replay.');
            else if (!this.exitHintShown) {
                this.statusText.setText('Defeat the guard before escaping!');
                this.exitHintShown = true;
            }
        }
        this.lastUpdateMs = performance.now() - updateStart;
        this.sampleUpdateMs += this.lastUpdateMs;
        this.sampleFrames++;
    }

    private createCharacterVisual(): void {
        this.characterVisual = undefined;
        if (!this.costume || !hasCompleteCharacterAtlas(this, this.costume)) return;
        registerCharacterAtlasAnimations(this, this.costume);
        const atlasKey = 'aaranya-' + this.costume + '-atlas';
        // The visual is independent of the Arcade body and is anchored to its feet.
        this.characterVisual = this.add.sprite(this.player.x, this.player.y + 41,
            atlasKey, 'idle_00').setOrigin(0.5, 1).setDepth(this.player.depth + 1);
        const sourceHeight = this.characterVisual.height;
        if (sourceHeight <= 0) {
            this.characterVisual.destroy();
            this.characterVisual = undefined;
            return;
        }
        this.characterVisual.setScale(82 / sourceHeight);
        this.characterVisual.play('aaranya-' + this.costume + '-idle');
        this.player.setAlpha(0);
    }

    private damage(time: number): void {
        this.health--;
        this.invulnerableUntil = time + 750;
        this.player.setVelocityX(this.player.x < this.guard.x ? -180 : 180);
        this.refreshHud();
        if (this.health <= 0) this.finish('Vaynika has fallen. Press R to retry.');
    }

    private finish(message: string): void {
        this.gameOver = true;
        this.player.setVelocityX(0);
        this.guard.setVelocityX(0);
        this.statusText.setText(message);
    }

    private refreshHud(): void {
        this.healthText.setText('HEALTH  ' + '♥'.repeat(this.health) +
            '   |   GUARD  ' + Math.max(0, this.guardHealth));
    }

    private makeTextures(): void {
        const g = this.make.graphics({ x: 0, y: 0 });
        g.fillStyle(0x66504a).fillRect(0, 0, 960, 44);
        g.fillStyle(0xb68c70).fillRect(0, 0, 960, 7);
        g.generateTexture('ground', 960, 44);
        g.clear();
        g.fillStyle(0x7d5a4d).fillRect(0, 0, 190, 18);
        g.fillStyle(0xd0a27c).fillRect(0, 0, 190, 5);
        g.generateTexture('ledge', 190, 18);
        g.clear();
        g.fillStyle(0x241923).fillEllipse(26, 21, 35, 36);
        g.fillStyle(0xb98260).fillEllipse(26, 21, 23, 26);
        g.fillStyle(0x261b28).fillRect(13, 8, 25, 7);
        g.fillStyle(0x252832).fillRoundedRect(11, 36, 30, 29, 5);
        g.lineStyle(3, 0xc18b51).strokeRoundedRect(11, 36, 30, 29, 5);
        g.fillStyle(0x9b2b3c).fillTriangle(11, 38, 0, 80, 21, 71);
        g.fillStyle(0x24232b).fillRect(12, 64, 11, 17).fillRect(30, 64, 11, 17);
        g.generateTexture('vaynika', 52, 82);
        g.clear();
        g.fillStyle(0x5b626c).fillEllipse(26, 22, 29, 29);
        g.fillStyle(0x3c434d).fillRoundedRect(11, 37, 30, 29, 4);
        g.fillStyle(0x292e36).fillRect(12, 65, 11, 16).fillRect(30, 65, 11, 16);
        g.generateTexture('guard', 52, 82);
        g.destroy();
        // Temporary animation poses use small reusable textures. Final detailed
        // anime spritesheets can replace these without changing physics or controls.
        const pose = this.make.graphics({ x: 0, y: 0 });
        for (const state of ['idle', 'run', 'jump', 'attack', 'block', 'hurt']) {
            const count = state === 'run' ? 6 : state === 'idle' ? 4 : 1;
            for (let i = 0; i < count; i++) {
                pose.clear();
                const stride = state === 'run' ? Math.sin(i * Math.PI / 3) * 7 : 0;
                const bob = state === 'idle' ? Math.sin(i * Math.PI / 2) * 1.5 : 0;
                const lean = state === 'attack' ? 4 : state === 'hurt' ? -3 : 0;
                const y = state === 'jump' ? -4 : bob;
                pose.fillStyle(0x241923).fillEllipse(26 + lean, 21 + y, 35, 36);
                pose.fillStyle(0xb98260).fillEllipse(26 + lean, 21 + y, 23, 26);
                pose.fillStyle(0x261b28).fillRect(13 + lean, 8 + y, 25, 7);
                pose.fillStyle(state === 'block' ? 0x3d5965 : 0x252832)
                    .fillRoundedRect(11 + lean, 36 + y, 30, 29, 5);
                pose.lineStyle(3, 0xc18b51).strokeRoundedRect(11 + lean, 36 + y, 30, 29, 5);
                pose.fillStyle(0x9b2b3c).fillTriangle(11 + lean, 38 + y, 0, 80, 21, 71);
                pose.lineStyle(9, 0x24232b);
                pose.lineBetween(18 + lean, 64 + y, 18 + lean + stride, 78);
                pose.lineBetween(35 + lean, 64 + y, 35 + lean - stride, 78);
                if (state === 'attack') {
                    pose.lineStyle(5, 0xb98260).lineBetween(40, 40, 51, 23);
                } else if (state === 'block') {
                    pose.lineStyle(5, 0xb98260).lineBetween(38, 45, 24, 30);
                }
                pose.generateTexture('vaynika-' + state + '-' + i, 52, 82);
            }
        }
        pose.destroy();
    }

    private registerAnimations(): void {
        for (const [state, count, rate] of [
            ['idle', 4, 5], ['run', 6, 12], ['jump', 1, 1],
            ['attack', 1, 1], ['block', 1, 1], ['hurt', 1, 1]
        ] as const) {
            const key = 'vaynika-' + state;
            if (this.anims.exists(key)) continue;
            const frames = Array.from({ length: count }, (_, i) => ({
                key: key + '-' + i
            }));
            this.anims.create({ key, frames, frameRate: rate, repeat: -1 });
        }
    }

    private setupTouch(): void {
        const buttons: Array<[string, number, keyof typeof this.touch]> = [
            ['◀', 55, 'left'], ['▶', 123, 'right'], ['▲', 690, 'jump'],
            ['⚔', 765, 'attack'], ['▣', 840, 'block']
        ];
        for (const [label, x, key] of buttons) {
            const button = this.add.text(x, 460, label, {
                fontSize: '27px', color: '#fff0d4', backgroundColor: '#564557',
                padding: { x: 12, y: 8 }
            }).setOrigin(0.5).setAlpha(0.85).setInteractive();
            button.on('pointerdown', () => { this.touch[key] = true; });
            button.on('pointerup', () => { this.touch[key] = false; });
            button.on('pointerout', () => { this.touch[key] = false; });
        }
    }
}

import Phaser from 'phaser';

type Fighter = Phaser.Physics.Arcade.Sprite;

export class PalaceScene extends Phaser.Scene {
    private player!: Fighter;
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

    constructor() { super('Palace'); }

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

        this.makeTextures();
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

        this.guard = this.physics.add.sprite(670, 430, 'guard');
        this.guard.setCollideWorldBounds(true);
        this.guard.body!.setSize(32, 72).setOffset(10, 7);
        this.physics.add.collider(this.guard, platforms);

        this.add.rectangle(916, 430, 44, 100, 0x9b723b).setStrokeStyle(3, 0xf4cd7d);
        this.add.text(916, 362, 'EXIT', { fontSize: '16px', color: '#ffdf9c' }).setOrigin(0.5);
        this.physics.add.overlap(this.player, this.guard, () => this.guardContact());
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keys = this.input.keyboard!.addKeys('A,D,W,J,K,R,SHIFT,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;
        this.healthText = this.add.text(24, 75, '', { fontSize: '19px', color: '#ffe5c1' });
        this.statusText = this.add.text(480, 115, '', { fontSize: '20px', color: '#fff0ca', align: 'center' }).setOrigin(0.5);
        this.add.text(480, 505, 'A/D MOVE   •   W/SPACE JUMP   •   J ATTACK   •   K BLOCK   •   R RESTART', {
            fontSize: '14px', color: '#f6e5d4'
        }).setOrigin(0.5);
        this.setupTouch();
        this.refreshHud();
    }

    update(time: number): void {
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.scene.restart();
            return;
        }
        if (this.gameOver) return;

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
        this.player.setTint(block ? 0x91c8db : time < this.invulnerableUntil ? 0xffa7a7 : 0xffffff);

        if (attack && !this.attackPressed && !block && time - this.lastAttack > 350) {
            this.lastAttack = time;
            const facing = this.player.flipX ? -1 : 1;
            const sword = this.add.rectangle(this.player.x + facing * 39, this.player.y - 9, 47, 7, 0xf4e9ca);
            this.tweens.add({ targets: sword, alpha: 0, duration: 160, onComplete: () => sword.destroy() });
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
            if (Math.abs(distance) < 66 && Math.abs(this.player.y - this.guard.y) < 60 &&
                time - this.lastGuardAttack > 1050) {
                this.lastGuardAttack = time;
                if (!block && time >= this.invulnerableUntil) this.damage(time);
            }
        }

        if (this.player.x > 885 && body.blocked.down) {
            if (!this.guardAlive) this.finish('VICTORY! Suvarnagiri will never kneel. Press R to replay.');
            else this.statusText.setText('Defeat the guard before escaping!');
        }
    }

    private guardContact(): void {
        // Combat is handled through timed, readable proximity attacks.
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

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4179', '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', chunk => { serverLog += chunk.toString(); });
server.stderr.on('data', chunk => { serverLog += chunk.toString(); });
let browser;

function assert(condition, message) {
    if (!condition) throw new Error(message);
    console.log('PASS ' + message);
}
async function ready(url) {
    for (let attempt = 0; attempt < 80; attempt++) {
        try {
            const response = await fetch(url);
            if (response.ok) return;
        } catch { /* server still starting */ }
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error('Vite did not start: ' + serverLog);
}
async function snapshot(page) {
    return page.evaluate(() => {
        const game = window.__vaynikaGame;
        const scene = game?.scene.getScene('Palace');
        return {
            canvas: !!document.querySelector('#game canvas'),
            active: !!scene?.sys.isActive(),
            playerX: scene?.player?.x,
            playerY: scene?.player?.y,
            health: scene?.health,
            guardHealth: scene?.guardHealth,
            guardAlive: scene?.guardAlive,
            gameOver: scene?.gameOver,
            visual: !!scene?.characterVisual,
            fps: scene?.fpsText?.text,
            fpsVisible: scene?.fpsText?.visible
        };
    });
}

try {
    await ready('http://127.0.0.1:4179/');
    browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
    for (const costume of ['', 'crimson', 'lehenga']) {
        const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('http://127.0.0.1:4179/' + (costume ? '?costume=' + costume : ''));
        await page.waitForFunction(() => window.__vaynikaGame?.scene.getScene('Palace')?.player?.active, { timeout: 15000 });
        const initial = await snapshot(page);
        assert(initial.canvas && initial.active && initial.health === 5 && initial.guardHealth === 3,
            (costume || 'default') + ': game starts with expected health');
        assert(!initial.visual, (costume || 'default') + ': placeholder remains when atlas is unavailable');

        await page.keyboard.down('d');
        await page.waitForTimeout(320);
        await page.keyboard.up('d');
        const moved = await snapshot(page);
        assert(moved.playerX > initial.playerX + 10, (costume || 'default') + ': move right');

        await page.keyboard.down('a');
        await page.waitForTimeout(200);
        await page.keyboard.up('a');
        const reversed = await snapshot(page);
        assert(reversed.playerX < moved.playerX - 5, (costume || 'default') + ': move left');

        // Force the character onto the ground before testing jump to avoid
        // a timing-sensitive assertion during the initial gravity drop.
        await page.waitForTimeout(700);
        const grounded = await snapshot(page);
        await page.keyboard.down('w');
        await page.waitForTimeout(90);
        const jumped = await snapshot(page);
        await page.keyboard.up('w');
        assert(jumped.playerY < grounded.playerY - 2, (costume || 'default') + ': jump');

        await page.keyboard.down('k');
        await page.waitForTimeout(70);
        const blocked = await page.evaluate(() => {
            const scene = window.__vaynikaGame.scene.getScene('Palace');
            return scene.player.body.velocity.x === 0 && scene.player.anims.currentAnim?.key === 'vaynika-block';
        });
        await page.keyboard.up('k');
        assert(blocked, (costume || 'default') + ': block');

        await page.keyboard.down('j');
        await page.waitForTimeout(70);
        await page.keyboard.up('j');
        const attacked = await page.evaluate(() => window.__vaynikaGame.scene.getScene('Palace').lastAttack > 0);
        assert(attacked, (costume || 'default') + ': attack input');

        await page.keyboard.press('f');
        await page.waitForTimeout(60);
        assert(!(await snapshot(page)).fpsVisible, (costume || 'default') + ': FPS toggle');

        await page.keyboard.press('r');
        await page.waitForTimeout(200);
        const restarted = await snapshot(page);
        assert(restarted.health === 5 && restarted.guardHealth === 3 && !restarted.gameOver,
            (costume || 'default') + ': restart');

        assert(errors.length === 0, (costume || 'default') + ': no uncaught page errors: ' + errors.join('; '));
        await page.close();
    }
    console.log('Browser gameplay smoke tests passed.');
} finally {
    await browser?.close();
    server.kill('SIGTERM');
}

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'public/assets/aaranya';
const states = { idle: 6, run: 8, jump: 6, attack: 8, block: 4, hurt: 4, death: 4 };
let failures = 0;

function checkCostume(costume) {
    const dir = join(root, costume);
    const png = join(dir, 'atlas.png');
    const json = join(dir, 'atlas.json');
    const hasPng = existsSync(png);
    const hasJson = existsSync(json);

    if (!hasPng && !hasJson) {
        console.log(`SKIP ${costume}: no atlas supplied; game uses placeholder`);
        return;
    }
    if (!hasPng || !hasJson) {
        console.error(`FAIL ${costume}: atlas.png and atlas.json must be supplied together`);
        failures++;
        return;
    }

    let atlas;
    try {
        atlas = JSON.parse(readFileSync(json, 'utf8'));
    } catch (error) {
        console.error(`FAIL ${costume}: invalid atlas.json: ${error.message}`);
        failures++;
        return;
    }
    const frames = atlas.frames;
    if (!frames || Array.isArray(frames) || typeof frames !== 'object') {
        console.error(`FAIL ${costume}: Phaser JSON Hash format requires an object named frames`);
        failures++;
        return;
    }

    let frameCount = 0;
    const canvasSizes = new Set();
    const sourceSizes = new Set();
    for (const [state, count] of Object.entries(states)) {
        for (let i = 0; i < count; i++) {
            const name = `${state}_${String(i).padStart(2, '0')}`;
            const item = frames[name];
            if (!item) {
                console.error(`FAIL ${costume}: missing ${name}`);
                failures++;
                continue;
            }
            frameCount++;
            const rect = item.frame;
            if (!rect || ![rect.x, rect.y, rect.w, rect.h].every(v => Number.isInteger(v) && v >= 0) ||
                rect.w === 0 || rect.h === 0) {
                console.error(`FAIL ${costume}: invalid frame rectangle for ${name}`);
                failures++;
                continue;
            }
            canvasSizes.add(`${rect.w}x${rect.h}`);
            if (item.trimmed === true) {
                console.error(`FAIL ${costume}: ${name} is trimmed; fixed foot anchoring requires untrimmed frames`);
                failures++;
            }
            if (item.sourceSize) sourceSizes.add(`${item.sourceSize.w}x${item.sourceSize.h}`);
        }
    }
    if (canvasSizes.size > 1) {
        console.error(`FAIL ${costume}: inconsistent frame rectangles: ${[...canvasSizes].join(', ')}`);
        failures++;
    }
    if (sourceSizes.size > 1) {
        console.error(`FAIL ${costume}: inconsistent source sizes: ${[...sourceSizes].join(', ')}`);
        failures++;
    }

    // PNG signature and IHDR width/height; no external dependencies.
    const pngData = readFileSync(png);
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (pngData.length < 24 || !pngData.subarray(0, 8).equals(signature)) {
        console.error(`FAIL ${costume}: atlas.png is not a valid PNG header`);
        failures++;
    } else {
        const width = pngData.readUInt32BE(16);
        const height = pngData.readUInt32BE(20);
        for (const [name, item] of Object.entries(frames)) {
            const rect = item.frame;
            if (rect && [rect.x, rect.y, rect.w, rect.h].every(Number.isInteger) &&
                (rect.x < 0 || rect.y < 0 || rect.x + rect.w > width || rect.y + rect.h > height)) {
                console.error(`FAIL ${costume}: ${name} lies outside PNG ${width}x${height}`);
                failures++;
            }
        }
    }
    console.log(`CHECK ${costume}: ${frameCount} required frames inspected`);
}

checkCostume('crimson');
checkCostume('lehenga');
if (failures) {
    console.error(`Atlas validation failed: ${failures} issue(s)`);
    process.exitCode = 1;
} else {
    console.log('Atlas validation passed (missing optional costumes are skipped).');
}

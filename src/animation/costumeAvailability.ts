export type AvailableCostume = 'crimson' | 'lehenga';

/**
 * Check public assets before Phaser's loader sees them. Vite serves index.html
 * for unknown routes, so blindly loading a missing atlas.json causes a JSON
 * parse exception even though the game can use placeholder sprites.
 */
export async function resolveAvailableCostume(search: string): Promise<AvailableCostume | null> {
    const requested = new URLSearchParams(search).get('costume');
    if (requested !== 'crimson' && requested !== 'lehenga') return null;
    const base = import.meta.env.BASE_URL + 'assets/aaranya/' + requested + '/';
    try {
        const [image, metadata] = await Promise.all([
            fetch(base + 'atlas.png', { method: 'HEAD' }),
            fetch(base + 'atlas.json', { method: 'GET' })
        ]);
        if (!image.ok || !metadata.ok) return null;
        if (!image.headers.get('content-type')?.includes('image/png')) return null;
        if (!metadata.headers.get('content-type')?.includes('json')) return null;
        const json: unknown = await metadata.json();
        if (!json || typeof json !== 'object' || !('frames' in json)) return null;
        return requested;
    } catch {
        return null;
    }
}

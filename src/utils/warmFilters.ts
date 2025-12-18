// WARM Filters
// Implements Canva-like warm color grading

/**
 * WARM Filter Definition
 */
export interface WarmFilter {
    id: string;
    name: string;
    temperature: number;
    tint: number;
    contrast: number;
    saturation: number;
    brightness: number;
}

// SUN filter definitions (formerly WARM) - IDs match imageFilters.ts presets
export const WARM_FILTERS: WarmFilter[] = [
    {
        id: 'bali',
        name: 'SunCoast',
        temperature: 25,
        tint: 0,
        contrast: 1.0,
        saturation: 1.1,
        brightness: 0,
    },
    {
        id: 'capri',
        name: 'Golden Bay',
        temperature: 20,
        tint: 0,
        contrast: 1.1,
        saturation: 1.0,
        brightness: 5,
    },
    {
        id: 'latte',
        name: 'CreamWarm',
        temperature: 30,
        tint: 0,
        contrast: 1.0,
        saturation: 0.95,
        brightness: 5,
    },
    {
        id: 'bronz',
        name: 'AmberGlow',
        temperature: 35,
        tint: 5,
        contrast: 1.15,
        saturation: 1.1,
        brightness: 0,
    },
    {
        id: 'sandi',
        name: 'DesertTone',
        temperature: 20,
        tint: 0,
        contrast: 1.0,
        saturation: 1.05,
        brightness: 8,
    },
    {
        id: 'sangri',
        name: 'RubyHeat',
        temperature: 25,
        tint: 5,
        contrast: 1.1,
        saturation: 1.0,
        brightness: 0,
    },
];

/**
 * Apply WARM filter
 */
export async function applyWarmFilter(
    imgElement: HTMLImageElement,
    filter: WarmFilter
): Promise<string> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            resolve(imgElement.src);
            return;
        }

        const width = imgElement.naturalWidth || imgElement.width;
        const height = imgElement.naturalHeight || imgElement.height;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(imgElement, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            const a = data[i + 3];

            if (a < 10) continue;

            // Temperature (warm shift)
            const tempFactor = filter.temperature / 100;
            r = Math.min(255, r * (1 + tempFactor * 0.2));
            b = Math.max(0, b * (1 - tempFactor * 0.15));

            // Tint (magenta shift)
            if (filter.tint !== 0) {
                const tintFactor = filter.tint / 100;
                r = Math.min(255, r * (1 + tintFactor * 0.08));
                g = Math.max(0, g * (1 - tintFactor * 0.05));
            }

            // Brightness
            const brightFactor = 1 + filter.brightness / 100;
            r = r * brightFactor;
            g = g * brightFactor;
            b = b * brightFactor;

            // Contrast
            const mid = 128;
            r = mid + (r - mid) * filter.contrast;
            g = mid + (g - mid) * filter.contrast;
            b = mid + (b - mid) * filter.contrast;

            // Saturation
            if (filter.saturation !== 1) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = gray + (r - gray) * filter.saturation;
                g = gray + (g - gray) * filter.saturation;
                b = gray + (b - gray) * filter.saturation;
            }

            data[i] = Math.max(0, Math.min(255, Math.round(r)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

export function getWarmFilter(id: string): WarmFilter | undefined {
    return WARM_FILTERS.find(f => f.id === id);
}

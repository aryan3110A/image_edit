// NATURAL Filters
// Implements Canva-like natural color enhancement

/**
 * NATURAL Filter Definition
 */
export interface NaturalFilter {
    id: string;
    name: string;
    contrast: number;
    saturation: number;
    brightness: number;
    warmth: number;
    clarity: number;
}

// PURE filter definitions (formerly NATURAL) - IDs match imageFilters.ts presets
export const NATURAL_FILTERS: NaturalFilter[] = [
    {
        id: 'fresco',
        name: 'ClearTone',
        contrast: 1.1,
        saturation: 1.05,
        brightness: 0,
        warmth: 0,
        clarity: 10,
    },
    {
        id: 'belvedere',
        name: 'DeepView',
        contrast: 1.08,
        saturation: 1.0,
        brightness: 5,
        warmth: 5,
        clarity: 5,
    },
    {
        id: 'flint',
        name: 'CoolStone',
        contrast: 1.05,
        saturation: 0.95,
        brightness: 0,
        warmth: 0,
        clarity: 15,
    },
    {
        id: 'luna',
        name: 'Moonlight',
        contrast: 1.05,
        saturation: 1.0,
        brightness: 5,
        warmth: 0,
        clarity: 3,
    },
    {
        id: 'aero',
        name: 'AirLift',
        contrast: 1.1,
        saturation: 1.05,
        brightness: 0,
        warmth: 0,
        clarity: 20,
    },
    {
        id: 'myst',
        name: 'SoftHaze',
        contrast: 0.95,
        saturation: 0.9,
        brightness: 10,
        warmth: 0,
        clarity: 0,
    },
];

/**
 * Apply NATURAL filter
 */
export async function applyNaturalFilter(
    imgElement: HTMLImageElement,
    filter: NaturalFilter
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

            // Brightness
            const brightFactor = 1 + filter.brightness / 100;
            r = r * brightFactor;
            g = g * brightFactor;
            b = b * brightFactor;

            // Warmth
            if (filter.warmth !== 0) {
                const warmFactor = filter.warmth / 100;
                r = r * (1 + warmFactor * 0.1);
                b = b * (1 - warmFactor * 0.1);
            }

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

            // Clarity
            if (filter.clarity > 0) {
                const clarityFactor = 1 + filter.clarity / 100;
                r = mid + (r - mid) * clarityFactor;
                g = mid + (g - mid) * clarityFactor;
                b = mid + (b - mid) * clarityFactor;
            }

            data[i] = Math.max(0, Math.min(255, Math.round(r)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

export function getNaturalFilter(id: string): NaturalFilter | undefined {
    return NATURAL_FILTERS.find(f => f.id === id);
}

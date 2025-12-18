// VIVID Filters
// Implements Canva-like vivid color enhancement

/**
 * VIVID Filter Definition
 */
export interface VividFilter {
    id: string;
    name: string;
    vibrance: number;
    saturation: number;
    contrast: number;
    brightness: number;
    clarity: number;
}

// BOLD filter definitions (formerly VIVID) - IDs match imageFilters.ts presets
export const VIVID_FILTERS: VividFilter[] = [
    {
        id: 'chroma',
        name: 'ColorBoost',
        vibrance: 30,
        saturation: 1.4,
        contrast: 1.15,
        brightness: 0,
        clarity: 10,
    },
    {
        id: 'rustiq',
        name: 'EarthPop',
        vibrance: 20,
        saturation: 1.3,
        contrast: 1.2,
        brightness: 0,
        clarity: 5,
    },
    {
        id: 'eldar',
        name: 'BrightRise',
        vibrance: 25,
        saturation: 1.35,
        contrast: 1.1,
        brightness: 0,
        clarity: 20,
    },
    {
        id: 'zeal',
        name: 'HighImpact',
        vibrance: 35,
        saturation: 1.45,
        contrast: 1.2,
        brightness: 5,
        clarity: 10,
    },
    {
        id: 'aria',
        name: 'ClearVivid',
        vibrance: 40,
        saturation: 1.25,
        contrast: 1.05,
        brightness: 5,
        clarity: 5,
    },
    {
        id: 'stark',
        name: 'HardContrast',
        vibrance: 20,
        saturation: 1.2,
        contrast: 1.3,
        brightness: 0,
        clarity: 25,
    },
];

/**
 * Apply VIVID filter with vibrance (selective saturation)
 */
export async function applyVividFilter(
    imgElement: HTMLImageElement,
    filter: VividFilter
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

            // Contrast
            const mid = 128;
            r = mid + (r - mid) * filter.contrast;
            g = mid + (g - mid) * filter.contrast;
            b = mid + (b - mid) * filter.contrast;

            // Vibrance (selective saturation - boosts less saturated colors more)
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const currentSat = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;

            const vibranceFactor = filter.vibrance / 100;
            const vibranceBoost = 1 + vibranceFactor * (1 - currentSat);

            r = gray + (r - gray) * vibranceBoost;
            g = gray + (g - gray) * vibranceBoost;
            b = gray + (b - gray) * vibranceBoost;

            // Saturation
            if (filter.saturation !== 1) {
                const gray2 = 0.299 * r + 0.587 * g + 0.114 * b;
                r = gray2 + (r - gray2) * filter.saturation;
                g = gray2 + (g - gray2) * filter.saturation;
                b = gray2 + (b - gray2) * filter.saturation;
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

export function getVividFilter(id: string): VividFilter | undefined {
    return VIVID_FILTERS.find(f => f.id === id);
}

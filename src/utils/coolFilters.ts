// COOL Filters
// Implements Canva-like cool color grading

/**
 * COOL Filter Definition
 */
export interface CoolFilter {
    id: string;
    name: string;
    temperature: number;
    tint: number;
    contrast: number;
    saturation: number;
    brightness: number;
}

// ICE filter definitions (formerly COOL) - IDs match imageFilters.ts presets
export const COOL_FILTERS: CoolFilter[] = [
    {
        id: 'scandi',
        name: 'NordLight',
        temperature: -15,
        tint: 0,
        contrast: 1.05,
        saturation: 1.0,
        brightness: 0,
    },
    {
        id: 'nordic',
        name: 'Frosted Air',
        temperature: -20,
        tint: 0,
        contrast: 1.0,
        saturation: 0.95,
        brightness: 0,
    },
    {
        id: 'astro',
        name: 'CosmicBlue',
        temperature: -25,
        tint: 0,
        contrast: 1.15,
        saturation: 1.1,
        brightness: 0,
    },
    {
        id: 'arctic',
        name: 'IceWhite',
        temperature: -30,
        tint: 0,
        contrast: 1.0,
        saturation: 0.9,
        brightness: 10,
    },
    {
        id: 'polar',
        name: 'ColdEdge',
        temperature: -20,
        tint: 0,
        contrast: 1.05,
        saturation: 1.0,
        brightness: 8,
    },
    {
        id: 'tundra',
        name: 'GrayFrost',
        temperature: -25,
        tint: 0,
        contrast: 1.0,
        saturation: 0.85,
        brightness: 0,
    },
];

/**
 * Apply COOL filter
 */
export async function applyCoolFilter(
    imgElement: HTMLImageElement,
    filter: CoolFilter
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

            // Temperature (cool shift - negative means blue boost)
            const tempFactor = Math.abs(filter.temperature) / 100;
            r = Math.max(0, r * (1 - tempFactor * 0.12));
            b = Math.min(255, b * (1 + tempFactor * 0.15));

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

export function getCoolFilter(id: string): CoolFilter | undefined {
    return COOL_FILTERS.find(f => f.id === id);
}

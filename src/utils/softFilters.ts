// Advanced SOFT Filters
// Implements Canva-like soft color grading with clarity preservation

import { rgbToHsl, hslToRgb } from './colorReplace';

/**
 * SOFT Filter Definition
 */
export interface SoftFilter {
    id: string;
    name: string;
    contrast: number;
    highlightSoftness: number;
    shadowLift: number;
    colorTint: { r: number; g: number; b: number };
    tintStrength: number;
    saturation: number;
    brightness: number;
    warmth: number;
}

// DREAM filter definitions (formerly SOFT) - tuned to match Canva
export const SOFT_FILTERS: SoftFilter[] = [
    {
        id: 'aura',
        name: 'GlowMist',
        contrast: 0.85,
        highlightSoftness: 15,
        shadowLift: 8,
        colorTint: { r: 255, g: 252, b: 245 },
        tintStrength: 0.08,
        saturation: 0.9,
        brightness: 8,
        warmth: 5,
    },
    {
        id: 'hazel',
        name: 'WarmFog',
        contrast: 0.8,
        highlightSoftness: 12,
        shadowLift: 10,
        colorTint: { r: 200, g: 170, b: 130 },
        tintStrength: 0.15,
        saturation: 0.85,
        brightness: 5,
        warmth: 20,
    },
    {
        id: 'whimsi',
        name: 'PlaySoft',
        contrast: 0.82,
        highlightSoftness: 18,
        shadowLift: 12,
        colorTint: { r: 255, g: 240, b: 200 },
        tintStrength: 0.12,
        saturation: 0.75,
        brightness: 10,
        warmth: 15,
    },
    {
        id: 'rose',
        name: 'BlushTone',
        contrast: 0.85,
        highlightSoftness: 15,
        shadowLift: 8,
        colorTint: { r: 255, g: 200, b: 210 },
        tintStrength: 0.18,
        saturation: 0.88,
        brightness: 5,
        warmth: 10,
    },
    {
        id: 'oceanic',
        name: 'SeaBreeze',
        contrast: 0.82,
        highlightSoftness: 15,
        shadowLift: 10,
        colorTint: { r: 180, g: 220, b: 230 },
        tintStrength: 0.15,
        saturation: 0.85,
        brightness: 5,
        warmth: -15,
    },
    {
        id: 'nimbus',
        name: 'CloudFade',
        contrast: 0.75,
        highlightSoftness: 20,
        shadowLift: 15,
        colorTint: { r: 230, g: 235, b: 240 },
        tintStrength: 0.12,
        saturation: 0.7,
        brightness: 8,
        warmth: -5,
    },
];

/**
 * Apply SOFT filter with gentle contrast reduction and color tinting
 */
export async function applySoftFilter(
    imgElement: HTMLImageElement,
    filter: SoftFilter
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
            if (filter.brightness !== 0) {
                const brightnessFactor = filter.brightness / 100;
                r = Math.min(255, r + r * brightnessFactor);
                g = Math.min(255, g + g * brightnessFactor);
                b = Math.min(255, b + b * brightnessFactor);
            }

            // Warmth
            if (filter.warmth !== 0) {
                const warmFactor = filter.warmth / 100;
                r = Math.min(255, r * (1 + warmFactor * 0.12));
                b = Math.max(0, b * (1 - warmFactor * 0.12));
            }

            // Highlight roll-off
            if (filter.highlightSoftness > 0) {
                const threshold = 200;
                const softness = filter.highlightSoftness / 100;
                if (r > threshold) r = threshold + (r - threshold) * (1 - softness);
                if (g > threshold) g = threshold + (g - threshold) * (1 - softness);
                if (b > threshold) b = threshold + (b - threshold) * (1 - softness);
            }

            // Shadow lift
            if (filter.shadowLift > 0) {
                const lift = filter.shadowLift / 100;
                const liftAmount = lift * 30;
                r = Math.min(255, r + liftAmount * (1 - r / 255));
                g = Math.min(255, g + liftAmount * (1 - g / 255));
                b = Math.min(255, b + liftAmount * (1 - b / 255));
            }

            // Contrast
            if (filter.contrast !== 1) {
                const mid = 128;
                r = mid + (r - mid) * filter.contrast;
                g = mid + (g - mid) * filter.contrast;
                b = mid + (b - mid) * filter.contrast;
            }

            // Saturation
            if (filter.saturation !== 1) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = gray + (r - gray) * filter.saturation;
                g = gray + (g - gray) * filter.saturation;
                b = gray + (b - gray) * filter.saturation;
            }

            // Color tint
            if (filter.tintStrength > 0) {
                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const midtoneFactor = 1 - Math.abs(lum - 0.5) * 2;
                const tintAmount = filter.tintStrength * midtoneFactor;

                r = r + (filter.colorTint.r - r) * tintAmount;
                g = g + (filter.colorTint.g - g) * tintAmount;
                b = b + (filter.colorTint.b - b) * tintAmount;
            }

            data[i] = Math.max(0, Math.min(255, Math.round(r)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

/**
 * Get SOFT filter by ID
 */
export function getSoftFilter(id: string): SoftFilter | undefined {
    return SOFT_FILTERS.find(f => f.id === id);
}

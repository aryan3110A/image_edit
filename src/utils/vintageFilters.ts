// Advanced VINTAGE Filters with Tone Curves
// Implements Canva-like vintage color grading with proper tone curve processing

import { rgbToHsl, hslToRgb } from './colorReplace';

/**
 * VINTAGE Filter Definition with tone curve parameters
 */
export interface VintageFilter {
    id: string;
    name: string;
    // Tone curve control points
    shadowLift: number;      // 0-50, lifts black point
    highlightCompress: number; // 0-30, compresses white point
    // Color grading
    shadowTint: { r: number; g: number; b: number }; // Color added to shadows
    highlightTint: { r: number; g: number; b: number }; // Color added to highlights
    // Processing
    contrast: number;        // 0.5-1.5
    saturation: number;      // 0.3-1.2
    warmth: number;          // -30 to +50
    // Film effects
    filmGrain: number;       // 0-20
    fadeStrength: number;    // 0-40
}

// FILM filter definitions (formerly VINTAGE) - tuned to match Canva exactly
export const VINTAGE_FILTERS: VintageFilter[] = [
    {
        id: 'vinto',
        name: 'OldFrame',
        shadowLift: 8,
        highlightCompress: 5,
        shadowTint: { r: 10, g: 5, b: 0 },
        highlightTint: { r: 15, g: 10, b: 0 },
        contrast: 1.0,
        saturation: 0.85,
        warmth: 15,
        filmGrain: 0,
        fadeStrength: 5,
    },
    {
        id: 'fade',
        name: 'MatteLift',
        // FADE: Strong matte look, warm brown tones, very lifted blacks
        shadowLift: 30,
        highlightCompress: 12,
        shadowTint: { r: 25, g: 15, b: 5 },  // Warm brown shadows
        highlightTint: { r: 20, g: 12, b: 0 }, // Warm highlights
        contrast: 0.65,
        saturation: 0.45,
        warmth: 20,  // More warmth
        filmGrain: 0,
        fadeStrength: 35,
    },
    {
        id: 'antiq',
        name: 'SepiaDust',
        shadowLift: 12,
        highlightCompress: 8,
        shadowTint: { r: 25, g: 15, b: 0 },
        highlightTint: { r: 35, g: 25, b: 5 },
        contrast: 0.9,
        saturation: 0.55,
        warmth: 30,
        filmGrain: 0,
        fadeStrength: 10,
    },
    {
        id: 'nostalg',
        name: 'MemoryWarm',
        shadowLift: 15,
        highlightCompress: 10,
        shadowTint: { r: 20, g: 10, b: 0 },
        highlightTint: { r: 25, g: 15, b: 0 },
        contrast: 0.85,
        saturation: 0.7,
        warmth: 25,
        filmGrain: 0,
        fadeStrength: 15,
    },
    {
        id: 'dream',
        name: 'SoftFilm',
        // DREAM: Cool pastel, greenish tint, soft and ethereal
        shadowLift: 18,
        highlightCompress: 25,
        shadowTint: { r: 0, g: 12, b: 10 },  // Cool greenish shadows
        highlightTint: { r: 10, g: 18, b: 15 }, // Cool greenish highlights
        contrast: 0.55,
        saturation: 0.5,
        warmth: -10,  // Cool (negative warmth)
        filmGrain: 0,
        fadeStrength: 20,
    },
    {
        id: 'retro',
        name: 'AnalogPop',
        shadowLift: 10,
        highlightCompress: 5,
        shadowTint: { r: 15, g: 8, b: 0 },
        highlightTint: { r: 20, g: 12, b: 0 },
        contrast: 1.1,
        saturation: 0.9,
        warmth: 25,
        filmGrain: 0,
        fadeStrength: 5,
    },
];

/**
 * Apply film-style tone curve
 * Creates the characteristic S-curve with lifted blacks and compressed highlights
 */
function applyToneCurve(value: number, shadowLift: number, highlightCompress: number): number {
    // Normalize to 0-1
    let v = value / 255;

    // Lift shadows (add to blacks)
    const blackPoint = shadowLift / 100;

    // Compress highlights (reduce white point)
    const whitePoint = 1 - (highlightCompress / 100);

    // Remap value to new range
    v = blackPoint + v * (whitePoint - blackPoint);

    // Apply subtle S-curve for film-like contrast
    // Using smooth sigmoid-like curve
    if (v < 0.5) {
        // Shadows: slight compression
        v = 0.5 * Math.pow(2 * v, 1.1);
    } else {
        // Highlights: slight roll-off
        v = 1 - 0.5 * Math.pow(2 * (1 - v), 1.1);
    }

    return Math.max(0, Math.min(255, v * 255));
}

/**
 * Apply split toning (different colors in shadows vs highlights)
 */
function applySplitToning(
    r: number, g: number, b: number,
    shadowTint: { r: number; g: number; b: number },
    highlightTint: { r: number; g: number; b: number }
): { r: number; g: number; b: number } {
    // Calculate luminance
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Shadows get shadow tint, highlights get highlight tint
    const shadowWeight = Math.pow(1 - lum, 2); // Stronger in dark areas
    const highlightWeight = Math.pow(lum, 2);   // Stronger in bright areas

    return {
        r: r + shadowTint.r * shadowWeight + highlightTint.r * highlightWeight,
        g: g + shadowTint.g * shadowWeight + highlightTint.g * highlightWeight,
        b: b + shadowTint.b * shadowWeight + highlightTint.b * highlightWeight,
    };
}

/**
 * Apply VINTAGE filter with tone curves and split toning
 */
export async function applyVintageFilter(
    imgElement: HTMLImageElement,
    filter: VintageFilter
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

        // Draw original image
        ctx.drawImage(imgElement, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            const a = data[i + 3];

            // Skip transparent pixels
            if (a < 10) continue;

            // Step 1: Apply tone curve (lifts blacks, compresses highlights)
            r = applyToneCurve(r, filter.shadowLift, filter.highlightCompress);
            g = applyToneCurve(g, filter.shadowLift, filter.highlightCompress);
            b = applyToneCurve(b, filter.shadowLift, filter.highlightCompress);

            // Step 2: Apply warmth (temperature shift)
            if (filter.warmth !== 0) {
                const warmFactor = filter.warmth / 100;
                r = Math.min(255, r * (1 + warmFactor * 0.15));
                b = Math.max(0, b * (1 - warmFactor * 0.15));
            }

            // Step 3: Apply split toning
            const toned = applySplitToning(r, g, b, filter.shadowTint, filter.highlightTint);
            r = toned.r;
            g = toned.g;
            b = toned.b;

            // Step 4: Apply saturation adjustment
            if (filter.saturation !== 1) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = gray + (r - gray) * filter.saturation;
                g = gray + (g - gray) * filter.saturation;
                b = gray + (b - gray) * filter.saturation;
            }

            // Step 5: Apply contrast
            if (filter.contrast !== 1) {
                const mid = 128;
                r = mid + (r - mid) * filter.contrast;
                g = mid + (g - mid) * filter.contrast;
                b = mid + (b - mid) * filter.contrast;
            }

            // Step 6: Apply fade overlay (soft cream haze)
            if (filter.fadeStrength > 0) {
                const fadeAmount = filter.fadeStrength / 100;
                // Cream/ivory fade color
                const fadeR = 250;
                const fadeG = 245;
                const fadeB = 235;
                r = r + (fadeR - r) * fadeAmount * 0.4;
                g = g + (fadeG - g) * fadeAmount * 0.4;
                b = b + (fadeB - b) * fadeAmount * 0.4;
            }

            // Clamp and store
            data[i] = Math.max(0, Math.min(255, Math.round(r)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

/**
 * Get VINTAGE filter by ID
 */
export function getVintageFilter(id: string): VintageFilter | undefined {
    return VINTAGE_FILTERS.find(f => f.id === id);
}

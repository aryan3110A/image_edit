// Advanced MONO (Black & White) Filters
// Implements Canva-like grayscale conversion with full clarity preservation

import { rgbToHsl, hslToRgb } from './colorReplace';

/**
 * MONO Filter Definition
 */
export interface MonoFilter {
    id: string;
    name: string;
    // Contrast multiplier (1.0 = normal)
    contrast: number;
    // Brightness offset (-50 to +50)
    brightness: number;
    // Black point lift (0 = true black, higher = lifted/faded blacks)
    blackPoint: number;
    // White point (100 = true white, lower = muted whites)
    whitePoint: number;
    // Midtone gamma (1.0 = normal, <1 = brighter mids, >1 = darker mids)
    gamma: number;
    // Vignette strength (0 = none)
    vignette?: number;
}

// Black & White filter definitions (formerly MONO) - tuned to match Canva
export const MONO_FILTERS: MonoFilter[] = [
    {
        id: 'classic',
        name: 'TrueMono',
        contrast: 1.05,
        brightness: 0,
        blackPoint: 0,
        whitePoint: 100,
        gamma: 1.0,
    },
    {
        id: 'ink',
        name: 'DeepBlack',
        contrast: 1.4,
        brightness: 0,
        blackPoint: 0,
        whitePoint: 100,
        gamma: 0.9,
    },
    {
        id: 'noir',
        name: 'ShadowDrama',
        contrast: 1.5,
        brightness: -5,
        blackPoint: 0,
        whitePoint: 95,
        gamma: 1.1,
        vignette: 20,
    },
    {
        id: 'film',
        name: 'GrainMono',
        contrast: 0.9,
        brightness: 5,
        blackPoint: 10,
        whitePoint: 95,
        gamma: 0.95,
    },
    {
        id: 'newspaper',
        name: 'PrintGray',
        contrast: 0.8,
        brightness: 10,
        blackPoint: 15,
        whitePoint: 90,
        gamma: 1.0,
    },
    {
        id: 'slate',
        name: 'UrbanGray',
        contrast: 0.95,
        brightness: 0,
        blackPoint: 5,
        whitePoint: 95,
        gamma: 1.0,
    },
];

/**
 * Apply MONO filter with proper luminance-weighted grayscale
 * Preserves depth, texture, and background visibility
 */
export async function applyMonoFilter(
    imgElement: HTMLImageElement,
    filter: MonoFilter
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

        // Calculate center for vignette
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        // Process each pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;

                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Skip transparent pixels
                if (a < 10) continue;

                // Luminance-weighted grayscale (matches human perception)
                // Standard weights: R=0.2126, G=0.7152, B=0.0722
                let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                // Normalize to 0-1 range
                let gray = luminance / 255;

                // Apply gamma correction
                gray = Math.pow(gray, filter.gamma);

                // Apply contrast around midpoint
                gray = 0.5 + (gray - 0.5) * filter.contrast;

                // Apply brightness
                gray = gray + filter.brightness / 100;

                // Apply black and white point
                const blackLevel = filter.blackPoint / 100;
                const whiteLevel = filter.whitePoint / 100;
                gray = blackLevel + gray * (whiteLevel - blackLevel);

                // Clamp to valid range
                gray = Math.max(0, Math.min(1, gray));

                // Apply vignette if specified
                if (filter.vignette && filter.vignette > 0) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const normalizedDistance = distance / maxDistance;

                    // Smooth vignette falloff
                    const vignetteFactor = 1 - Math.pow(normalizedDistance, 2) * (filter.vignette / 100);
                    gray = gray * Math.max(0.3, vignetteFactor);
                }

                // Convert back to 0-255 range
                const grayValue = Math.round(gray * 255);

                data[i] = grayValue;
                data[i + 1] = grayValue;
                data[i + 2] = grayValue;
                // Alpha unchanged
            }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

/**
 * Get MONO filter by ID
 */
export function getMonoFilter(id: string): MonoFilter | undefined {
    return MONO_FILTERS.find(f => f.id === id);
}

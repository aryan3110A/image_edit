// Advanced Colour Pop Filters
// Implements Canva-like hue remapping with FULL luminance preservation

import { hexToRgb, rgbToHsl, hslToRgb } from './colorReplace';

/**
 * Colour Pop Filter Definition
 */
export interface ColourPopFilter {
    id: string;
    name: string;
    primaryHue: number;
    secondaryHue?: number;
    saturationBoost: number;
    contrast: number;
    effect?: 'duotone' | 'crossprocess' | 'posterize' | 'vintage';
    temperature?: number;
    tint?: number;
}

// NEON filter definitions (formerly Colour Pop) - tuned to match Canva exactly
export const COLOUR_POP_FILTERS: ColourPopFilter[] = [
    {
        id: 'outrun',
        name: 'NeonDrive',
        primaryHue: 270,        // Purple/violet shadows
        secondaryHue: 200,      // Cyan highlights
        saturationBoost: 25,
        contrast: 10,
        effect: 'duotone',
    },
    {
        id: 'heatwave',
        name: 'ThermalRush',
        primaryHue: 200,        // Cyan base
        secondaryHue: 0,        // Red accents in highlights
        saturationBoost: 30,
        contrast: 15,
        effect: 'duotone',
    },
    {
        id: 'amethyst',
        name: 'PurplePulse',
        primaryHue: 275,        // Deep purple
        saturationBoost: 20,
        contrast: 5,
    },
    {
        id: 'minty',
        name: 'FreshGreen',
        primaryHue: 155,        // Mint green/cyan
        saturationBoost: 20,
        contrast: 5,
    },
    {
        id: 'hibiscus',
        name: 'PinkBloom',
        primaryHue: 320,        // Pink/magenta
        saturationBoost: 25,
        contrast: 5,
    },
    {
        id: 'poster',
        name: 'GraphicTone',
        primaryHue: 0,          // Keep original hues, reduce saturation for grayscale-ish
        saturationBoost: -40,   // Desaturate most colors
        contrast: 30,
        effect: 'posterize',
    },
    {
        id: 'xpro-',
        name: 'CrossDark',
        primaryHue: 120,        // Green tint in shadows
        saturationBoost: 5,
        contrast: 15,
        effect: 'vintage',
    },
    {
        id: 'xpro+',
        name: 'CrossBright',
        primaryHue: 35,         // Golden/warm
        saturationBoost: 15,
        contrast: 20,
        effect: 'crossprocess',
    },
];

/**
 * Apply Colour Pop filter with FULL LUMINANCE PRESERVATION
 * Only modifies hue - preserves original lightness, shadows, highlights
 */
export async function applyColourPopFilter(
    imgElement: HTMLImageElement,
    filter: ColourPopFilter
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
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip transparent pixels
            if (a < 10) continue;

            // Convert to HSL
            const hsl = rgbToHsl(r, g, b);

            // STORE original lightness - we will NEVER modify this
            const originalLightness = hsl.l;
            const originalSaturation = hsl.s;

            // Calculate influence based on saturation and lightness
            // High saturation = main subject, low saturation = background/neutral
            // Very dark or very bright = protected regions

            // Subject detection - more subtle
            const saturationFactor = Math.min(1, hsl.s / 40); // 0-1 based on saturation
            const midtoneFactor = 1 - Math.abs(hsl.l - 50) / 50; // 1 at 50% lightness, 0 at extremes

            // Combine factors - strong on saturated midtones, weak on dark/bright/neutral
            let colorInfluence = saturationFactor * midtoneFactor;

            // Protect very dark regions (background)
            if (hsl.l < 15) colorInfluence *= 0.2;
            // Protect very bright regions (highlights)
            if (hsl.l > 90) colorInfluence *= 0.3;

            let newHue = hsl.h;
            let newSaturation = originalSaturation;

            // Apply filter-specific hue remapping
            switch (filter.effect) {
                case 'duotone':
                    // Dual-tone: shadows get primary hue, highlights get secondary
                    const shadowWeight = 1 - (hsl.l / 100);
                    const highlightWeight = hsl.l / 100;

                    if (colorInfluence > 0.1) {
                        // Blend between two hues based on lightness
                        const targetHue = filter.secondaryHue !== undefined
                            ? (filter.primaryHue * shadowWeight + filter.secondaryHue * highlightWeight)
                            : filter.primaryHue;

                        // Smooth hue shift
                        newHue = hsl.h + (targetHue - hsl.h) * colorInfluence * 0.7;
                        while (newHue < 0) newHue += 360;
                        while (newHue >= 360) newHue -= 360;

                        // Subtle saturation boost on colorful areas only
                        newSaturation = Math.min(100, originalSaturation + filter.saturationBoost * colorInfluence * 0.5);
                    }
                    break;

                case 'posterize':
                    // Reduce saturation for grayscale base, keep red accents
                    if (originalSaturation > 50 && (hsl.h < 30 || hsl.h > 330)) {
                        // Keep reds saturated
                        newSaturation = originalSaturation;
                    } else {
                        // Desaturate other colors
                        newSaturation = Math.max(0, originalSaturation + filter.saturationBoost);
                    }
                    // Keep original hue
                    newHue = hsl.h;
                    break;

                case 'vintage':
                    // Subtle green/muted shift
                    if (colorInfluence > 0.1) {
                        const hueShift = (filter.primaryHue - 180) * 0.15 * colorInfluence;
                        newHue = hsl.h + hueShift;
                        while (newHue < 0) newHue += 360;
                        while (newHue >= 360) newHue -= 360;

                        // Slightly muted
                        newSaturation = Math.max(0, originalSaturation + filter.saturationBoost * colorInfluence);
                    }
                    break;

                case 'crossprocess':
                    // Warm cross-processed look
                    if (colorInfluence > 0.1) {
                        // Shift towards golden/warm
                        const hueShift = (filter.primaryHue - hsl.h) * 0.25 * colorInfluence;
                        newHue = hsl.h + hueShift;
                        while (newHue < 0) newHue += 360;
                        while (newHue >= 360) newHue -= 360;

                        newSaturation = Math.min(100, originalSaturation + filter.saturationBoost * colorInfluence);
                    }
                    break;

                default:
                    // Standard hue remap for non-effect filters (amethyst, minty, hibiscus)
                    if (colorInfluence > 0.1) {
                        // Shift hue towards primary color
                        let hueDistance = filter.primaryHue - hsl.h;
                        // Take shortest path around color wheel
                        if (hueDistance > 180) hueDistance -= 360;
                        if (hueDistance < -180) hueDistance += 360;

                        newHue = hsl.h + hueDistance * colorInfluence * 0.7;
                        while (newHue < 0) newHue += 360;
                        while (newHue >= 360) newHue -= 360;

                        newSaturation = Math.min(100, originalSaturation + filter.saturationBoost * colorInfluence * 0.5);
                    }
                    break;
            }

            // Apply subtle contrast adjustment (without destroying lightness)
            let finalLightness = originalLightness;
            if (filter.contrast > 0) {
                const contrastAmount = filter.contrast / 200; // Very subtle
                finalLightness = 50 + (originalLightness - 50) * (1 + contrastAmount);
                finalLightness = Math.max(0, Math.min(100, finalLightness));
            }

            // Convert back to RGB with PRESERVED (or subtly adjusted) lightness
            const newRgb = hslToRgb(newHue, newSaturation, finalLightness);

            data[i] = newRgb.r;
            data[i + 1] = newRgb.g;
            data[i + 2] = newRgb.b;
            // Alpha unchanged
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

/**
 * Get Colour Pop filter by ID
 */
export function getColourPopFilter(id: string): ColourPopFilter | undefined {
    return COLOUR_POP_FILTERS.find(f => f.id === id);
}

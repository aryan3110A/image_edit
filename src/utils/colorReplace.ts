// Color Replacement Utility
// Implements Canva-like color replacement for images

import { ColorReplaceEffect } from '@/types/canvas';

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

/**
 * Apply color replacement to an image using canvas
 * This creates a new image with the color replaced
 * Uses saturation-based masking to focus on main objects like Canva does
 */
export async function applyColorReplacement(
    imgElement: HTMLImageElement,
    effect: ColorReplaceEffect
): Promise<string> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            resolve(imgElement.src);
            return;
        }

        canvas.width = imgElement.naturalWidth || imgElement.width;
        canvas.height = imgElement.naturalHeight || imgElement.height;

        // Draw the original image
        ctx.drawImage(imgElement, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Get target color in HSL
        const targetRgb = hexToRgb(effect.targetColor);
        if (!targetRgb) {
            resolve(imgElement.src);
            return;
        }

        const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
        const intensity = effect.intensity / 100;

        // First pass: Analyze the image to find the dominant saturated color
        // This helps us identify what is the "main object" vs background
        const saturationThreshold = 20; // Minimum saturation to consider as "colorful object"
        const lightnessMin = 20; // Too dark = shadow/background
        const lightnessMax = 90; // Too light = highlight/background

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip fully transparent pixels
            if (a < 10) continue;

            // Convert to HSL
            const pixelHsl = rgbToHsl(r, g, b);

            // Decision logic: Should we color this pixel?
            // Key insight from Canva: Only color HIGH SATURATION pixels (the main object)
            // Skip LOW SATURATION pixels (background, shadows, highlights)

            let shouldColor = false;
            let colorStrength = 0;

            // Check if this is a colorful pixel (main object)
            if (pixelHsl.s > saturationThreshold &&
                pixelHsl.l > lightnessMin &&
                pixelHsl.l < lightnessMax) {

                // This is likely the main object (e.g., golden chicken)
                shouldColor = true;

                // Color strength based on saturation
                // Higher saturation = stronger color application
                colorStrength = Math.min(1, pixelHsl.s / 60); // Normalize to 0-1

            } else if (pixelHsl.s > 10 && pixelHsl.l > 30 && pixelHsl.l < 80) {
                // Medium saturation - apply color but less intensely
                shouldColor = true;
                colorStrength = Math.min(0.5, pixelHsl.s / 80);

            } else {
                // Low saturation or extreme lightness/darkness
                // This is background, shadows, or highlights - don't color
                continue;
            }

            if (!shouldColor) continue;

            // Apply hue shift based on blend mode
            let newHsl = { ...pixelHsl };

            switch (effect.blendMode) {
                case 'hue':
                    // Replace hue completely while preserving saturation and lightness
                    newHsl.h = targetHsl.h;

                    // Boost saturation slightly to make the color more vibrant
                    newHsl.s = Math.min(100, pixelHsl.s + (targetHsl.s - pixelHsl.s) * 0.4);

                    // Preserve lightness exactly to maintain texture
                    newHsl.l = pixelHsl.l;
                    break;

                case 'multiply':
                    // Multiply mode - darker, richer colors
                    newHsl.h = targetHsl.h;
                    newHsl.s = Math.min(100, pixelHsl.s * 1.2);
                    newHsl.l = pixelHsl.l * 0.9; // Slightly darker
                    break;

                case 'screen':
                    // Screen mode - lighter, more pastel colors
                    newHsl.h = targetHsl.h;
                    newHsl.s = pixelHsl.s * 0.8;
                    newHsl.l = pixelHsl.l + (100 - pixelHsl.l) * 0.2;
                    break;

                case 'overlay':
                    // Overlay mode - enhanced contrast
                    newHsl.h = targetHsl.h;
                    if (pixelHsl.l < 50) {
                        newHsl.l = pixelHsl.l * 0.95;
                    } else {
                        newHsl.l = pixelHsl.l + (100 - pixelHsl.l) * 0.1;
                    }
                    break;
            }

            // Blend with original based on intensity and color strength
            const finalIntensity = intensity * colorStrength;

            const finalHsl = {
                h: pixelHsl.h + (newHsl.h - pixelHsl.h) * finalIntensity,
                s: Math.max(0, Math.min(100, pixelHsl.s + (newHsl.s - pixelHsl.s) * finalIntensity)),
                l: Math.max(0, Math.min(100, newHsl.l)),
            };

            // Convert back to RGB
            const newRgb = hslToRgb(finalHsl.h, finalHsl.s, finalHsl.l);

            data[i] = newRgb.r;
            data[i + 1] = newRgb.g;
            data[i + 2] = newRgb.b;
            // Keep original alpha
        }

        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);

        // Return as data URL
        resolve(canvas.toDataURL('image/png'));
    });
}

/**
 * Get predefined color palette for quick selection
 */
export const COLOR_PALETTE = [
    { name: 'Purple', color: '#9333EA' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Green', color: '#10B981' },
    { name: 'Yellow', color: '#F59E0B' },
    { name: 'Red', color: '#EF4444' },
    { name: 'Pink', color: '#EC4899' },
    { name: 'Teal', color: '#14B8A6' },
    { name: 'Orange', color: '#F97316' },
];

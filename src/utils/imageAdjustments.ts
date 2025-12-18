// Advanced Image Adjustments Engine
// Implements Canva-like adjustment sliders with proper stacking order
// Uses HSL color space for precise control

import { rgbToHsl, hslToRgb } from './colorReplace';
import { ImageFilter } from '@/types/canvas';

/**
 * Apply all image adjustments in Canva's exact processing order
 * Order: Temperature → Tint → Brightness → Contrast → Highlights → Shadows →
 *        Whites → Blacks → Vibrance → Saturation → Clarity → Sharpness → Vignette
 */
export async function applyImageAdjustments(
    imgElement: HTMLImageElement,
    adjustments: ImageFilter
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

        // Pre-calculate center for vignette
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        // Process each pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;

                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                const a = data[i + 3];

                if (a < 10) continue;

                // Calculate luminance for various adjustments
                const getLuminance = (r: number, g: number, b: number) =>
                    (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                // 1. TEMPERATURE (blue ↔ yellow, stronger in highlights)
                if (adjustments.temperature && adjustments.temperature !== 0) {
                    const temp = adjustments.temperature / 100;
                    const lum = getLuminance(r, g, b);
                    // Stronger in highlights, weaker in shadows
                    const influence = 0.5 + lum * 0.5;

                    if (temp > 0) {
                        // Warm: boost red/yellow, reduce blue
                        r = Math.min(255, r + r * temp * 0.15 * influence);
                        b = Math.max(0, b - b * temp * 0.15 * influence);
                    } else {
                        // Cool: boost blue, reduce red
                        b = Math.min(255, b + b * Math.abs(temp) * 0.15 * influence);
                        r = Math.max(0, r - r * Math.abs(temp) * 0.1 * influence);
                    }
                }

                // 2. TINT (green ↔ magenta, affects midtones most)
                if (adjustments.tint && adjustments.tint !== 0) {
                    const tint = adjustments.tint / 100;
                    const lum = getLuminance(r, g, b);
                    // Strongest in midtones
                    const midtoneInfluence = 1 - Math.abs(lum - 0.5) * 2;

                    if (tint > 0) {
                        // Magenta: boost red and blue, reduce green
                        r = Math.min(255, r + r * tint * 0.08 * midtoneInfluence);
                        g = Math.max(0, g - g * tint * 0.08 * midtoneInfluence);
                        b = Math.min(255, b + b * tint * 0.05 * midtoneInfluence);
                    } else {
                        // Green: boost green, reduce red/blue
                        g = Math.min(255, g + g * Math.abs(tint) * 0.08 * midtoneInfluence);
                        r = Math.max(0, r - r * Math.abs(tint) * 0.05 * midtoneInfluence);
                    }
                }

                // 3. BRIGHTNESS (linear exposure, no clipping)
                if (adjustments.brightness && adjustments.brightness !== 0) {
                    const bright = 1 + adjustments.brightness / 100;
                    r = r * bright;
                    g = g * bright;
                    b = b * bright;
                }

                // 4. CONTRAST (expand/compress midtones, protect extremes)
                if (adjustments.contrast && adjustments.contrast !== 0) {
                    const contrast = 1 + adjustments.contrast / 100;
                    const mid = 128;
                    r = mid + (r - mid) * contrast;
                    g = mid + (g - mid) * contrast;
                    b = mid + (b - mid) * contrast;
                }

                // 5. HIGHLIGHTS (affects top luminance range)
                if (adjustments.highlights && adjustments.highlights !== 0) {
                    const lum = getLuminance(r, g, b);
                    if (lum > 0.5) {
                        const highlightInfluence = (lum - 0.5) * 2; // 0-1 for highlights
                        const adjust = adjustments.highlights / 100;
                        const factor = 1 + adjust * 0.3 * highlightInfluence;
                        r = r * factor;
                        g = g * factor;
                        b = b * factor;
                    }
                }

                // 6. SHADOWS (affects dark regions)
                if (adjustments.shadows && adjustments.shadows !== 0) {
                    const lum = getLuminance(r, g, b);
                    if (lum < 0.5) {
                        const shadowInfluence = (0.5 - lum) * 2; // 0-1 for shadows
                        const adjust = adjustments.shadows / 100;
                        const lift = adjust * 30 * shadowInfluence;
                        r = r + lift;
                        g = g + lift;
                        b = b + lift;
                    }
                }

                // 7. WHITES (adjust white point only)
                if (adjustments.whites && adjustments.whites !== 0) {
                    const lum = getLuminance(r, g, b);
                    if (lum > 0.8) {
                        const whiteInfluence = (lum - 0.8) / 0.2;
                        const adjust = adjustments.whites / 100;
                        const factor = 1 + adjust * 0.2 * whiteInfluence;
                        r = r * factor;
                        g = g * factor;
                        b = b * factor;
                    }
                }

                // 8. BLACKS (adjust black point)
                if (adjustments.blacks && adjustments.blacks !== 0) {
                    const lum = getLuminance(r, g, b);
                    if (lum < 0.2) {
                        const blackInfluence = (0.2 - lum) / 0.2;
                        const adjust = adjustments.blacks / 100;
                        if (adjust > 0) {
                            // Lift blacks
                            const lift = adjust * 25 * blackInfluence;
                            r = r + lift;
                            g = g + lift;
                            b = b + lift;
                        } else {
                            // Crush blacks
                            const factor = 1 + adjust * 0.3 * blackInfluence;
                            r = r * factor;
                            g = g * factor;
                            b = b * factor;
                        }
                    }
                }

                // 9. VIBRANCE (boost muted colors, protect saturated)
                if (adjustments.vibrance && adjustments.vibrance !== 0) {
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    const maxCh = Math.max(r, g, b);
                    const minCh = Math.min(r, g, b);
                    const currentSat = maxCh > 0 ? (maxCh - minCh) / maxCh : 0;

                    // Less saturated colors get more boost
                    const vibranceFactor = adjustments.vibrance / 100;
                    const boost = 1 + vibranceFactor * 0.5 * (1 - currentSat);

                    r = gray + (r - gray) * boost;
                    g = gray + (g - gray) * boost;
                    b = gray + (b - gray) * boost;
                }

                // 10. SATURATION (uniform intensity adjustment)
                if (adjustments.saturation && adjustments.saturation !== 0) {
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    const satFactor = 1 + adjustments.saturation / 100;
                    r = gray + (r - gray) * satFactor;
                    g = gray + (g - gray) * satFactor;
                    b = gray + (b - gray) * satFactor;
                }

                // 11. INVERT (if enabled)
                if (adjustments.invert) {
                    r = 255 - r;
                    g = 255 - g;
                    b = 255 - b;
                }

                // 12. CLARITY (midtone contrast enhancement)
                if (adjustments.clarity && adjustments.clarity !== 0) {
                    const lum = getLuminance(r, g, b);
                    const midtoneInfluence = 1 - Math.abs(lum - 0.5) * 2;
                    const clarityFactor = 1 + (adjustments.clarity / 100) * 0.5 * midtoneInfluence;
                    const mid = 128;
                    r = mid + (r - mid) * clarityFactor;
                    g = mid + (g - mid) * clarityFactor;
                    b = mid + (b - mid) * clarityFactor;
                }

                // 13. VIGNETTE (radial edge darkening/lightening)
                if (adjustments.vignette && adjustments.vignette !== 0) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const normalizedDist = distance / maxDistance;

                    const vignetteStrength = adjustments.vignette / 100;
                    // Smooth falloff using quadratic curve
                    if (vignetteStrength > 0) {
                        // Darken edges
                        const vignetteFactor = 1 - Math.pow(normalizedDist, 2) * vignetteStrength * 0.7;
                        r = r * Math.max(0.2, vignetteFactor);
                        g = g * Math.max(0.2, vignetteFactor);
                        b = b * Math.max(0.2, vignetteFactor);
                    } else {
                        // Lighten edges
                        const lightenFactor = Math.pow(normalizedDist, 2) * Math.abs(vignetteStrength) * 0.5;
                        r = Math.min(255, r + (255 - r) * lightenFactor);
                        g = Math.min(255, g + (255 - g) * lightenFactor);
                        b = Math.min(255, b + (255 - b) * lightenFactor);
                    }
                }

                // Clamp and store
                data[i] = Math.max(0, Math.min(255, Math.round(r)));
                data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
                data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // 14. SHARPNESS (apply after main processing using unsharp mask)
        if (adjustments.sharpness && adjustments.sharpness > 0) {
            const sharpAmount = adjustments.sharpness / 100;

            // Read the current image data
            const sharpData = ctx.getImageData(0, 0, width, height);
            const sharpPixels = sharpData.data;
            const origPixels = new Uint8ClampedArray(sharpPixels);

            // Simple unsharp mask: sharpen = original + (original - blur) * amount
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const i = (y * width + x) * 4;

                    for (let c = 0; c < 3; c++) {
                        // Get surrounding pixels for blur approximation
                        const top = origPixels[((y - 1) * width + x) * 4 + c];
                        const bottom = origPixels[((y + 1) * width + x) * 4 + c];
                        const left = origPixels[(y * width + (x - 1)) * 4 + c];
                        const right = origPixels[(y * width + (x + 1)) * 4 + c];
                        const center = origPixels[i + c];

                        // Simple blur approximation
                        const blur = (top + bottom + left + right) / 4;

                        // Sharpen: center + (center - blur) * strength
                        const sharpened = center + (center - blur) * sharpAmount * 1.5;

                        sharpPixels[i + c] = Math.max(0, Math.min(255, Math.round(sharpened)));
                    }
                }
            }

            ctx.putImageData(sharpData, 0, 0);
        }

        resolve(canvas.toDataURL('image/png'));
    });
}

/**
 * Check if any adjustments are non-zero
 */
export function hasActiveAdjustments(adjustments: ImageFilter): boolean {
    return (
        (adjustments.temperature !== undefined && adjustments.temperature !== 0) ||
        (adjustments.tint !== undefined && adjustments.tint !== 0) ||
        (adjustments.brightness !== undefined && adjustments.brightness !== 0) ||
        (adjustments.contrast !== undefined && adjustments.contrast !== 0) ||
        (adjustments.highlights !== undefined && adjustments.highlights !== 0) ||
        (adjustments.shadows !== undefined && adjustments.shadows !== 0) ||
        (adjustments.whites !== undefined && adjustments.whites !== 0) ||
        (adjustments.blacks !== undefined && adjustments.blacks !== 0) ||
        (adjustments.vibrance !== undefined && adjustments.vibrance !== 0) ||
        (adjustments.saturation !== undefined && adjustments.saturation !== 0) ||
        (adjustments.clarity !== undefined && adjustments.clarity !== 0) ||
        (adjustments.sharpness !== undefined && adjustments.sharpness !== 0) ||
        (adjustments.vignette !== undefined && adjustments.vignette !== 0) ||
        adjustments.grayscale === true ||
        adjustments.sepia === true ||
        adjustments.invert === true
    );
}

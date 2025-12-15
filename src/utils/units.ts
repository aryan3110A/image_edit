// Unit Conversion Utilities
// DPI, pixels, inches, centimeters, points

export const DPI_SCREEN = 72;
export const DPI_PRINT = 300;
export const CM_PER_INCH = 2.54;
export const MM_PER_INCH = 25.4;
export const POINTS_PER_INCH = 72;

/**
 * Convert pixels to inches
 */
export const pixelsToInches = (pixels: number, dpi: number = DPI_SCREEN): number => {
    return pixels / dpi;
};

/**
 * Convert inches to pixels
 */
export const inchesToPixels = (inches: number, dpi: number = DPI_SCREEN): number => {
    return inches * dpi;
};

/**
 * Convert pixels to centimeters
 */
export const pixelsToCm = (pixels: number, dpi: number = DPI_SCREEN): number => {
    return (pixels / dpi) * CM_PER_INCH;
};

/**
 * Convert centimeters to pixels
 */
export const cmToPixels = (cm: number, dpi: number = DPI_SCREEN): number => {
    return (cm / CM_PER_INCH) * dpi;
};

/**
 * Convert pixels to millimeters
 */
export const pixelsToMm = (pixels: number, dpi: number = DPI_SCREEN): number => {
    return (pixels / dpi) * MM_PER_INCH;
};

/**
 * Convert millimeters to pixels
 */
export const mmToPixels = (mm: number, dpi: number = DPI_SCREEN): number => {
    return (mm / MM_PER_INCH) * dpi;
};

/**
 * Convert pixels to points
 */
export const pixelsToPoints = (pixels: number, dpi: number = DPI_SCREEN): number => {
    return (pixels / dpi) * POINTS_PER_INCH;
};

/**
 * Convert points to pixels
 */
export const pointsToPixels = (points: number, dpi: number = DPI_SCREEN): number => {
    return (points / POINTS_PER_INCH) * dpi;
};

/**
 * Convert between DPIs
 */
export const convertDPI = (pixels: number, fromDPI: number, toDPI: number): number => {
    const inches = pixels / fromDPI;
    return inches * toDPI;
};

/**
 * Calculate print size from pixels
 */
export const calculatePrintSize = (
    widthPx: number,
    heightPx: number,
    dpi: number = DPI_PRINT
): { widthInches: number; heightInches: number; widthCm: number; heightCm: number } => {
    const widthInches = pixelsToInches(widthPx, dpi);
    const heightInches = pixelsToInches(heightPx, dpi);

    return {
        widthInches,
        heightInches,
        widthCm: widthInches * CM_PER_INCH,
        heightCm: heightInches * CM_PER_INCH,
    };
};

/**
 * Calculate pixels needed for print size
 */
export const calculatePixelsForPrint = (
    widthCm: number,
    heightCm: number,
    dpi: number = DPI_PRINT
): { width: number; height: number } => {
    return {
        width: Math.round(cmToPixels(widthCm, dpi)),
        height: Math.round(cmToPixels(heightCm, dpi)),
    };
};

/**
 * Calculate bleed in pixels
 */
export const calculateBleedPixels = (bleedMm: number, dpi: number = DPI_PRINT): number => {
    return Math.round(mmToPixels(bleedMm, dpi));
};

/**
 * Format dimensions for display
 */
export const formatDimensions = (
    widthPx: number,
    heightPx: number,
    unit: 'px' | 'in' | 'cm' | 'mm' = 'px',
    dpi: number = DPI_SCREEN
): string => {
    switch (unit) {
        case 'px':
            return `${widthPx} × ${heightPx} px`;
        case 'in':
            return `${pixelsToInches(widthPx, dpi).toFixed(2)} × ${pixelsToInches(heightPx, dpi).toFixed(2)} in`;
        case 'cm':
            return `${pixelsToCm(widthPx, dpi).toFixed(2)} × ${pixelsToCm(heightPx, dpi).toFixed(2)} cm`;
        case 'mm':
            return `${pixelsToMm(widthPx, dpi).toFixed(1)} × ${pixelsToMm(heightPx, dpi).toFixed(1)} mm`;
        default:
            return `${widthPx} × ${heightPx} px`;
    }
};

/**
 * Maintain aspect ratio when resizing
 */
export const maintainAspectRatio = (
    originalWidth: number,
    originalHeight: number,
    newWidth?: number,
    newHeight?: number
): { width: number; height: number } => {
    const aspectRatio = originalWidth / originalHeight;

    if (newWidth && !newHeight) {
        return {
            width: newWidth,
            height: Math.round(newWidth / aspectRatio),
        };
    }

    if (newHeight && !newWidth) {
        return {
            width: Math.round(newHeight * aspectRatio),
            height: newHeight,
        };
    }

    if (newWidth && newHeight) {
        // Return the dimensions that fit within both constraints
        const widthBasedHeight = newWidth / aspectRatio;
        if (widthBasedHeight <= newHeight) {
            return {
                width: newWidth,
                height: Math.round(widthBasedHeight),
            };
        }
        return {
            width: Math.round(newHeight * aspectRatio),
            height: newHeight,
        };
    }

    return { width: originalWidth, height: originalHeight };
};

// Filters
// Image filter utilities and effects

import { fabric } from 'fabric';

/**
 * Filter configuration for color matrix manipulation
 */
export interface ColorMatrixConfig {
    matrix: number[];
}

/**
 * Create a color matrix filter
 */
export const createColorMatrixFilter = (matrix: number[]): fabric.IBaseFilter => {
    return new fabric.Image.filters.ColorMatrix({ matrix });
};

/**
 * Predefined color matrices for common effects
 */
export const COLOR_MATRICES = {
    // Identity (no change)
    identity: [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0,
    ],

    // Vintage effect
    vintage: [
        0.6279, 0.3202, 0.0519, 0, 0,
        0.0279, 0.6702, 0.0519, 0, 0,
        0.0279, 0.0702, 0.3019, 0, 0,
        0, 0, 0, 1, 0,
    ],

    // Cool tone
    cool: [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1.2, 0, 0,
        0, 0, 0, 1, 0,
    ],

    // Warm tone
    warm: [
        1.2, 0, 0, 0, 0,
        0, 1.1, 0, 0, 0,
        0, 0, 0.9, 0, 0,
        0, 0, 0, 1, 0,
    ],

    // High contrast
    highContrast: [
        1.5, 0, 0, 0, -0.15,
        0, 1.5, 0, 0, -0.15,
        0, 0, 1.5, 0, -0.15,
        0, 0, 0, 1, 0,
    ],

    // Polaroid effect
    polaroid: [
        1.438, -0.062, -0.062, 0, 0,
        -0.122, 1.378, -0.122, 0, 0,
        -0.016, -0.016, 1.483, 0, 0,
        0, 0, 0, 1, 0,
    ],

    // Kodachrome effect
    kodachrome: [
        1.12855, -0.39673, -0.03992, 0, 0.24991,
        -0.16404, 1.08352, -0.05498, 0, 0.09698,
        -0.16786, -0.56034, 1.60148, 0, 0.13972,
        0, 0, 0, 1, 0,
    ],

    // Technicolor effect
    technicolor: [
        1.91252, -0.85453, -0.09155, 0, 0.04624,
        -0.30878, 1.76589, -0.10601, 0, -0.27589,
        -0.23110, -0.75018, 1.84759, 0, 0.12137,
        0, 0, 0, 1, 0,
    ],

    // Protanopia (red-blind)
    protanopia: [
        0.567, 0.433, 0, 0, 0,
        0.558, 0.442, 0, 0, 0,
        0, 0.242, 0.758, 0, 0,
        0, 0, 0, 1, 0,
    ],

    // Deuteranopia (green-blind)
    deuteranopia: [
        0.625, 0.375, 0, 0, 0,
        0.7, 0.3, 0, 0, 0,
        0, 0.3, 0.7, 0, 0,
        0, 0, 0, 1, 0,
    ],

    // Tritanopia (blue-blind)
    tritanopia: [
        0.95, 0.05, 0, 0, 0,
        0, 0.433, 0.567, 0, 0,
        0, 0.475, 0.525, 0, 0,
        0, 0, 0, 1, 0,
    ],
};

/**
 * Create a brightness filter
 */
export const createBrightnessFilter = (value: number): fabric.IBaseFilter => {
    return new fabric.Image.filters.Brightness({ brightness: value / 100 });
};

/**
 * Create a contrast filter
 */
export const createContrastFilter = (value: number): fabric.IBaseFilter => {
    return new fabric.Image.filters.Contrast({ contrast: value / 100 });
};

/**
 * Create a saturation filter
 */
export const createSaturationFilter = (value: number): fabric.IBaseFilter => {
    return new fabric.Image.filters.Saturation({ saturation: value / 100 });
};

/**
 * Create a blur filter
 */
export const createBlurFilter = (value: number): fabric.IBaseFilter => {
    return new fabric.Image.filters.Blur({ blur: value / 100 });
};

/**
 * Create a grayscale filter
 */
export const createGrayscaleFilter = (): fabric.IBaseFilter => {
    return new fabric.Image.filters.Grayscale();
};

/**
 * Create a sepia filter
 */
export const createSepiaFilter = (): fabric.IBaseFilter => {
    return new fabric.Image.filters.Sepia();
};

/**
 * Create an invert filter
 */
export const createInvertFilter = (): fabric.IBaseFilter => {
    return new fabric.Image.filters.Invert();
};

/**
 * Create a noise filter
 */
export const createNoiseFilter = (value: number): fabric.IBaseFilter => {
    return new fabric.Image.filters.Noise({ noise: value });
};

/**
 * Create a pixelate filter
 */
export const createPixelateFilter = (blocksize: number): fabric.IBaseFilter => {
    return new fabric.Image.filters.Pixelate({ blocksize });
};

/**
 * Create a gamma filter
 */
export const createGammaFilter = (r: number, g: number, b: number): fabric.IBaseFilter => {
    return new fabric.Image.filters.Gamma({ gamma: [r, g, b] });
};

/**
 * Combine multiple filters into one
 */
export const combineFilters = (filters: fabric.IBaseFilter[]): fabric.IBaseFilter[] => {
    return filters;
};

/**
 * Apply filters to a Fabric image
 */
export const applyFiltersToImage = (
    image: fabric.Image,
    filters: fabric.IBaseFilter[]
): void => {
    image.filters = filters;
    image.applyFilters();
};

/**
 * Create duotone effect
 */
export const createDuotoneEffect = (
    shadowColor: string,
    highlightColor: string
): fabric.IBaseFilter[] => {
    const grayscale = createGrayscaleFilter();

    // Parse colors
    const shadow = parseColor(shadowColor);
    const highlight = parseColor(highlightColor);

    // Create color matrix for duotone
    const matrix = [
        (highlight.r - shadow.r) / 255, 0, 0, 0, shadow.r / 255,
        (highlight.g - shadow.g) / 255, 0, 0, 0, shadow.g / 255,
        (highlight.b - shadow.b) / 255, 0, 0, 0, shadow.b / 255,
        0, 0, 0, 1, 0,
    ];

    return [grayscale, createColorMatrixFilter(matrix)];
};

/**
 * Parse hex color to RGB
 */
const parseColor = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 };
};

/**
 * Filter preset type for UI
 */
export interface FilterPresetUI {
    id: string;
    name: string;
    category: 'basic' | 'artistic' | 'color' | 'special';
    createFilter: () => fabric.IBaseFilter[];
    thumbnail?: string;
}

/**
 * All available filter presets for UI
 */
export const FILTER_PRESETS_UI: FilterPresetUI[] = [
    {
        id: 'none',
        name: 'None',
        category: 'basic',
        createFilter: () => [],
    },
    {
        id: 'grayscale',
        name: 'Grayscale',
        category: 'basic',
        createFilter: () => [createGrayscaleFilter()],
    },
    {
        id: 'sepia',
        name: 'Sepia',
        category: 'basic',
        createFilter: () => [createSepiaFilter()],
    },
    {
        id: 'invert',
        name: 'Invert',
        category: 'basic',
        createFilter: () => [createInvertFilter()],
    },
    {
        id: 'vintage',
        name: 'Vintage',
        category: 'artistic',
        createFilter: () => [createColorMatrixFilter(COLOR_MATRICES.vintage)],
    },
    {
        id: 'polaroid',
        name: 'Polaroid',
        category: 'artistic',
        createFilter: () => [createColorMatrixFilter(COLOR_MATRICES.polaroid)],
    },
    {
        id: 'kodachrome',
        name: 'Kodachrome',
        category: 'artistic',
        createFilter: () => [createColorMatrixFilter(COLOR_MATRICES.kodachrome)],
    },
    {
        id: 'technicolor',
        name: 'Technicolor',
        category: 'artistic',
        createFilter: () => [createColorMatrixFilter(COLOR_MATRICES.technicolor)],
    },
    {
        id: 'warm',
        name: 'Warm',
        category: 'color',
        createFilter: () => [createColorMatrixFilter(COLOR_MATRICES.warm)],
    },
    {
        id: 'cool',
        name: 'Cool',
        category: 'color',
        createFilter: () => [createColorMatrixFilter(COLOR_MATRICES.cool)],
    },
    {
        id: 'highContrast',
        name: 'High Contrast',
        category: 'color',
        createFilter: () => [createColorMatrixFilter(COLOR_MATRICES.highContrast)],
    },
];

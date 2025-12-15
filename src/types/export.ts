// Export Type Definitions
// Types for all export formats and settings

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'pptx';

export type ImageQuality = 'low' | 'medium' | 'high' | 'maximum';

export type PDFColorSpace = 'rgb' | 'cmyk';

// Base export settings
export interface BaseExportSettings {
    format: ExportFormat;
    filename: string;
    pages: 'all' | 'current' | number[]; // Page indices to export
}

// Image export settings (PNG, JPG)
export interface ImageExportSettings extends BaseExportSettings {
    format: 'png' | 'jpg';
    quality: ImageQuality;
    scale: number; // 1 = original, 2 = 2x, etc.
    dpi: number;
    transparentBackground: boolean; // Only for PNG
    includeBleed: boolean;
    bleedSize: number; // in pixels
}

// SVG export settings
export interface SVGExportSettings extends BaseExportSettings {
    format: 'svg';
    embedFonts: boolean;
    embedImages: boolean;
    optimizePaths: boolean;
}

// PDF export settings
export interface PDFExportSettings extends BaseExportSettings {
    format: 'pdf';
    quality: ImageQuality;
    colorSpace: PDFColorSpace;
    embedFonts: boolean;
    compression: boolean;
    includeBleed: boolean;
    bleedSize: number;
    cropMarks: boolean;
    flattenLayers: boolean;
}

// PPTX export settings
export interface PPTXExportSettings extends BaseExportSettings {
    format: 'pptx';
    slideSize: '16:9' | '4:3' | 'custom';
    embedFonts: boolean;
    preserveAnimations: boolean;
}

// Union type for all export settings
export type ExportSettings =
    | ImageExportSettings
    | SVGExportSettings
    | PDFExportSettings
    | PPTXExportSettings;

// Export progress tracking
export interface ExportProgress {
    status: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'complete' | 'error';
    progress: number; // 0-100
    currentPage: number;
    totalPages: number;
    message: string;
    error?: string;
}

// Export result
export interface ExportResult {
    success: boolean;
    format: ExportFormat;
    blob?: Blob;
    url?: string;
    filename: string;
    size: number;
    duration: number; // Export time in ms
    error?: string;
}

// Quality to scale mapping
export const QUALITY_SCALE_MAP: Record<ImageQuality, number> = {
    low: 0.5,
    medium: 1,
    high: 2,
    maximum: 4,
};

// Quality to JPEG compression mapping
export const QUALITY_JPEG_MAP: Record<ImageQuality, number> = {
    low: 0.6,
    medium: 0.8,
    high: 0.92,
    maximum: 1,
};

// Default export settings factory
export const createDefaultImageExportSettings = (
    format: 'png' | 'jpg' = 'png'
): ImageExportSettings => ({
    format,
    filename: 'design',
    pages: 'current',
    quality: 'high',
    scale: 1,
    dpi: 72,
    transparentBackground: format === 'png',
    includeBleed: false,
    bleedSize: 0,
});

export const createDefaultPDFExportSettings = (): PDFExportSettings => ({
    format: 'pdf',
    filename: 'design',
    pages: 'all',
    quality: 'high',
    colorSpace: 'rgb',
    embedFonts: true,
    compression: true,
    includeBleed: false,
    bleedSize: 0,
    cropMarks: false,
    flattenLayers: false,
});

export const createDefaultPPTXExportSettings = (): PPTXExportSettings => ({
    format: 'pptx',
    filename: 'presentation',
    pages: 'all',
    slideSize: '16:9',
    embedFonts: true,
    preserveAnimations: false,
});

export const createDefaultSVGExportSettings = (): SVGExportSettings => ({
    format: 'svg',
    filename: 'design',
    pages: 'current',
    embedFonts: true,
    embedImages: true,
    optimizePaths: true,
});

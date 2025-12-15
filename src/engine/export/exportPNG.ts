// Export PNG
// PNG/JPG export utilities

import { getCanvasRenderer, RenderOptions } from '../CanvasRenderer';
import { Page } from '@/types/project';
import { ImageExportSettings, QUALITY_SCALE_MAP, QUALITY_JPEG_MAP } from '@/types/export';

export interface PNGExportResult {
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    size: number;
}

/**
 * Export canvas to PNG
 */
export const exportToPNG = async (
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    const renderer = getCanvasRenderer();
    const dimensions = renderer.getDimensions();

    const scale = settings.scale || QUALITY_SCALE_MAP[settings.quality || 'high'];

    const options: RenderOptions = {
        format: 'png',
        scale,
        quality: 1, // PNG is lossless
        backgroundColor: settings.transparentBackground ? undefined : '#ffffff',
    };

    const blob = await renderer.renderToBlob(options);
    const dataUrl = renderer.renderToDataURL(options);

    return {
        blob,
        dataUrl,
        width: dimensions.width * scale,
        height: dimensions.height * scale,
        size: blob.size,
    };
};

/**
 * Export canvas to JPG
 */
export const exportToJPG = async (
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    const renderer = getCanvasRenderer();
    const dimensions = renderer.getDimensions();

    const scale = settings.scale || QUALITY_SCALE_MAP[settings.quality || 'high'];
    const quality = QUALITY_JPEG_MAP[settings.quality || 'high'];

    const options: RenderOptions = {
        format: 'jpeg',
        scale,
        quality,
        backgroundColor: '#ffffff', // JPG doesn't support transparency
    };

    const blob = await renderer.renderToBlob(options);
    const dataUrl = renderer.renderToDataURL(options);

    return {
        blob,
        dataUrl,
        width: dimensions.width * scale,
        height: dimensions.height * scale,
        size: blob.size,
    };
};

/**
 * Export single page to PNG
 */
export const exportPageToPNG = async (
    page: Page,
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    const renderer = getCanvasRenderer();
    const scale = settings.scale || QUALITY_SCALE_MAP[settings.quality || 'high'];

    const blob = await renderer.renderPage(page, {
        format: 'png',
        scale,
        quality: 1,
        backgroundColor: settings.transparentBackground ? undefined : '#ffffff',
    });

    return {
        blob,
        dataUrl: URL.createObjectURL(blob),
        width: page.width * scale,
        height: page.height * scale,
        size: blob.size,
    };
};

/**
 * Export multiple pages to PNG (returns zip file placeholder)
 */
export const exportPagesToPNG = async (
    pages: Page[],
    settings: Partial<ImageExportSettings> = {}
): Promise<{ pages: PNGExportResult[]; totalSize: number }> => {
    const results: PNGExportResult[] = [];
    let totalSize = 0;

    for (const page of pages) {
        const result = await exportPageToPNG(page, settings);
        results.push(result);
        totalSize += result.size;
    }

    return { pages: results, totalSize };
};

/**
 * Export high-resolution (8K) image
 */
export const exportHighResolution = async (
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    const renderer = getCanvasRenderer();
    const dimensions = renderer.getDimensions();

    // Use tiled rendering for 8K
    const scale = settings.quality === 'maximum' ? 4 : 2;

    const blob = await renderer.renderHighResolution({
        format: 'png',
        scale,
        quality: 1,
    });

    return {
        blob,
        dataUrl: URL.createObjectURL(blob),
        width: dimensions.width * scale,
        height: dimensions.height * scale,
        size: blob.size,
    };
};

/**
 * Download exported image
 */
export const downloadImage = (
    blob: Blob,
    filename: string,
    format: 'png' | 'jpg' = 'png'
): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

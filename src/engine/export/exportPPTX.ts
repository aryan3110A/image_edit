// Export PPTX
// PowerPoint export using pptxgenjs

import PptxGenJS from 'pptxgenjs';
import { Page } from '@/types/project';
import { PPTXExportSettings } from '@/types/export';
import { getCanvasRenderer } from '../CanvasRenderer';

export interface PPTXExportResult {
    blob: Blob;
    slideCount: number;
    size: number;
}

/**
 * Get slide layout based on settings
 */
const getSlideLayout = (
    slideSize: '16:9' | '4:3' | 'custom',
    customWidth?: number,
    customHeight?: number
): { width: number; height: number } => {
    switch (slideSize) {
        case '16:9':
            return { width: 13.33, height: 7.5 }; // PowerPoint default 16:9
        case '4:3':
            return { width: 10, height: 7.5 }; // PowerPoint default 4:3
        case 'custom':
            return {
                width: (customWidth || 1920) / 96, // Convert pixels to inches
                height: (customHeight || 1080) / 96,
            };
        default:
            return { width: 13.33, height: 7.5 };
    }
};

/**
 * Export current canvas to PPTX
 */
export const exportToPPTX = async (
    settings: Partial<PPTXExportSettings> = {}
): Promise<PPTXExportResult> => {
    const renderer = getCanvasRenderer();
    const dimensions = renderer.getDimensions();

    // Create presentation
    const pptx = new PptxGenJS();

    // Set slide size
    const layout = getSlideLayout(
        settings.slideSize || '16:9',
        dimensions.width,
        dimensions.height
    );

    pptx.defineLayout({
        name: 'CUSTOM',
        width: layout.width,
        height: layout.height,
    });
    pptx.layout = 'CUSTOM';

    // Add slide
    const slide = pptx.addSlide();

    // Render canvas to base64
    const dataUrl = renderer.renderToDataURL({
        format: 'png',
        scale: 2,
        quality: 1,
    });

    // Add image to slide
    slide.addImage({
        data: dataUrl,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
    });

    // Write to blob
    const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;

    return {
        blob: pptxBlob,
        slideCount: 1,
        size: pptxBlob.size,
    };
};

/**
 * Export multiple pages to PPTX
 */
export const exportPagesToPPTX = async (
    pages: Page[],
    settings: Partial<PPTXExportSettings> = {}
): Promise<PPTXExportResult> => {
    const renderer = getCanvasRenderer();

    // Create presentation
    const pptx = new PptxGenJS();

    // Use first page dimensions or settings
    const firstPage = pages[0];
    const layout = getSlideLayout(
        settings.slideSize || '16:9',
        firstPage?.width,
        firstPage?.height
    );

    pptx.defineLayout({
        name: 'CUSTOM',
        width: layout.width,
        height: layout.height,
    });
    pptx.layout = 'CUSTOM';

    // Add each page as a slide
    for (const canvasPage of pages) {
        // Render page
        const pngBlob = await renderer.renderPage(canvasPage, {
            format: 'png',
            scale: 2,
            quality: 1,
        });

        // Convert blob to base64
        const base64 = await blobToBase64(pngBlob);

        // Add slide
        const slide = pptx.addSlide();

        // Add image
        slide.addImage({
            data: base64,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
        });
    }

    // Write to blob
    const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;

    return {
        blob: pptxBlob,
        slideCount: pages.length,
        size: pptxBlob.size,
    };
};

/**
 * Convert Blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Download PPTX file
 */
export const downloadPPTX = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Export PDF
// PDF generation using pdf-lib

import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import { Page } from '@/types/project';
import { PDFExportSettings } from '@/types/export';
import { getCanvasRenderer } from '../CanvasRenderer';

export interface PDFExportResult {
    blob: Blob;
    pageCount: number;
    size: number;
}

/**
 * Convert hex color to RGB values (0-1 range)
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        };
    }
    return { r: 0, g: 0, b: 0 };
};

/**
 * Export single canvas to PDF
 */
export const exportToPDF = async (
    settings: Partial<PDFExportSettings> = {}
): Promise<PDFExportResult> => {
    const renderer = getCanvasRenderer();
    const dimensions = renderer.getDimensions();

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Add page with canvas dimensions
    const page = pdfDoc.addPage([dimensions.width, dimensions.height]);

    // Render canvas to PNG
    const pngBlob = await renderer.renderToBlob({
        format: 'png',
        scale: settings.quality === 'maximum' ? 2 : 1,
        quality: 1,
    });

    // Embed image into PDF
    const pngBytes = await pngBlob.arrayBuffer();
    const pngImage = await pdfDoc.embedPng(pngBytes);

    // Draw image on page
    page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return {
        blob,
        pageCount: 1,
        size: blob.size,
    };
};

/**
 * Export multiple pages to PDF
 */
export const exportPagesToPDF = async (
    pages: Page[],
    settings: Partial<PDFExportSettings> = {}
): Promise<PDFExportResult> => {
    const renderer = getCanvasRenderer();

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Add each page
    for (const canvasPage of pages) {
        // Render page
        const pngBlob = await renderer.renderPage(canvasPage, {
            format: 'png',
            scale: settings.quality === 'maximum' ? 2 : 1,
            quality: 1,
        });

        // Add PDF page with canvas dimensions
        const pdfPage = pdfDoc.addPage([canvasPage.width, canvasPage.height]);

        // Embed and draw image
        const pngBytes = await pngBlob.arrayBuffer();
        const pngImage = await pdfDoc.embedPng(pngBytes);

        pdfPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: canvasPage.width,
            height: canvasPage.height,
        });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return {
        blob,
        pageCount: pages.length,
        size: blob.size,
    };
};

/**
 * Export for print with bleed and crop marks
 */
export const exportPrintPDF = async (
    pages: Page[],
    settings: PDFExportSettings
): Promise<PDFExportResult> => {
    const renderer = getCanvasRenderer();
    const bleedSize = settings.bleedSize || 9; // 3mm = ~9pt

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    for (const canvasPage of pages) {
        // Calculate page size with bleed
        const pageWidth = canvasPage.width + (settings.includeBleed ? bleedSize * 2 : 0);
        const pageHeight = canvasPage.height + (settings.includeBleed ? bleedSize * 2 : 0);

        const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

        // Render page
        const pngBlob = await renderer.renderPage(canvasPage, {
            format: 'png',
            scale: 2, // High quality for print
            quality: 1,
        });

        // Embed and draw image
        const pngBytes = await pngBlob.arrayBuffer();
        const pngImage = await pdfDoc.embedPng(pngBytes);

        pdfPage.drawImage(pngImage, {
            x: settings.includeBleed ? bleedSize : 0,
            y: settings.includeBleed ? bleedSize : 0,
            width: canvasPage.width,
            height: canvasPage.height,
        });

        // Draw crop marks if enabled
        if (settings.cropMarks) {
            const markLength = 18; // ~6mm
            const markOffset = settings.includeBleed ? bleedSize : 0;
            const { r, g, b } = hexToRgb('#000000');

            // Top-left
            pdfPage.drawLine({
                start: { x: markOffset - markLength, y: pageHeight - markOffset },
                end: { x: markOffset, y: pageHeight - markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: markOffset, y: pageHeight - markOffset },
                end: { x: markOffset, y: pageHeight - markOffset + markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });

            // Top-right
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: pageHeight - markOffset },
                end: { x: pageWidth - markOffset + markLength, y: pageHeight - markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: pageHeight - markOffset },
                end: { x: pageWidth - markOffset, y: pageHeight - markOffset + markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });

            // Bottom-left
            pdfPage.drawLine({
                start: { x: markOffset - markLength, y: markOffset },
                end: { x: markOffset, y: markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: markOffset, y: markOffset },
                end: { x: markOffset, y: markOffset - markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });

            // Bottom-right
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: markOffset },
                end: { x: pageWidth - markOffset + markLength, y: markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: markOffset },
                end: { x: pageWidth - markOffset, y: markOffset - markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
        }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return {
        blob,
        pageCount: pages.length,
        size: blob.size,
    };
};

/**
 * Download PDF file
 */
export const downloadPDF = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

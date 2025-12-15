// Export SVG
// SVG export utilities

import { SVGExportSettings } from '@/types/export';
import { getFabricCanvas } from '../fabric/FabricCanvas';
import { Page } from '@/types/project';

export interface SVGExportResult {
    svg: string;
    blob: Blob;
    size: number;
}

/**
 * Export canvas to SVG
 */
export const exportToSVG = async (
    settings: Partial<SVGExportSettings> = {}
): Promise<SVGExportResult> => {
    const fabricCanvas = getFabricCanvas();

    // Get SVG string from Fabric
    let svg = fabricCanvas.toSVG();

    // Optimize if requested
    if (settings.optimizePaths) {
        svg = optimizeSVG(svg);
    }

    // Handle font embedding
    if (!settings.embedFonts) {
        svg = removeFontDefinitions(svg);
    }

    // Handle image embedding
    if (!settings.embedImages) {
        svg = convertImagesToLinks(svg);
    }

    const blob = new Blob([svg], { type: 'image/svg+xml' });

    return {
        svg,
        blob,
        size: blob.size,
    };
};

/**
 * Export page to SVG
 */
export const exportPageToSVG = async (
    page: Page,
    settings: Partial<SVGExportSettings> = {}
): Promise<SVGExportResult> => {
    const fabricCanvas = getFabricCanvas();

    // Load page
    await fabricCanvas.loadPage(page);

    // Export
    return exportToSVG(settings);
};

/**
 * Basic SVG optimization
 */
const optimizeSVG = (svg: string): string => {
    let optimized = svg;

    // Remove unnecessary whitespace
    optimized = optimized.replace(/>\s+</g, '><');

    // Remove empty attributes
    optimized = optimized.replace(/\s+[a-z-]+=""/gi, '');

    // Remove comments
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

    // Remove empty groups
    optimized = optimized.replace(/<g>\s*<\/g>/g, '');

    // Simplify transform attributes
    optimized = optimized.replace(/transform="matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\)"/g, '');

    // Remove default values
    optimized = optimized.replace(/\s+fill-opacity="1"/g, '');
    optimized = optimized.replace(/\s+stroke-opacity="1"/g, '');
    optimized = optimized.replace(/\s+opacity="1"/g, '');

    return optimized;
};

/**
 * Remove font definitions from SVG
 */
const removeFontDefinitions = (svg: string): string => {
    // Remove @font-face rules
    return svg.replace(/@font-face\s*{[^}]*}/g, '');
};

/**
 * Convert embedded images to external links
 * (Placeholder - actual implementation would need image URLs)
 */
const convertImagesToLinks = (svg: string): string => {
    // For now, just return as-is
    // Real implementation would replace data: URLs with external URLs
    return svg;
};

/**
 * Parse SVG string to extract elements
 */
export const parseSVGElements = (svg: string): SVGElement => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    return doc.documentElement as unknown as SVGElement;
};

/**
 * Get SVG dimensions
 */
export const getSVGDimensions = (svg: string): { width: number; height: number } => {
    const element = parseSVGElements(svg);
    const width = parseFloat(element.getAttribute('width') || '0');
    const height = parseFloat(element.getAttribute('height') || '0');

    return { width, height };
};

/**
 * Resize SVG
 */
export const resizeSVG = (
    svg: string,
    newWidth: number,
    newHeight: number
): string => {
    const element = parseSVGElements(svg);
    element.setAttribute('width', String(newWidth));
    element.setAttribute('height', String(newHeight));

    return element.outerHTML;
};

/**
 * Download SVG file
 */
export const downloadSVG = (svg: string, filename: string): void => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

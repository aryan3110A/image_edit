// Page Manager
// Multi-page canvas management

import { Page, PagePreset, PageBackground, PAGE_PRESETS, createDefaultPage } from '@/types/project';
import { CanvasElement } from '@/types/canvas';
import { FabricCanvas, getFabricCanvas } from './fabric/FabricCanvas';

export interface PageManagerOptions {
    maxPages?: number;
    autoSave?: boolean;
    thumbnailSize?: { width: number; height: number };
}

export class PageManager {
    private pages: Map<string, Page> = new Map();
    private currentPageId: string | null = null;
    private fabricCanvas: FabricCanvas;
    private options: PageManagerOptions;

    constructor(options: PageManagerOptions = {}) {
        this.options = {
            maxPages: 100,
            autoSave: true,
            thumbnailSize: { width: 200, height: 150 },
            ...options,
        };
        this.fabricCanvas = getFabricCanvas();
    }

    /**
     * Initialize with a page
     */
    public async initialize(page?: Page): Promise<Page> {
        const initialPage = page || createDefaultPage();
        this.pages.set(initialPage.id, initialPage);
        this.currentPageId = initialPage.id;

        await this.loadPage(initialPage.id);

        return initialPage;
    }

    /**
     * Get all pages
     */
    public getPages(): Page[] {
        return Array.from(this.pages.values());
    }

    /**
     * Get page by ID
     */
    public getPage(id: string): Page | undefined {
        return this.pages.get(id);
    }

    /**
     * Get current page
     */
    public getCurrentPage(): Page | null {
        if (!this.currentPageId) return null;
        return this.pages.get(this.currentPageId) || null;
    }

    /**
     * Get current page ID
     */
    public getCurrentPageId(): string | null {
        return this.currentPageId;
    }

    /**
     * Add a new page
     */
    public addPage(preset?: PagePreset): Page {
        if (this.pages.size >= (this.options.maxPages || 100)) {
            throw new Error(`Maximum number of pages (${this.options.maxPages}) reached`);
        }

        const newPage = createDefaultPage(preset);
        this.pages.set(newPage.id, newPage);

        return newPage;
    }

    /**
     * Remove a page
     */
    public removePage(id: string): boolean {
        if (this.pages.size <= 1) {
            throw new Error('Cannot remove the last page');
        }

        const removed = this.pages.delete(id);

        if (removed && this.currentPageId === id) {
            // Switch to first available page
            const firstPage = Array.from(this.pages.keys())[0];
            if (firstPage) {
                this.loadPage(firstPage);
            }
        }

        return removed;
    }

    /**
     * Duplicate a page
     */
    public duplicatePage(id: string): Page | null {
        const original = this.pages.get(id);
        if (!original) return null;

        const duplicated: Page = {
            ...JSON.parse(JSON.stringify(original)),
            id: crypto.randomUUID(),
            name: `${original.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        this.pages.set(duplicated.id, duplicated);

        return duplicated;
    }

    /**
     * Load a page onto the canvas
     */
    public async loadPage(id: string): Promise<void> {
        // Save current page state first
        if (this.currentPageId && this.options.autoSave) {
            await this.saveCurrentPage();
        }

        const page = this.pages.get(id);
        if (!page) {
            throw new Error(`Page ${id} not found`);
        }

        this.currentPageId = id;
        await this.fabricCanvas.loadPage(page);
    }

    /**
     * Save current page state from canvas
     */
    public async saveCurrentPage(): Promise<void> {
        if (!this.currentPageId) return;

        const page = this.pages.get(this.currentPageId);
        if (!page) return;

        // Get current canvas JSON
        const canvasJSON = this.fabricCanvas.toJSON();

        // Update page with current elements
        // Note: This is a simplified version - real implementation would 
        // convert Fabric objects back to CanvasElement format
        page.updatedAt = Date.now();

        // Generate thumbnail
        page.thumbnail = await this.generateThumbnail();

        this.pages.set(this.currentPageId, page);
    }

    /**
     * Generate thumbnail for current page
     */
    private async generateThumbnail(): Promise<string> {
        const dataUrl = this.fabricCanvas.toDataURL({
            format: 'png',
            quality: 0.5,
            multiplier: 0.2,
        });

        return dataUrl;
    }

    /**
     * Update page properties
     */
    public updatePage(id: string, updates: Partial<Page>): Page | null {
        const page = this.pages.get(id);
        if (!page) return null;

        const updatedPage = {
            ...page,
            ...updates,
            updatedAt: Date.now(),
        };

        this.pages.set(id, updatedPage);

        // If updating current page, reload canvas
        if (id === this.currentPageId) {
            this.fabricCanvas.resize(updatedPage.width, updatedPage.height);
            this.fabricCanvas.setBackground(updatedPage.background);
        }

        return updatedPage;
    }

    /**
     * Resize page
     */
    public resizePage(id: string, width: number, height: number): void {
        const page = this.pages.get(id);
        if (!page) return;

        page.width = width;
        page.height = height;
        page.updatedAt = Date.now();

        if (id === this.currentPageId) {
            this.fabricCanvas.resize(width, height);
        }
    }

    /**
     * Set page background
     */
    public setPageBackground(id: string, background: PageBackground): void {
        const page = this.pages.get(id);
        if (!page) return;

        page.background = background;
        page.updatedAt = Date.now();

        if (id === this.currentPageId) {
            this.fabricCanvas.setBackground(background);
        }
    }

    /**
     * Reorder pages
     */
    public reorderPages(fromIndex: number, toIndex: number): void {
        const pagesArray = Array.from(this.pages.entries());
        const [moved] = pagesArray.splice(fromIndex, 1);
        pagesArray.splice(toIndex, 0, moved);

        this.pages = new Map(pagesArray);
    }

    /**
     * Add elements to a page
     */
    public addElement(pageId: string, element: CanvasElement): void {
        const page = this.pages.get(pageId);
        if (!page) return;

        page.elements.push(element);
        page.updatedAt = Date.now();

        if (pageId === this.currentPageId) {
            this.fabricCanvas.addElement(element);
        }
    }

    /**
     * Remove element from a page
     */
    public removeElement(pageId: string, elementId: string): void {
        const page = this.pages.get(pageId);
        if (!page) return;

        page.elements = page.elements.filter(el => el.id !== elementId);
        page.updatedAt = Date.now();

        if (pageId === this.currentPageId) {
            this.fabricCanvas.removeObject(elementId);
        }
    }

    /**
     * Get page count
     */
    public getPageCount(): number {
        return this.pages.size;
    }

    /**
     * Export pages to JSON
     */
    public exportToJSON(): { pages: Page[]; version: string } {
        return {
            pages: Array.from(this.pages.values()),
            version: '1.0.0',
        };
    }

    /**
     * Import pages from JSON
     */
    public importFromJSON(data: { pages: Page[]; version: string }): void {
        this.pages.clear();

        for (const page of data.pages) {
            this.pages.set(page.id, page);
        }

        // Load first page
        const firstPage = data.pages[0];
        if (firstPage) {
            this.loadPage(firstPage.id);
        }
    }

    /**
     * Clear all pages
     */
    public clear(): void {
        this.pages.clear();
        this.currentPageId = null;
        this.fabricCanvas.clear();
    }

    /**
     * Get available page presets
     */
    public static getPresets(): PagePreset[] {
        return PAGE_PRESETS;
    }

    /**
     * Get presets by category
     */
    public static getPresetsByCategory(category: string): PagePreset[] {
        return PAGE_PRESETS.filter(preset => preset.category === category);
    }
}

// Singleton instance
let pageManagerInstance: PageManager | null = null;

export const getPageManager = (options?: PageManagerOptions): PageManager => {
    if (!pageManagerInstance) {
        pageManagerInstance = new PageManager(options);
    }
    return pageManagerInstance;
};

export const resetPageManager = (): void => {
    if (pageManagerInstance) {
        pageManagerInstance.clear();
        pageManagerInstance = null;
    }
};

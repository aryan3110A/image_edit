// Fabric Canvas
// Core Fabric.js wrapper and initialization

import { fabric } from 'fabric';
import { CanvasElement, TextElement, ImageElement, ShapeElement } from '@/types/canvas';
import { Page, PageBackground } from '@/types/project';

export interface FabricCanvasOptions {
    width: number;
    height: number;
    backgroundColor?: string;
    preserveObjectStacking?: boolean;
    selection?: boolean;
    controlsAboveOverlay?: boolean;
}

export class FabricCanvas {
    private canvas: fabric.Canvas | null = null;
    private containerElement: HTMLCanvasElement | null = null;
    private objectIdMap: Map<string, fabric.Object> = new Map();

    // Event callbacks
    public onSelectionChange?: (selectedIds: string[]) => void;
    public onObjectModified?: (id: string) => void;
    public onObjectAdded?: (id: string) => void;
    public onObjectRemoved?: (id: string) => void;

    constructor() {
        this.objectIdMap = new Map();
    }

    /**
     * Initialize the Fabric.js canvas
     */
    public init(canvasElement: HTMLCanvasElement, options: FabricCanvasOptions): fabric.Canvas {
        this.containerElement = canvasElement;

        this.canvas = new fabric.Canvas(canvasElement, {
            width: options.width,
            height: options.height,
            backgroundColor: options.backgroundColor || '#ffffff',
            preserveObjectStacking: options.preserveObjectStacking ?? true,
            selection: options.selection ?? true,
            controlsAboveOverlay: options.controlsAboveOverlay ?? true,
            renderOnAddRemove: true,
            stopContextMenu: true,
            fireRightClick: true,
            fireMiddleClick: true,
        });

        this.setupEventListeners();
        this.setupCustomControls();

        return this.canvas;
    }

    /**
     * Dispose of the canvas and clean up resources
     */
    public dispose(): void {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
        this.objectIdMap.clear();
        this.containerElement = null;
    }

    /**
     * Get the Fabric canvas instance
     */
    public getCanvas(): fabric.Canvas | null {
        return this.canvas;
    }

    /**
     * Setup event listeners for canvas interactions
     */
    private setupEventListeners(): void {
        if (!this.canvas) return;

        // Selection events
        this.canvas.on('selection:created', () => {
            const selectedIds = this.getSelectedObjectIds();
            this.onSelectionChange?.(selectedIds);
        });

        this.canvas.on('selection:updated', () => {
            const selectedIds = this.getSelectedObjectIds();
            this.onSelectionChange?.(selectedIds);
        });

        this.canvas.on('selection:cleared', () => {
            this.onSelectionChange?.([]);
        });

        // Object modification events
        this.canvas.on('object:modified', (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (obj && obj.data?.id) {
                this.onObjectModified?.(obj.data.id);
            }
        });

        this.canvas.on('object:added', (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (obj && obj.data?.id) {
                this.objectIdMap.set(obj.data.id, obj);
                this.onObjectAdded?.(obj.data.id);
            }
        });

        this.canvas.on('object:removed', (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (obj && obj.data?.id) {
                this.objectIdMap.delete(obj.data.id);
                this.onObjectRemoved?.(obj.data.id);
            }
        });
    }

    /**
     * Setup custom control styling
     */
    private setupCustomControls(): void {
        // Customize control appearance
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#2563eb';
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.cornerSize = 10;
        fabric.Object.prototype.borderColor = '#2563eb';
        fabric.Object.prototype.borderScaleFactor = 2;
        fabric.Object.prototype.padding = 0;
    }

    /**
     * Get selected object IDs
     */
    private getSelectedObjectIds(): string[] {
        if (!this.canvas) return [];

        const activeObjects = this.canvas.getActiveObjects();
        return activeObjects
            .filter((obj: fabric.Object & { data?: { id: string } }) => obj.data?.id)
            .map((obj: fabric.Object & { data?: { id: string } }) => obj.data!.id);
    }

    /**
     * Resize the canvas
     */
    public resize(width: number, height: number): void {
        if (!this.canvas) return;

        this.canvas.setDimensions({ width, height });
        this.canvas.renderAll();
    }

    /**
     * Set canvas background
     */
    public setBackground(background: PageBackground): void {
        if (!this.canvas) return;

        switch (background.type) {
            case 'solid':
                this.canvas.backgroundColor = background.color;
                break;

            case 'gradient': {
                const gradient = new fabric.Gradient({
                    type: background.gradientType,
                    coords: background.gradientType === 'linear'
                        ? { x1: 0, y1: 0, x2: this.canvas.width!, y2: this.canvas.height! }
                        : { x1: this.canvas.width! / 2, y1: this.canvas.height! / 2, r1: 0, x2: this.canvas.width! / 2, y2: this.canvas.height! / 2, r2: Math.max(this.canvas.width!, this.canvas.height!) / 2 },
                    colorStops: background.colorStops,
                });
                this.canvas.backgroundColor = gradient as unknown as string;
                break;
            }

            case 'image':
                fabric.Image.fromURL(background.src, (img: fabric.Image) => {
                    if (!this.canvas) return;

                    // Scale image to fit
                    const scaleX = this.canvas.width! / (img.width || 1);
                    const scaleY = this.canvas.height! / (img.height || 1);

                    let scale: number;
                    switch (background.fit) {
                        case 'cover':
                            scale = Math.max(scaleX, scaleY);
                            break;
                        case 'contain':
                            scale = Math.min(scaleX, scaleY);
                            break;
                        case 'fill':
                            img.set({ scaleX, scaleY });
                            scale = 1;
                            break;
                        default:
                            scale = 1;
                    }

                    if (background.fit !== 'fill') {
                        img.scale(scale);
                    }

                    img.set({ opacity: background.opacity });
                    this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
                }, { crossOrigin: 'anonymous' });
                break;
        }

        this.canvas.renderAll();
    }

    /**
     * Add a text element
     */
    public addText(element: TextElement): fabric.IText {
        if (!this.canvas) throw new Error('Canvas not initialized');

        const text = new fabric.IText(element.content, {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width,
            fontFamily: element.textStyle.fontFamily,
            fontSize: element.textStyle.fontSize,
            fontWeight: element.textStyle.fontWeight as number,
            fontStyle: element.textStyle.fontStyle,
            textAlign: element.textStyle.textAlign,
            lineHeight: element.textStyle.lineHeight,
            charSpacing: element.textStyle.letterSpacing * 100,
            fill: element.style.fill as string,
            stroke: element.style.stroke ?? undefined,
            strokeWidth: element.style.strokeWidth,
            opacity: element.style.opacity,
            angle: element.transform.rotation,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
            originX: element.transform.originX,
            originY: element.transform.originY,
            selectable: element.selectable,
            lockMovementX: element.locked,
            lockMovementY: element.locked,
            visible: element.visible,
            data: { id: element.id, type: 'text' },
        });

        // Apply shadow if present
        if (element.style.shadow) {
            text.shadow = new fabric.Shadow({
                color: element.style.shadow.color,
                blur: element.style.shadow.blur,
                offsetX: element.style.shadow.offsetX,
                offsetY: element.style.shadow.offsetY,
            });
        }

        this.canvas.add(text);
        this.objectIdMap.set(element.id, text);

        return text;
    }

    /**
     * Add an image element
     */
    public async addImage(element: ImageElement): Promise<fabric.Image> {
        if (!this.canvas) throw new Error('Canvas not initialized');

        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(
                element.src,
                (img: fabric.Image) => {
                    if (!this.canvas) {
                        reject(new Error('Canvas not initialized'));
                        return;
                    }

                    img.set({
                        left: element.transform.x,
                        top: element.transform.y,
                        scaleX: element.transform.scaleX,
                        scaleY: element.transform.scaleY,
                        angle: element.transform.rotation,
                        originX: element.transform.originX,
                        originY: element.transform.originY,
                        opacity: element.style.opacity,
                        selectable: element.selectable,
                        lockMovementX: element.locked,
                        lockMovementY: element.locked,
                        visible: element.visible,
                        data: { id: element.id, type: 'image' },
                    });

                    // Apply filters
                    this.applyImageFilters(img, element);

                    this.canvas!.add(img);
                    this.objectIdMap.set(element.id, img);

                    resolve(img);
                },
                { crossOrigin: element.crossOrigin || 'anonymous' }
            );
        });
    }

    /**
     * Apply image filters
     */
    private applyImageFilters(img: fabric.Image, element: ImageElement): void {
        const filters: fabric.IBaseFilter[] = [];

        if (element.filters.brightness !== 0) {
            filters.push(new fabric.Image.filters.Brightness({
                brightness: element.filters.brightness / 100,
            }));
        }

        if (element.filters.contrast !== 0) {
            filters.push(new fabric.Image.filters.Contrast({
                contrast: element.filters.contrast / 100,
            }));
        }

        if (element.filters.saturation !== 0) {
            filters.push(new fabric.Image.filters.Saturation({
                saturation: element.filters.saturation / 100,
            }));
        }

        if (element.filters.blur > 0) {
            filters.push(new fabric.Image.filters.Blur({
                blur: element.filters.blur / 100,
            }));
        }

        if (element.filters.grayscale) {
            filters.push(new fabric.Image.filters.Grayscale());
        }

        if (element.filters.sepia) {
            filters.push(new fabric.Image.filters.Sepia());
        }

        if (element.filters.invert) {
            filters.push(new fabric.Image.filters.Invert());
        }

        img.filters = filters;
        img.applyFilters();
    }

    /**
     * Add a shape element
     */
    public addShape(element: ShapeElement): fabric.Object {
        if (!this.canvas) throw new Error('Canvas not initialized');

        let shape: fabric.Object;

        switch (element.shapeType) {
            case 'rectangle':
                shape = new fabric.Rect({
                    width: element.transform.width,
                    height: element.transform.height,
                    rx: element.style.cornerRadius,
                    ry: element.style.cornerRadius,
                });
                break;

            case 'circle':
                shape = new fabric.Circle({
                    radius: Math.min(element.transform.width, element.transform.height) / 2,
                });
                break;

            case 'triangle':
                shape = new fabric.Triangle({
                    width: element.transform.width,
                    height: element.transform.height,
                });
                break;

            case 'polygon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(element.points || 6, 50),
                    {}
                );
                break;

            case 'line':
                shape = new fabric.Line([0, 0, element.transform.width, 0], {
                    strokeWidth: element.style.strokeWidth || 2,
                });
                break;

            case 'star':
                shape = new fabric.Polygon(
                    this.generateStarPoints(element.points || 5, 50, element.innerRadius || 25),
                    {}
                );
                break;

            default:
                shape = new fabric.Rect({
                    width: element.transform.width,
                    height: element.transform.height,
                });
        }

        shape.set({
            left: element.transform.x,
            top: element.transform.y,
            fill: element.style.fill as string,
            stroke: element.style.stroke ?? undefined,
            strokeWidth: element.style.strokeWidth,
            opacity: element.style.opacity,
            angle: element.transform.rotation,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
            originX: element.transform.originX,
            originY: element.transform.originY,
            selectable: element.selectable,
            lockMovementX: element.locked,
            lockMovementY: element.locked,
            visible: element.visible,
            data: { id: element.id, type: 'shape' },
        });

        // Apply shadow if present
        if (element.style.shadow) {
            shape.shadow = new fabric.Shadow({
                color: element.style.shadow.color,
                blur: element.style.shadow.blur,
                offsetX: element.style.shadow.offsetX,
                offsetY: element.style.shadow.offsetY,
            });
        }

        this.canvas.add(shape);
        this.objectIdMap.set(element.id, shape);

        return shape;
    }

    /**
     * Generate polygon points
     */
    private generatePolygonPoints(sides: number, radius: number): fabric.Point[] {
        const points: fabric.Point[] = [];
        const angle = (2 * Math.PI) / sides;

        for (let i = 0; i < sides; i++) {
            const x = radius * Math.cos(i * angle - Math.PI / 2);
            const y = radius * Math.sin(i * angle - Math.PI / 2);
            points.push(new fabric.Point(x + radius, y + radius));
        }

        return points;
    }

    /**
     * Generate star points
     */
    private generateStarPoints(points: number, outerRadius: number, innerRadius: number): fabric.Point[] {
        const starPoints: fabric.Point[] = [];
        const angle = Math.PI / points;

        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = radius * Math.cos(i * angle - Math.PI / 2);
            const y = radius * Math.sin(i * angle - Math.PI / 2);
            starPoints.push(new fabric.Point(x + outerRadius, y + outerRadius));
        }

        return starPoints;
    }

    /**
     * Get object by ID
     */
    public getObjectById(id: string): fabric.Object | undefined {
        return this.objectIdMap.get(id);
    }

    /**
     * Remove object by ID
     */
    public removeObject(id: string): boolean {
        const obj = this.objectIdMap.get(id);
        if (obj && this.canvas) {
            this.canvas.remove(obj);
            this.objectIdMap.delete(id);
            return true;
        }
        return false;
    }

    /**
     * Select objects by IDs
     */
    public selectObjects(ids: string[]): void {
        if (!this.canvas) return;

        const objects = ids
            .map(id => this.objectIdMap.get(id))
            .filter((obj): obj is fabric.Object => obj !== undefined);

        if (objects.length === 0) {
            this.canvas.discardActiveObject();
        } else if (objects.length === 1) {
            this.canvas.setActiveObject(objects[0]);
        } else {
            const selection = new fabric.ActiveSelection(objects, { canvas: this.canvas });
            this.canvas.setActiveObject(selection);
        }

        this.canvas.renderAll();
    }

    /**
     * Clear all objects
     */
    public clear(): void {
        if (!this.canvas) return;
        this.canvas.clear();
        this.objectIdMap.clear();
    }

    /**
     * Render the canvas
     */
    public render(): void {
        if (!this.canvas) return;
        this.canvas.renderAll();
    }

    /**
     * Export canvas to data URL
     */
    public toDataURL(options?: fabric.IDataURLOptions): string {
        if (!this.canvas) return '';
        return this.canvas.toDataURL(options);
    }

    /**
     * Export canvas to SVG
     */
    public toSVG(): string {
        if (!this.canvas) return '';
        return this.canvas.toSVG();
    }

    /**
     * Load page elements onto canvas
     */
    public async loadPage(page: Page): Promise<void> {
        this.clear();

        if (!this.canvas) return;

        // Set dimensions
        this.resize(page.width, page.height);

        // Set background
        this.setBackground(page.background);

        // Sort elements by zIndex
        const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

        // Add elements
        for (const element of sortedElements) {
            await this.addElement(element);
        }

        this.render();
    }

    /**
     * Add an element based on its type
     */
    public async addElement(element: CanvasElement): Promise<fabric.Object | null> {
        switch (element.type) {
            case 'text':
                return this.addText(element as TextElement);
            case 'image':
                return await this.addImage(element as ImageElement);
            case 'shape':
                return this.addShape(element as ShapeElement);
            // TODO: Add more element types
            default:
                console.warn(`Unknown element type: ${element.type}`);
                return null;
        }
    }

    /**
     * Get canvas JSON representation
     */
    public toJSON(): object {
        if (!this.canvas) return {};
        return this.canvas.toJSON(['data']);
    }

    /**
     * Set zoom level
     */
    public setZoom(zoom: number): void {
        if (!this.canvas) return;
        this.canvas.setZoom(zoom / 100);
        this.canvas.renderAll();
    }

    /**
     * Pan canvas
     */
    public pan(deltaX: number, deltaY: number): void {
        if (!this.canvas) return;
        const vpt = this.canvas.viewportTransform;
        if (vpt) {
            vpt[4] += deltaX;
            vpt[5] += deltaY;
            this.canvas.setViewportTransform(vpt);
        }
    }

    /**
     * Reset viewport
     */
    public resetViewport(): void {
        if (!this.canvas) return;
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.renderAll();
    }
}

// Singleton instance
let fabricCanvasInstance: FabricCanvas | null = null;

export const getFabricCanvas = (): FabricCanvas => {
    if (!fabricCanvasInstance) {
        fabricCanvasInstance = new FabricCanvas();
    }
    return fabricCanvasInstance;
};

export const resetFabricCanvas = (): void => {
    if (fabricCanvasInstance) {
        fabricCanvasInstance.dispose();
        fabricCanvasInstance = null;
    }
};

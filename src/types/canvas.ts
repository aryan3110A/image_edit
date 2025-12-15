// Canvas Element Type Definitions
// Core types for all canvas elements in the design editor

export type ElementType = 'text' | 'image' | 'shape' | 'svg' | 'group' | 'chart' | 'video';

export type ShapeType =
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'polygon'
    | 'line'
    | 'arrow'
    | 'star';

// Transform properties for positioning and scaling
export interface Transform {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    rotation: number; // degrees
    skewX: number;
    skewY: number;
    originX: 'left' | 'center' | 'right';
    originY: 'top' | 'center' | 'bottom';
}

// Style properties for visual appearance
export interface Style {
    fill: string | GradientFill | null;
    stroke: string | null;
    strokeWidth: number;
    opacity: number;
    shadow: Shadow | null;
    cornerRadius: number;
}

export interface Shadow {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
}

export interface GradientFill {
    type: 'linear' | 'radial';
    colorStops: Array<{ offset: number; color: string }>;
    angle?: number; // for linear gradients
    r1?: number; // for radial gradients
    r2?: number;
}

// Base element interface - all elements extend this
export interface BaseElement {
    id: string;
    type: ElementType;
    name: string;
    transform: Transform;
    style: Style;
    locked: boolean;
    visible: boolean;
    selectable: boolean;
    zIndex: number;
    metadata?: Record<string, unknown>;
}

// Text element specific properties
export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: number | 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface TextEffect {
    type: 'none' | 'shadow' | 'outline' | 'glow' | 'neon' | 'lift';
    color?: string;
    blur?: number;
    offset?: number;
}

export interface TextElement extends BaseElement {
    type: 'text';
    content: string;
    textStyle: TextStyle;
    effect: TextEffect;
    editable: boolean;
}

// Image element specific properties
export interface ImageFilter {
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    saturation: number; // -100 to 100
    blur: number; // 0 to 100
    temperature: number; // -100 to 100
    tint: number; // -100 to 100
    grayscale: boolean;
    sepia: boolean;
    invert: boolean;
}

export interface CropData {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageElement extends BaseElement {
    type: 'image';
    src: string;
    originalSrc: string;
    filters: ImageFilter;
    crop: CropData | null;
    crossOrigin: 'anonymous' | 'use-credentials' | null;
}

// Shape element specific properties
export interface ShapeElement extends BaseElement {
    type: 'shape';
    shapeType: ShapeType;
    points?: number; // for polygons and stars
    innerRadius?: number; // for stars
}

// SVG element specific properties
export interface SVGElement extends BaseElement {
    type: 'svg';
    svgContent: string;
    originalColors: string[];
    currentColors: string[];
}

// Group element for grouping multiple elements
export interface GroupElement extends BaseElement {
    type: 'group';
    children: CanvasElement[];
}

// Chart element placeholder
export interface ChartElement extends BaseElement {
    type: 'chart';
    chartType: 'bar' | 'line' | 'pie' | 'doughnut';
    data: unknown; // Chart.js data structure
    options: unknown; // Chart.js options
}

// Union type for all canvas elements
export type CanvasElement =
    | TextElement
    | ImageElement
    | ShapeElement
    | SVGElement
    | GroupElement
    | ChartElement;

// Default values factory
export const createDefaultTransform = (): Transform => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    originX: 'center',
    originY: 'center',
});

export const createDefaultStyle = (): Style => ({
    fill: '#000000',
    stroke: null,
    strokeWidth: 0,
    opacity: 1,
    shadow: null,
    cornerRadius: 0,
});

export const createDefaultTextStyle = (): TextStyle => ({
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.4,
    letterSpacing: 0,
    textTransform: 'none',
});

export const createDefaultImageFilter = (): ImageFilter => ({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    temperature: 0,
    tint: 0,
    grayscale: false,
    sepia: false,
    invert: false,
});

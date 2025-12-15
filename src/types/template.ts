// Template Type Definitions
// For JSON-based editable templates

import { Page } from './project';

export type TemplateCategory =
    | 'social-media'
    | 'business'
    | 'marketing'
    | 'event'
    | 'education'
    | 'personal'
    | 'festival'
    | 'seasonal';

export type TemplateSubcategory =
    | 'instagram'
    | 'facebook'
    | 'youtube'
    | 'twitter'
    | 'presentation'
    | 'resume'
    | 'business-card'
    | 'flyer'
    | 'poster'
    | 'invitation'
    | 'birthday'
    | 'wedding'
    | 'holiday';

// Template metadata
export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    subcategory?: TemplateSubcategory;
    tags: string[];
    thumbnail: string;
    isPremium: boolean;
    author?: string;
    createdAt: number;
    downloads?: number;
    likes?: number;
}

// Color palette for template customization
export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string; // Additional colors
}

// Font pairing for template customization
export interface FontPairing {
    heading: string;
    subheading: string;
    body: string;
}

// Template customization options
export interface TemplateCustomization {
    colorPalettes: ColorPalette[];
    fontPairings: FontPairing[];
    replacableImages: string[]; // Element IDs that can be replaced
    editableText: string[]; // Element IDs that can be edited
}

// Complete template structure
export interface Template {
    info: TemplateInfo;
    pages: Page[];
    customization: TemplateCustomization;
    defaultPalette: number; // Index of default color palette
    defaultFontPairing: number; // Index of default font pairing
}

// Template library item (for listing)
export interface TemplateLibraryItem {
    info: TemplateInfo;
    previewUrl: string;
}

// Text preset for quick text insertion
export interface TextPreset {
    id: string;
    name: string;
    category: 'heading' | 'subheading' | 'body' | 'quote' | 'list';
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number | 'normal' | 'bold';
    color: string;
    textAlign: 'left' | 'center' | 'right';
    letterSpacing: number;
    lineHeight: number;
}

// Shape preset
export interface ShapePreset {
    id: string;
    name: string;
    category: 'basic' | 'arrows' | 'frames' | 'decorative';
    svgPath?: string;
    shapeType?: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
}

// Default text presets
export const DEFAULT_TEXT_PRESETS: TextPreset[] = [
    {
        id: 'heading-1',
        name: 'Heading 1',
        category: 'heading',
        content: 'Add a heading',
        fontFamily: 'Inter',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'left',
        letterSpacing: -0.5,
        lineHeight: 1.2,
    },
    {
        id: 'heading-2',
        name: 'Heading 2',
        category: 'heading',
        content: 'Add a subheading',
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 600,
        color: '#1a1a1a',
        textAlign: 'left',
        letterSpacing: 0,
        lineHeight: 1.3,
    },
    {
        id: 'body-text',
        name: 'Body Text',
        category: 'body',
        content: 'Add body text here. Click to edit.',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#4a4a4a',
        textAlign: 'left',
        letterSpacing: 0,
        lineHeight: 1.6,
    },
    {
        id: 'quote',
        name: 'Quote',
        category: 'quote',
        content: '"Add an inspiring quote here"',
        fontFamily: 'Georgia',
        fontSize: 24,
        fontWeight: 'normal',
        color: '#2a2a2a',
        textAlign: 'center',
        letterSpacing: 0.5,
        lineHeight: 1.5,
    },
];

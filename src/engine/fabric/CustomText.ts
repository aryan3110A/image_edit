// Custom Text
// Extended Fabric.js text object with rich formatting support

import { fabric } from 'fabric';
import { TextEffect, TextStyle } from '@/types/canvas';

export interface CustomTextOptions extends fabric.ITextOptions {
    customId?: string;
    effect?: TextEffect;
    textStyle?: Partial<TextStyle>;
}

/**
 * Extended IText class with additional features
 */
export class CustomText extends fabric.IText {
    public customId?: string;
    public effect?: TextEffect;
    public customTextStyle?: Partial<TextStyle>;

    constructor(text: string, options?: CustomTextOptions) {
        super(text, options);

        this.customId = options?.customId;
        this.effect = options?.effect;
        this.customTextStyle = options?.textStyle;

        if (this.effect) {
            this.applyEffect(this.effect);
        }
    }

    /**
     * Apply text effect
     */
    public applyEffect(effect: TextEffect): void {
        this.effect = effect;

        switch (effect.type) {
            case 'shadow':
                this.shadow = new fabric.Shadow({
                    color: effect.color || 'rgba(0,0,0,0.5)',
                    blur: effect.blur || 10,
                    offsetX: effect.offset || 5,
                    offsetY: effect.offset || 5,
                });
                break;

            case 'outline':
                this.stroke = effect.color || '#000000';
                this.strokeWidth = effect.blur || 2;
                break;

            case 'glow':
                this.shadow = new fabric.Shadow({
                    color: effect.color || '#ffff00',
                    blur: effect.blur || 20,
                    offsetX: 0,
                    offsetY: 0,
                });
                break;

            case 'neon':
                this.shadow = new fabric.Shadow({
                    color: effect.color || '#00ff00',
                    blur: effect.blur || 30,
                    offsetX: 0,
                    offsetY: 0,
                });
                this.stroke = effect.color || '#00ff00';
                this.strokeWidth = 1;
                break;

            case 'lift':
                this.shadow = new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 15,
                    offsetX: 0,
                    offsetY: 10,
                });
                break;

            case 'none':
            default:
                this.shadow = null;
                this.stroke = null;
                this.strokeWidth = 0;
                break;
        }

        this.dirty = true;
        this.canvas?.renderAll();
    }

    /**
     * Update text style
     */
    public updateTextStyle(style: Partial<TextStyle>): void {
        if (style.fontFamily) this.fontFamily = style.fontFamily;
        if (style.fontSize) this.fontSize = style.fontSize;
        if (style.fontWeight) this.fontWeight = style.fontWeight as number | string;
        if (style.fontStyle) this.fontStyle = style.fontStyle;
        if (style.textAlign) this.textAlign = style.textAlign;
        if (style.lineHeight) this.lineHeight = style.lineHeight;
        if (style.letterSpacing !== undefined) this.charSpacing = style.letterSpacing * 100;
        if (style.textDecoration) {
            this.underline = style.textDecoration === 'underline';
            this.linethrough = style.textDecoration === 'line-through';
        }

        this.customTextStyle = { ...this.customTextStyle, ...style };
        this.dirty = true;
        this.canvas?.renderAll();
    }

    /**
     * Get current text style
     */
    public getTextStyle(): TextStyle {
        return {
            fontFamily: this.fontFamily || 'Inter',
            fontSize: this.fontSize || 24,
            fontWeight: (this.fontWeight as number | 'normal' | 'bold') || 'normal',
            fontStyle: (this.fontStyle as 'normal' | 'italic') || 'normal',
            textDecoration: this.underline ? 'underline' : this.linethrough ? 'line-through' : 'none',
            textAlign: (this.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
            lineHeight: this.lineHeight || 1.4,
            letterSpacing: (this.charSpacing || 0) / 100,
            textTransform: 'none',
        };
    }

    /**
     * Override toObject to include custom properties
     */
    public toObject(propertiesToInclude?: string[]): object {
        return {
            ...super.toObject(propertiesToInclude),
            customId: this.customId,
            effect: this.effect,
            customTextStyle: this.customTextStyle,
        };
    }

    /**
     * Static method to create from object
     */
    static fromObject(object: CustomTextOptions, callback?: (text: CustomText) => void): void {
        const text = new CustomText(object.text || '', object);
        callback?.(text);
    }
}

// Register custom class with Fabric
(fabric as unknown as Record<string, unknown>).CustomText = CustomText;

/**
 * Create gradient fill for text
 */
export const createTextGradient = (
    colors: string[],
    type: 'linear' | 'radial' = 'linear',
    angle: number = 0
): fabric.Gradient => {
    const colorStops: Record<string, string> = {};
    colors.forEach((color, index) => {
        colorStops[String(index / (colors.length - 1))] = color;
    });

    return new fabric.Gradient({
        type,
        coords: type === 'linear'
            ? {
                x1: 0,
                y1: 0,
                x2: Math.cos(angle * Math.PI / 180) * 100,
                y2: Math.sin(angle * Math.PI / 180) * 100,
            }
            : { x1: 50, y1: 50, r1: 0, x2: 50, y2: 50, r2: 50 },
        colorStops: Object.entries(colorStops).map(([offset, color]) => ({
            offset: parseFloat(offset),
            color,
        })),
    });
};

/**
 * Text preset type
 */
export interface TextPresetConfig {
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number | 'normal' | 'bold';
    color: string;
    effect?: TextEffect;
}

/**
 * Built-in text presets
 */
export const TEXT_PRESETS: TextPresetConfig[] = [
    {
        name: 'Heading Bold',
        fontFamily: 'Inter',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    {
        name: 'Subheading',
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 600,
        color: '#333333',
    },
    {
        name: 'Body',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#4a4a4a',
    },
    {
        name: 'Caption',
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
    },
    {
        name: 'Neon Glow',
        fontFamily: 'Inter',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#00ff88',
        effect: { type: 'neon', color: '#00ff88', blur: 30 },
    },
    {
        name: 'Shadow Pop',
        fontFamily: 'Inter',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        effect: { type: 'shadow', color: 'rgba(0,0,0,0.5)', blur: 15, offset: 8 },
    },
    {
        name: 'Outlined',
        fontFamily: 'Inter',
        fontSize: 36,
        fontWeight: 'bold',
        color: 'transparent',
        effect: { type: 'outline', color: '#000000', blur: 3 },
    },
];

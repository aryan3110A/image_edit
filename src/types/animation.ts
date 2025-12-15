// Animation Type Definitions
// For element-level animations and timeline-based effects

export type AnimationType =
    | 'none'
    | 'fade-in'
    | 'fade-out'
    | 'slide-in-left'
    | 'slide-in-right'
    | 'slide-in-top'
    | 'slide-in-bottom'
    | 'zoom-in'
    | 'zoom-out'
    | 'rotate-in'
    | 'rotate-out'
    | 'bounce'
    | 'pulse'
    | 'shake'
    | 'flip'
    | 'float'
    | 'typewriter'
    | 'wipe-left'
    | 'wipe-right';

export type EasingType =
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'bounce'
    | 'elastic'
    | 'back';

export type AnimationTrigger =
    | 'on-load'
    | 'on-click'
    | 'on-hover'
    | 'on-scroll'
    | 'manual';

// Animation configuration for a single animation
export interface AnimationConfig {
    type: AnimationType;
    duration: number; // in milliseconds
    delay: number; // in milliseconds
    easing: EasingType;
    trigger: AnimationTrigger;
    iterations: number; // -1 for infinite
    direction: 'normal' | 'reverse' | 'alternate';
    fillMode: 'none' | 'forwards' | 'backwards' | 'both';
}

// Element animation state
export interface ElementAnimation {
    elementId: string;
    entrance: AnimationConfig | null;
    exit: AnimationConfig | null;
    emphasis: AnimationConfig | null;
    custom?: AnimationKeyframes;
}

// Custom keyframe animation
export interface AnimationKeyframe {
    offset: number; // 0 to 1
    properties: {
        opacity?: number;
        x?: number;
        y?: number;
        scaleX?: number;
        scaleY?: number;
        rotation?: number;
        skewX?: number;
        skewY?: number;
    };
}

export interface AnimationKeyframes {
    name: string;
    keyframes: AnimationKeyframe[];
    duration: number;
    easing: EasingType;
    iterations: number;
}

// Animation timeline for page animations
export interface AnimationTimeline {
    pageId: string;
    totalDuration: number;
    animations: Array<{
        elementId: string;
        startTime: number;
        animation: AnimationConfig;
    }>;
}

// Preset animation configurations
export interface AnimationPreset {
    id: string;
    name: string;
    category: 'entrance' | 'exit' | 'emphasis' | 'motion-path';
    config: AnimationConfig;
    thumbnail?: string;
}

// Default animation configuration
export const createDefaultAnimationConfig = (): AnimationConfig => ({
    type: 'none',
    duration: 500,
    delay: 0,
    easing: 'ease-out',
    trigger: 'on-load',
    iterations: 1,
    direction: 'normal',
    fillMode: 'forwards',
});

// Animation presets
export const ANIMATION_PRESETS: AnimationPreset[] = [
    // Entrance animations
    {
        id: 'fade-in',
        name: 'Fade In',
        category: 'entrance',
        config: {
            type: 'fade-in',
            duration: 500,
            delay: 0,
            easing: 'ease-out',
            trigger: 'on-load',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
        },
    },
    {
        id: 'slide-in-left',
        name: 'Slide In Left',
        category: 'entrance',
        config: {
            type: 'slide-in-left',
            duration: 600,
            delay: 0,
            easing: 'ease-out',
            trigger: 'on-load',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
        },
    },
    {
        id: 'slide-in-right',
        name: 'Slide In Right',
        category: 'entrance',
        config: {
            type: 'slide-in-right',
            duration: 600,
            delay: 0,
            easing: 'ease-out',
            trigger: 'on-load',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
        },
    },
    {
        id: 'zoom-in',
        name: 'Zoom In',
        category: 'entrance',
        config: {
            type: 'zoom-in',
            duration: 400,
            delay: 0,
            easing: 'ease-out',
            trigger: 'on-load',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
        },
    },
    {
        id: 'bounce-in',
        name: 'Bounce In',
        category: 'entrance',
        config: {
            type: 'zoom-in',
            duration: 800,
            delay: 0,
            easing: 'bounce',
            trigger: 'on-load',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
        },
    },

    // Exit animations
    {
        id: 'fade-out',
        name: 'Fade Out',
        category: 'exit',
        config: {
            type: 'fade-out',
            duration: 500,
            delay: 0,
            easing: 'ease-in',
            trigger: 'manual',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
        },
    },
    {
        id: 'zoom-out',
        name: 'Zoom Out',
        category: 'exit',
        config: {
            type: 'zoom-out',
            duration: 400,
            delay: 0,
            easing: 'ease-in',
            trigger: 'manual',
            iterations: 1,
            direction: 'normal',
            fillMode: 'forwards',
        },
    },

    // Emphasis animations
    {
        id: 'pulse',
        name: 'Pulse',
        category: 'emphasis',
        config: {
            type: 'pulse',
            duration: 1000,
            delay: 0,
            easing: 'ease-in-out',
            trigger: 'on-load',
            iterations: -1,
            direction: 'alternate',
            fillMode: 'none',
        },
    },
    {
        id: 'bounce',
        name: 'Bounce',
        category: 'emphasis',
        config: {
            type: 'bounce',
            duration: 800,
            delay: 0,
            easing: 'bounce',
            trigger: 'on-load',
            iterations: -1,
            direction: 'normal',
            fillMode: 'none',
        },
    },
    {
        id: 'shake',
        name: 'Shake',
        category: 'emphasis',
        config: {
            type: 'shake',
            duration: 500,
            delay: 0,
            easing: 'ease-in-out',
            trigger: 'on-hover',
            iterations: 1,
            direction: 'normal',
            fillMode: 'none',
        },
    },
    {
        id: 'float',
        name: 'Float',
        category: 'emphasis',
        config: {
            type: 'float',
            duration: 3000,
            delay: 0,
            easing: 'ease-in-out',
            trigger: 'on-load',
            iterations: -1,
            direction: 'alternate',
            fillMode: 'none',
        },
    },
];

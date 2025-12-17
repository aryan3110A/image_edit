'use client';

import { useMemo, useState } from 'react';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { SolidBackground, GradientBackground } from '@/types/project';
import { Plus } from 'lucide-react';
import { ColorPickerPopup } from './ColorPickerPopup';

interface ColorsPanelProps {
    onClose: () => void;
    onBack?: () => void;
}

// Preset solid colors
const SOLID_COLORS = [
    '#FFFFFF', // White
    '#000000', // Black
    '#EF4444', // Red
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#EAB308', // Yellow
    '#A855F7', // Purple
    '#EC4899', // Pink
    '#9CA3AF', // Gray
    '#4B5563', // Dark Gray
    '#F97316', // Orange
    '#14B8A6', // Teal
];

// Preset gradients
const GRADIENTS = [
    { from: '#FF7E5F', to: '#FEB47B' }, // Sunset
    { from: '#6A11CB', to: '#2575FC' }, // Purple Blue
    { from: '#FFECD2', to: '#FCB69F' }, // Soft Peach
    { from: '#00C6FF', to: '#0072FF' }, // Cool Blue
    { from: '#F093FB', to: '#F5576C' }, // Pink
    { from: '#667EEA', to: '#764BA2' }, // Violet
    { from: '#11998E', to: '#38EF7D' }, // Green
    { from: '#FC466B', to: '#3F5EFB' }, // Pink Blue
];

export function ColorsPanel({ onClose, onBack }: ColorsPanelProps) {
    const activePage = useActivePage();
    const updatePage = useEditorStore((state) => state.updatePage);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Get current background
    const currentBgColor = useMemo(() => {
        if (activePage?.background?.type === 'solid') {
            return (activePage.background as SolidBackground).color;
        }
        return '#FFFFFF';
    }, [activePage]);

    const currentGradient = useMemo(() => {
        if (activePage?.background?.type === 'gradient') {
            return activePage.background as GradientBackground;
        }
        return null;
    }, [activePage]);

    // Handle solid color change
    const handleColorChange = (color: string) => {
        if (activePage) {
            updatePage(activePage.id, {
                background: { type: 'solid', color }
            });
        }
    };

    // Handle gradient change
    const handleGradientChange = (
        from: string,
        to: string,
        angle: number = 90,
        type: 'linear' | 'radial' = 'linear',
        radialPos: 'center' | 'top-left' = 'center',
        colorStops?: Array<{ offset: number; color: string }>
    ) => {
        if (activePage) {
            // Use provided colorStops or fall back to from/to
            const stops = colorStops && colorStops.length >= 2
                ? colorStops
                : [
                    { offset: 0, color: from },
                    { offset: 1, color: to }
                ];

            updatePage(activePage.id, {
                background: {
                    type: 'gradient',
                    gradientType: type,
                    colorStops: stops,
                    angle,
                    radialPosition: radialPos
                }
            });
        }
    };

    // Check if gradient matches
    const isGradientSelected = (from: string, to: string) => {
        if (!currentGradient) return false;
        const stops = currentGradient.colorStops;
        if (stops.length < 2) return false;
        return stops[0].color.toLowerCase() === from.toLowerCase() &&
            stops[1].color.toLowerCase() === to.toLowerCase();
    };

    return (
        <div className="w-64 h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header - matching Properties panel style */}
            <div className="p-4 pb-2">
                <h3 className="text-gray-800 text-sm font-medium">Colors</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 relative">
                {/* Color Picker Popup - Floating over content */}
                {showColorPicker && (
                    <div className="absolute inset-x-0 top-0 z-50 px-0">
                        <ColorPickerPopup
                            color={currentBgColor}
                            onChange={handleColorChange}
                            onClose={() => setShowColorPicker(false)}
                            showGradient={true}
                            gradient={currentGradient ? {
                                from: currentGradient.colorStops[0]?.color || '#FF7E5F',
                                to: currentGradient.colorStops[1]?.color || '#FEB47B',
                                angle: currentGradient.angle || 90
                            } : undefined}
                            onGradientChange={(g) => handleGradientChange(g.from, g.to, g.angle, g.type || 'linear', g.radialPosition || 'center', g.colorStops)}
                        />
                    </div>
                )}

                {/* Solid Colors Section */}
                <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Solid Colors</h4>
                    <div className="grid grid-cols-6 gap-1">
                        {/* Custom Color Picker Button */}
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`w-full aspect-square rounded-md border flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors ${showColorPicker ? 'border-violet-500 ring-1 ring-violet-200' : 'border-gray-200'
                                }`}
                        >
                            <div className="w-full h-full rounded-md p-0.5 bg-gradient-to-br from-red-400 via-green-400 to-blue-400">
                                <div className="w-full h-full bg-white rounded flex items-center justify-center">
                                    <Plus size={12} />
                                </div>
                            </div>
                        </button>


                        {/* Preset Colors */}
                        {SOLID_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorChange(color)}
                                className={`w-full aspect-square rounded-md border transition-all hover:scale-105 ${currentBgColor.toLowerCase() === color.toLowerCase() && !currentGradient
                                    ? 'border-blue-500 ring-1 ring-blue-300'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                style={{ background: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 w-full my-3" />

                {/* Gradients Section */}
                <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Gradients</h4>
                    <div className="grid grid-cols-6 gap-1">
                        {GRADIENTS.map((gradient, index) => (
                            <button
                                key={index}
                                onClick={() => handleGradientChange(gradient.from, gradient.to)}
                                className={`w-full aspect-square rounded-md border transition-all hover:scale-105 ${isGradientSelected(gradient.from, gradient.to)
                                    ? 'border-blue-500 ring-1 ring-blue-300'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                style={{
                                    background: `linear-gradient(to right, ${gradient.from}, ${gradient.to})`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


'use client';

import { useCanvasStore } from '@/store/canvasStore';
import { DEFAULT_TEXT_PRESETS } from '@/types/template';
import { Type, Heading1, Heading2, AlignLeft } from 'lucide-react';

export function TextPanel() {
    const addTextElement = useCanvasStore((state) => state.addTextElement);

    const handleAddText = (preset: typeof DEFAULT_TEXT_PRESETS[0]) => {
        addTextElement({
            content: preset.content,
            transform: {
                x: 100,
                y: 100,
                width: 300,
                height: 50,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                originX: 'center',
                originY: 'center',
            },
            textStyle: {
                fontFamily: preset.fontFamily,
                fontSize: preset.fontSize,
                fontWeight: preset.fontWeight,
                fontStyle: 'normal',
                textDecoration: 'none',
                textAlign: preset.textAlign,
                lineHeight: preset.lineHeight,
                letterSpacing: preset.letterSpacing,
                textTransform: 'none',
            },
            style: {
                fill: preset.color,
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                shadow: null,
                cornerRadius: 0,
            },
        });
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-gray-800 font-semibold text-lg">Text</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Quick Add Buttons */}
                <div className="space-y-2 mb-6">
                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[0])}
                        className="w-full py-4 bg-gradient-to-r from-violet-50 to-blue-50 border border-gray-200 hover:border-violet-400 rounded-xl text-left px-4 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                <Heading1 size={16} className="text-violet-600" />
                            </div>
                            <span className="text-gray-800 text-xl font-bold group-hover:text-violet-700 transition-colors">Add a heading</span>
                        </div>
                    </button>
                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[1])}
                        className="w-full py-3 bg-gray-50 border border-gray-200 hover:border-violet-400 rounded-xl text-left px-4 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Heading2 size={16} className="text-gray-600" />
                            </div>
                            <span className="text-gray-700 text-lg font-semibold group-hover:text-violet-700 transition-colors">Add a subheading</span>
                        </div>
                    </button>
                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[2])}
                        className="w-full py-3 bg-gray-50 border border-gray-200 hover:border-violet-400 rounded-xl text-left px-4 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <AlignLeft size={16} className="text-gray-600" />
                            </div>
                            <span className="text-gray-500 text-sm group-hover:text-violet-700 transition-colors">Add body text</span>
                        </div>
                    </button>
                </div>

                {/* Text Combinations */}
                <div className="mb-6">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Text Combinations</h3>
                    <div className="space-y-2">
                        {[
                            { name: 'Title + Subtitle', desc: 'Hero section layout' },
                            { name: 'Quote Block', desc: 'Stylish quotation' },
                            { name: 'Numbered List', desc: 'Ordered items' },
                            { name: 'Feature Block', desc: 'Icon + text combo' },
                        ].map((combo) => (
                            <button
                                key={combo.name}
                                className="w-full py-3 bg-gray-50 border border-gray-200 hover:border-violet-400 rounded-lg text-left px-4 transition-all duration-200 group"
                            >
                                <span className="text-gray-700 text-sm font-medium group-hover:text-violet-700">{combo.name}</span>
                                <span className="text-gray-400 text-xs ml-2">{combo.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Pairings */}
                <div className="mb-6">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Font Pairings</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { name: 'Modern', fonts: 'Inter + Roboto' },
                            { name: 'Classic', fonts: 'Georgia + Arial' },
                            { name: 'Playful', fonts: 'Poppins + Nunito' },
                            { name: 'Elegant', fonts: 'Playfair + Lato' },
                            { name: 'Bold', fonts: 'Montserrat + Open Sans' },
                            { name: 'Minimal', fonts: 'Helvetica + Source Sans' },
                        ].map((pairing) => (
                            <div
                                key={pairing.name}
                                className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:border-violet-400 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-2 group"
                            >
                                <span className="text-gray-700 text-sm font-semibold group-hover:text-violet-700">{pairing.name}</span>
                                <span className="text-gray-400 text-[9px] text-center mt-1">{pairing.fonts}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useCanvasStore } from '@/store/canvasStore';
import { Square, Circle, Triangle, Star, Minus, ArrowRight, Search, Hexagon, Pentagon, Octagon } from 'lucide-react';

const SHAPES = [
    { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'triangle', icon: <Triangle size={20} />, label: 'Triangle' },
    { id: 'star', icon: <Star size={20} />, label: 'Star' },
    { id: 'line', icon: <Minus size={20} />, label: 'Line' },
    { id: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' },
];

const GRAPHICS = [
    { id: 'g1', emoji: '🎉' },
    { id: 'g2', emoji: '⭐' },
    { id: 'g3', emoji: '💫' },
    { id: 'g4', emoji: '🔥' },
    { id: 'g5', emoji: '✨' },
    { id: 'g6', emoji: '🎨' },
];

export function ElementsPanel() {
    const addShapeElement = useCanvasStore((state) => state.addShapeElement);

    const handleAddShape = (shapeType: string) => {
        addShapeElement(shapeType, {
            transform: {
                x: 100,
                y: 100,
                width: 150,
                height: 150,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                originX: 'center',
                originY: 'center',
            },
        });
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-gray-800 font-semibold text-lg">Elements</h2>
                <div className="mt-3 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search elements..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Shapes */}
                <div className="mb-6">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Shapes</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {SHAPES.map((shape) => (
                            <button
                                key={shape.id}
                                onClick={() => handleAddShape(shape.id)}
                                className="aspect-square bg-gray-50 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-violet-600 group"
                            >
                                {shape.icon}
                                <span className="text-[10px] font-medium">{shape.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Graphics */}
                <div className="mb-6">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Graphics</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {GRAPHICS.map((item) => (
                            <div
                                key={item.id}
                                className="aspect-square bg-gray-50 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 cursor-pointer transition-all duration-200 flex items-center justify-center text-2xl"
                            >
                                {item.emoji}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lines & Arrows */}
                <div className="mb-6">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Lines & Arrows</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {['━', '─ ─', '→', '↔', '⤴', '↗'].map((line, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-gray-50 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 cursor-pointer transition-all duration-200 flex items-center justify-center text-gray-500 hover:text-violet-600 text-xl"
                            >
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
    X,
    FileText,
    CreditCard,
    Monitor,
    Square,
    Youtube,
    Twitter,
    Facebook,
    Smartphone,
    Instagram,
    Presentation,
    Link2,
    Link2Off,
} from 'lucide-react';

interface CanvasPreset {
    name: string;
    width: number;
    height: number;
    category: string;
    icon: React.ReactNode;
}

const CANVAS_PRESETS: CanvasPreset[] = [
    // Print
    { name: 'Standard Print Page', width: 2480, height: 3508, category: 'Print', icon: <FileText size={16} /> },
    { name: 'Medium Print Page', width: 1748, height: 2480, category: 'Print', icon: <FileText size={16} /> },
    { name: 'Small Print Page', width: 1240, height: 1748, category: 'Print', icon: <FileText size={16} /> },
    { name: 'Professional Card', width: 1004, height: 650, category: 'Print', icon: <CreditCard size={16} /> },

    // Desktop
    { name: 'Desktop Wallpaper', width: 1920, height: 1080, category: 'Desktop', icon: <Monitor size={16} /> },
    { name: 'Square Logo Board', width: 500, height: 500, category: 'Desktop', icon: <Square size={16} /> },

    // Social Media
    { name: 'YouTube', width: 1280, height: 720, category: 'Social Media', icon: <Youtube size={16} /> },
    { name: 'Twitter / X', width: 1600, height: 900, category: 'Social Media', icon: <Twitter size={16} /> },
    { name: 'Facebook', width: 940, height: 788, category: 'Social Media', icon: <Facebook size={16} /> },
    { name: 'Stories', width: 1080, height: 1920, category: 'Social Media', icon: <Smartphone size={16} /> },
    { name: 'Instagram', width: 1080, height: 1080, category: 'Social Media', icon: <Instagram size={16} /> },

    // Presentations
    { name: 'Widescreen Slides (16:9)', width: 1920, height: 1080, category: 'Presentations', icon: <Presentation size={16} /> },
    { name: 'Classic Slides (4:3)', width: 1024, height: 768, category: 'Presentations', icon: <Presentation size={16} /> },
];

// Group presets by category
const groupedPresets = CANVAS_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
        acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
}, {} as Record<string, CanvasPreset[]>);

export function ResizeModal() {
    const isOpen = useEditorStore((state) => state.isResizeModalOpen);
    const closeModal = useEditorStore((state) => state.closeResizeModal);
    const project = useEditorStore((state) => state.project);
    const updatePage = useEditorStore((state) => state.updatePage);

    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [aspectLocked, setAspectLocked] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(1920 / 1080);
    const [selectedPreset, setSelectedPreset] = useState<string | null>('Desktop Wallpaper');

    // Initialize with current page dimensions
    useEffect(() => {
        if (project && isOpen) {
            const activePage = project.pages.find(p => p.id === project.activePageId);
            if (activePage) {
                setWidth(activePage.width);
                setHeight(activePage.height);
                setAspectRatio(activePage.width / activePage.height);
            }
        }
    }, [project, isOpen]);

    const handlePresetSelect = (preset: CanvasPreset) => {
        setWidth(preset.width);
        setHeight(preset.height);
        setSelectedPreset(preset.name);
        setAspectRatio(preset.width / preset.height);
    };

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        setSelectedPreset(null);
        if (aspectLocked && newWidth > 0) {
            setHeight(Math.round(newWidth / aspectRatio));
        }
    };

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
        setSelectedPreset(null);
        if (aspectLocked && newHeight > 0) {
            setWidth(Math.round(newHeight * aspectRatio));
        }
    };

    const handleApply = () => {
        if (project && width > 0 && height > 0) {
            updatePage(project.activePageId, { width, height });
            closeModal();
        }
    };

    const toggleAspectLock = () => {
        if (!aspectLocked) {
            setAspectRatio(width / height);
        }
        setAspectLocked(!aspectLocked);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1a1d] rounded-2xl shadow-2xl w-[600px] max-h-[85vh] overflow-hidden border border-gray-700/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white">Resize Canvas</h2>
                    <button
                        onClick={closeModal}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    {/* Custom Size Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Custom Size</h3>
                        <div className="flex items-center gap-3 bg-[#252528] rounded-xl p-4">
                            {/* Width Input */}
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Width</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                        className="w-full bg-[#1a1a1d] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                                </div>
                            </div>

                            {/* Aspect Lock Button */}
                            <button
                                onClick={toggleAspectLock}
                                className={`mt-5 p-2 rounded-lg transition-colors ${aspectLocked
                                        ? 'bg-violet-500/20 text-violet-400'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                            >
                                {aspectLocked ? <Link2 size={18} /> : <Link2Off size={18} />}
                            </button>

                            {/* Height Input */}
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Height</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                        className="w-full bg-[#1a1a1d] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Presets Section */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Presets</h3>

                        {Object.entries(groupedPresets).map(([category, presets]) => (
                            <div key={category} className="mb-4">
                                <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{category}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {presets.map((preset) => {
                                        const isSelected = selectedPreset === preset.name;
                                        return (
                                            <button
                                                key={preset.name}
                                                onClick={() => handlePresetSelect(preset)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isSelected
                                                        ? 'bg-violet-500/20 border border-violet-500/50 text-white'
                                                        : 'bg-[#252528] border border-transparent hover:bg-[#2a2a2e] text-gray-300 hover:text-white'
                                                    }`}
                                            >
                                                <span className={`${isSelected ? 'text-violet-400' : 'text-gray-500'}`}>
                                                    {preset.icon}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{preset.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {preset.width} × {preset.height}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700/50 bg-[#151517]">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
                    >
                        Apply Size
                    </button>
                </div>
            </div>
        </div>
    );
}

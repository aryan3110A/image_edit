'use client';

import { useMemo, useState, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { SolidBackground } from '@/types/project';
import { ImageElement } from '@/types/canvas';
import { COLOR_PALETTE, applyColorReplacement } from '@/utils/colorReplace';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { fabric } from 'fabric';
import {
    Trash2,
    Copy,
    Clipboard,
    FlipHorizontal,
    FlipVertical,
    Lock,
    LockOpen,
    Group,
    Ungroup,
    SlidersHorizontal,
} from 'lucide-react';

export function ContextToolbar() {
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const getElement = useCanvasStore((state) => state.getElement);
    const copy = useCanvasStore((state) => state.copy);
    const paste = useCanvasStore((state) => state.paste);
    const duplicateElements = useCanvasStore((state) => state.duplicateElements);
    const removeElement = useCanvasStore((state) => state.removeElement);
    const lockElement = useCanvasStore((state) => state.lockElement);
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const groupElements = useCanvasStore((state) => state.groupElements);
    const ungroupElement = useCanvasStore((state) => state.ungroupElement);
    const updateTransform = useCanvasStore((state) => state.updateTransform);
    const updateElement = useCanvasStore((state) => state.updateElement);

    const activePage = useActivePage();
    const updatePage = useEditorStore((state) => state.updatePage);
    const openColorsPanel = useEditorStore((state) => state.openColorsPanel);
    const openFiltersPanel = useEditorStore((state) => state.openFiltersPanel);

    // Get current background color
    const currentBgColor = useMemo(() => {
        if (activePage?.background?.type === 'solid') {
            return (activePage.background as SolidBackground).color;
        }
        return '#FFFFFF';
    }, [activePage]);

    // Handle background color change
    const handleColorChange = (color: string) => {
        if (activePage) {
            updatePage(activePage.id, {
                background: { type: 'solid', color }
            });
        }
    };

    // Handle image color replacement
    const handleImageColorReplace = async (color: string) => {
        if (selectedIds.length !== 1) return;

        const element = getElement(selectedIds[0]);
        if (!element || element.type !== 'image') return;

        const imageElement = element as ImageElement;
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

        if (!fabricObj || !fabricObj.getElement) return;

        const imgElement = fabricObj.getElement() as HTMLImageElement;

        // Apply color replacement
        const colorReplaceEffect = {
            enabled: true,
            targetColor: color,
            intensity: 80,
            preserveBackground: true,
            blendMode: 'hue' as const,
        };

        try {
            const newSrc = await applyColorReplacement(imgElement, colorReplaceEffect);

            // Update the element with the new color-replaced image
            updateElement(imageElement.id, {
                src: newSrc,
                colorReplace: colorReplaceEffect,
            });

            // Update Fabric.js canvas
            fabric.Image.fromURL(newSrc, (img) => {
                const canvas = fabricCanvas.getCanvas();
                if (!canvas) return;

                // Copy properties from old object
                img.set({
                    left: fabricObj.left,
                    top: fabricObj.top,
                    scaleX: fabricObj.scaleX,
                    scaleY: fabricObj.scaleY,
                    angle: fabricObj.angle,
                    originX: fabricObj.originX,
                    originY: fabricObj.originY,
                    opacity: fabricObj.opacity,
                    data: { id: imageElement.id, type: 'image' },
                });

                canvas.remove(fabricObj);
                canvas.add(img);
                fabricCanvas.setObjectById(imageElement.id, img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
        } catch (error) {
            console.error('Color replacement failed:', error);
        }
    };

    // Derive selected elements from IDs - only recompute when selectedIds change
    const selectedElements = useMemo(() => {
        return selectedIds.map(id => getElement(id)).filter(Boolean);
    }, [selectedIds, getElement]);

    // Flip handlers
    const handleFlipHorizontal = () => {
        selectedIds.forEach(id => {
            const element = getElement(id);
            if (element) {
                updateTransform(id, {
                    scaleX: element.transform.scaleX * -1
                });
            }
        });
    };

    const handleFlipVertical = () => {
        selectedIds.forEach(id => {
            const element = getElement(id);
            if (element) {
                updateTransform(id, {
                    scaleY: element.transform.scaleY * -1
                });
            }
        });
    };

    if (selectedElements.length === 0) {
        return (
            <div className="h-12 bg-[#F8F9FA] border-b border-gray-200 flex items-center px-4 gap-4">
                {/* Current Color Indicator - Click to open Colors panel */}
                <button
                    onClick={openColorsPanel}
                    className="w-7 h-7 rounded-lg border-2 border-gray-300 shadow-sm hover:border-blue-400 hover:scale-105 transition-all cursor-pointer"
                    style={{ backgroundColor: currentBgColor }}
                    title="Open Colors panel"
                />

                {/* Hint text */}
                <span className="text-gray-400 text-xs ml-auto">
                    Select an element to edit it
                </span>
            </div>
        );
    }

    const element = selectedElements[0];
    const isLocked = element?.locked;
    const isGroup = element?.type === 'group';
    const canGroup = selectedElements.length > 1;
    const isImage = element?.type === 'image';

    return (
        <div className="h-12 bg-[#F8F9FA] border-b border-gray-200 flex items-center px-4 gap-2">
            {/* Element Info */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                <span className="text-gray-800 text-sm font-medium">
                    {selectedElements.length === 1
                        ? element?.name || 'Unnamed'
                        : `${selectedElements.length} elements selected`}
                </span>
            </div>

            {/* Color Replacement for Images */}
            {isImage && (
                <>
                    <div className="flex items-center gap-1.5 px-3">
                        {COLOR_PALETTE.slice(0, 6).map((colorItem) => (
                            <button
                                key={colorItem.color}
                                onClick={() => handleImageColorReplace(colorItem.color)}
                                className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all shadow-sm"
                                style={{ backgroundColor: colorItem.color }}
                                title={`Apply ${colorItem.name} color`}
                            />
                        ))}
                        {/* Custom Color Picker */}
                        <div className="relative">
                            <input
                                type="color"
                                onChange={(e) => handleImageColorReplace(e.target.value)}
                                className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer"
                                title="Pick custom color"
                            />
                            <div
                                className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all shadow-sm cursor-pointer"
                                style={{
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
                                }}
                                title="Pick custom color"
                            />
                        </div>
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    {/* Filter Button */}
                    <button
                        onClick={openFiltersPanel}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center gap-1.5"
                        title="Image Filters"
                    >
                        <SlidersHorizontal size={16} />
                        <span className="text-xs font-medium">Filters</span>
                    </button>
                </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={copy}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Copy"
                >
                    <Copy size={16} />
                </button>
                <button
                    onClick={paste}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Paste"
                >
                    <Clipboard size={16} />
                </button>
                <button
                    onClick={() => duplicateElements()}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Duplicate"
                >
                    <Copy size={16} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Transform */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleFlipHorizontal}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Flip Horizontal"
                >
                    <FlipHorizontal size={16} />
                </button>
                <button
                    onClick={handleFlipVertical}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Flip Vertical"
                >
                    <FlipVertical size={16} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Grouping */}
            <div className="flex items-center gap-1">
                {canGroup && (
                    <button
                        onClick={() => groupElements(selectedIds)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Group"
                    >
                        <Group size={16} />
                    </button>
                )}
                {isGroup && (
                    <button
                        onClick={() => ungroupElement(selectedIds[0])}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Ungroup"
                    >
                        <Ungroup size={16} />
                    </button>
                )}
            </div>

            {/* Lock */}
            <button
                onClick={() => isLocked ? unlockElement(selectedIds[0]) : lockElement(selectedIds[0])}
                className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                title={isLocked ? 'Unlock' : 'Lock'}
            >
                {isLocked ? <LockOpen size={16} /> : <Lock size={16} />}
            </button>

            {/* Delete */}
            <button
                onClick={() => removeElement(selectedIds)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-all ml-auto"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { SolidBackground } from '@/types/project';
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

    const activePage = useActivePage();
    const updatePage = useEditorStore((state) => state.updatePage);
    const openColorsPanel = useEditorStore((state) => state.openColorsPanel);

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

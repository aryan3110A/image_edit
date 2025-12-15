'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import {
    Trash2,
    Copy,
    Clipboard,
    FlipHorizontal,
    FlipVertical,
    ArrowUp,
    ArrowDown,
    Lock,
    Unlock,
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
    const bringToFront = useCanvasStore((state) => state.bringToFront);
    const sendToBack = useCanvasStore((state) => state.sendToBack);
    const lockElement = useCanvasStore((state) => state.lockElement);
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const groupElements = useCanvasStore((state) => state.groupElements);
    const ungroupElement = useCanvasStore((state) => state.ungroupElement);

    // Derive selected elements from IDs - only recompute when selectedIds change
    const selectedElements = useMemo(() => {
        return selectedIds.map(id => getElement(id)).filter(Boolean);
    }, [selectedIds, getElement]);

    if (selectedElements.length === 0) {
        return (
            <div className="h-12 bg-[#F8F9FA] border-b border-gray-200 flex items-center px-4">
                <span className="text-gray-400 text-sm">
                    Click on an element to select it, or add elements from the sidebar
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
                <span className="text-gray-500 text-xs">
                    {element?.type || ''}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={copy}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Copy"
                >
                    <Copy size={16} />
                </button>
                <button
                    onClick={paste}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Paste"
                >
                    <Clipboard size={16} />
                </button>
                <button
                    onClick={() => duplicateElements()}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Duplicate"
                >
                    <Copy size={16} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Transform */}
            <div className="flex items-center gap-1">
                <button
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Flip Horizontal"
                >
                    <FlipHorizontal size={16} />
                </button>
                <button
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Flip Vertical"
                >
                    <FlipVertical size={16} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Layer Order */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => bringToFront(selectedIds[0])}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Bring to Front"
                >
                    <ArrowUp size={16} />
                </button>
                <button
                    onClick={() => sendToBack(selectedIds[0])}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Send to Back"
                >
                    <ArrowDown size={16} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Grouping */}
            <div className="flex items-center gap-1">
                {canGroup && (
                    <button
                        onClick={() => groupElements(selectedIds)}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Group"
                    >
                        <Group size={16} />
                    </button>
                )}
                {isGroup && (
                    <button
                        onClick={() => ungroupElement(selectedIds[0])}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Ungroup"
                    >
                        <Ungroup size={16} />
                    </button>
                )}
            </div>

            {/* Lock */}
            <button
                onClick={() => isLocked ? unlockElement(selectedIds[0]) : lockElement(selectedIds[0])}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title={isLocked ? 'Unlock' : 'Lock'}
            >
                {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
            </button>

            {/* Delete */}
            <button
                onClick={() => removeElement(selectedIds)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded ml-auto"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

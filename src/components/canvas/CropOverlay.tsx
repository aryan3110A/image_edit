'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useActivePage } from '@/store/editorStore';

interface CropOverlayProps {
    zoom: number;
    containerOffset: { x: number; y: number };
}

export function CropOverlay({ zoom, containerOffset }: CropOverlayProps) {
    const cropMode = useCanvasStore((state) => state.cropMode);
    const cropBounds = useCanvasStore((state) => state.cropBounds);
    const cropElementId = useCanvasStore((state) => state.cropElementId);
    const setCropBounds = useCanvasStore((state) => state.setCropBounds);
    const applyCrop = useCanvasStore((state) => state.applyCrop);
    const cancelCrop = useCanvasStore((state) => state.cancelCrop);
    const getElement = useCanvasStore((state) => state.getElement);
    const activePage = useActivePage();

    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<string | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startBounds, setStartBounds] = useState<typeof cropBounds>(null);

    const scale = zoom / 100;

    // Get the element being cropped
    const element = cropElementId ? getElement(cropElementId) : null;

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!cropMode) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                applyCrop();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelCrop();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cropMode, applyCrop, cancelCrop]);

    // Handle resize/drag start
    const handleMouseDown = useCallback((e: React.MouseEvent, type: string) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);
        setDragType(type);
        setStartPos({ x: e.clientX, y: e.clientY });
        setStartBounds(cropBounds);
    }, [cropBounds]);

    // Handle mouse move
    useEffect(() => {
        if (!isDragging || !startBounds || !dragType) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = (e.clientX - startPos.x) / scale;
            const deltaY = (e.clientY - startPos.y) / scale;

            let newBounds = { ...startBounds };

            switch (dragType) {
                case 'nw':
                    newBounds.x = startBounds.x + deltaX;
                    newBounds.y = startBounds.y + deltaY;
                    newBounds.width = startBounds.width - deltaX;
                    newBounds.height = startBounds.height - deltaY;
                    break;
                case 'ne':
                    newBounds.y = startBounds.y + deltaY;
                    newBounds.width = startBounds.width + deltaX;
                    newBounds.height = startBounds.height - deltaY;
                    break;
                case 'sw':
                    newBounds.x = startBounds.x + deltaX;
                    newBounds.width = startBounds.width - deltaX;
                    newBounds.height = startBounds.height + deltaY;
                    break;
                case 'se':
                    newBounds.width = startBounds.width + deltaX;
                    newBounds.height = startBounds.height + deltaY;
                    break;
                case 'n':
                    newBounds.y = startBounds.y + deltaY;
                    newBounds.height = startBounds.height - deltaY;
                    break;
                case 's':
                    newBounds.height = startBounds.height + deltaY;
                    break;
                case 'w':
                    newBounds.x = startBounds.x + deltaX;
                    newBounds.width = startBounds.width - deltaX;
                    break;
                case 'e':
                    newBounds.width = startBounds.width + deltaX;
                    break;
            }

            // Minimum size constraints
            if (newBounds.width < 20) {
                newBounds.width = 20;
                if (dragType.includes('w')) newBounds.x = startBounds.x + startBounds.width - 20;
            }
            if (newBounds.height < 20) {
                newBounds.height = 20;
                if (dragType.includes('n')) newBounds.y = startBounds.y + startBounds.height - 20;
            }

            setCropBounds(newBounds);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDragType(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startPos, startBounds, dragType, scale, setCropBounds]);

    if (!cropMode || !cropBounds || !element) return null;

    const canvasWidth = activePage?.width || 1080;
    const canvasHeight = activePage?.height || 1080;

    // Calculate positions in screen coordinates
    const boxLeft = cropBounds.x * scale;
    const boxTop = cropBounds.y * scale;
    const boxWidth = cropBounds.width * scale;
    const boxHeight = cropBounds.height * scale;

    return (
        <div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
                width: canvasWidth * scale,
                height: canvasHeight * scale,
            }}
        >
            {/* Dark overlay - top */}
            <div
                className="absolute bg-black/50 pointer-events-auto"
                style={{
                    left: 0,
                    top: 0,
                    width: canvasWidth * scale,
                    height: boxTop,
                }}
            />

            {/* Dark overlay - left */}
            <div
                className="absolute bg-black/50 pointer-events-auto"
                style={{
                    left: 0,
                    top: boxTop,
                    width: boxLeft,
                    height: boxHeight,
                }}
            />

            {/* Dark overlay - right */}
            <div
                className="absolute bg-black/50 pointer-events-auto"
                style={{
                    left: boxLeft + boxWidth,
                    top: boxTop,
                    width: canvasWidth * scale - boxLeft - boxWidth,
                    height: boxHeight,
                }}
            />

            {/* Dark overlay - bottom */}
            <div
                className="absolute bg-black/50 pointer-events-auto"
                style={{
                    left: 0,
                    top: boxTop + boxHeight,
                    width: canvasWidth * scale,
                    height: canvasHeight * scale - boxTop - boxHeight,
                }}
            />

            {/* Crop box border */}
            <div
                className="absolute border-2 border-blue-500 pointer-events-none"
                style={{
                    left: boxLeft,
                    top: boxTop,
                    width: boxWidth,
                    height: boxHeight,
                }}
            >
                {/* Rule of thirds grid */}
                <div className="absolute inset-0">
                    {/* Vertical lines */}
                    <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/40" />
                    <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/40" />
                    {/* Horizontal lines */}
                    <div className="absolute left-0 right-0 top-1/3 h-px bg-white/40" />
                    <div className="absolute left-0 right-0 top-2/3 h-px bg-white/40" />
                </div>
            </div>

            {/* Resize handles */}
            {/* Corners */}
            <div
                className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize pointer-events-auto"
                style={{ left: boxLeft - 6, top: boxTop - 6 }}
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
            />
            <div
                className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize pointer-events-auto"
                style={{ left: boxLeft + boxWidth - 6, top: boxTop - 6 }}
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
            />
            <div
                className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize pointer-events-auto"
                style={{ left: boxLeft - 6, top: boxTop + boxHeight - 6 }}
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
            />
            <div
                className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize pointer-events-auto"
                style={{ left: boxLeft + boxWidth - 6, top: boxTop + boxHeight - 6 }}
                onMouseDown={(e) => handleMouseDown(e, 'se')}
            />

            {/* Edge handles */}
            <div
                className="absolute w-6 h-2 bg-white border border-blue-500 rounded cursor-n-resize pointer-events-auto"
                style={{ left: boxLeft + boxWidth / 2 - 12, top: boxTop - 4 }}
                onMouseDown={(e) => handleMouseDown(e, 'n')}
            />
            <div
                className="absolute w-6 h-2 bg-white border border-blue-500 rounded cursor-s-resize pointer-events-auto"
                style={{ left: boxLeft + boxWidth / 2 - 12, top: boxTop + boxHeight - 4 }}
                onMouseDown={(e) => handleMouseDown(e, 's')}
            />
            <div
                className="absolute w-2 h-6 bg-white border border-blue-500 rounded cursor-w-resize pointer-events-auto"
                style={{ left: boxLeft - 4, top: boxTop + boxHeight / 2 - 12 }}
                onMouseDown={(e) => handleMouseDown(e, 'w')}
            />
            <div
                className="absolute w-2 h-6 bg-white border border-blue-500 rounded cursor-e-resize pointer-events-auto"
                style={{ left: boxLeft + boxWidth - 4, top: boxTop + boxHeight / 2 - 12 }}
                onMouseDown={(e) => handleMouseDown(e, 'e')}
            />

            {/* Instructions */}
            <div
                className="absolute px-3 py-1.5 bg-black/80 text-white text-xs rounded-md pointer-events-none"
                style={{
                    left: boxLeft + boxWidth / 2,
                    top: boxTop + boxHeight + 12,
                    transform: 'translateX(-50%)',
                }}
            >
                Press <span className="font-bold">Enter</span> to apply, <span className="font-bold">Esc</span> to cancel
            </div>
        </div>
    );
}

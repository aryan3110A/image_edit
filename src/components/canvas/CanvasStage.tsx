'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getFabricCanvas, resetFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { useCanvasStore } from '@/store/canvasStore';

interface CanvasStageProps {
    className?: string;
}

export function CanvasStage({ className }: CanvasStageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const activePage = useActivePage();
    const zoom = useEditorStore((state) => state.zoom);
    const setZoom = useEditorStore((state) => state.setZoom);
    const fitTrigger = useEditorStore((state) => state.fitTrigger);
    const select = useCanvasStore((state) => state.select);
    const deselect = useCanvasStore((state) => state.deselect);

    // Calculate the scale to fit canvas within container
    const calculateFitZoom = useCallback((canvasWidth: number, canvasHeight: number) => {
        if (!containerRef.current) return 100;

        const containerRect = containerRef.current.getBoundingClientRect();
        const padding = 40; // Padding around the canvas

        const availableWidth = containerRect.width - padding * 2;
        const availableHeight = containerRect.height - padding * 2;

        if (availableWidth <= 0 || availableHeight <= 0) return 100;

        const scaleX = availableWidth / canvasWidth;
        const scaleY = availableHeight / canvasHeight;

        // Use the smaller scale to ensure canvas fits both dimensions
        const scale = Math.min(scaleX, scaleY);

        // Convert to percentage and clamp between 5% and 200%
        return Math.max(5, Math.min(200, Math.round(scale * 100)));
    }, []);

    // Update container size tracking
    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };

        updateContainerSize();

        const resizeObserver = new ResizeObserver(updateContainerSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    // Auto-fit zoom when page dimensions change or Fit button is clicked
    useEffect(() => {
        if (!activePage || containerSize.width === 0) return;

        const fitZoom = calculateFitZoom(activePage.width, activePage.height);
        setZoom(fitZoom, true); // Pass true to indicate this is a "fit" zoom
    }, [activePage?.width, activePage?.height, containerSize, fitTrigger, calculateFitZoom, setZoom]);

    // Initialize Fabric.js canvas
    useEffect(() => {
        if (!canvasRef.current || isInitialized) return;

        const fabricCanvas = getFabricCanvas();

        fabricCanvas.init(canvasRef.current, {
            width: activePage?.width || 1080,
            height: activePage?.height || 1080,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
        });

        // Set up event handlers
        fabricCanvas.onSelectionChange = (selectedIds) => {
            if (selectedIds.length === 0) {
                deselect();
            } else {
                select(selectedIds);
            }
        };

        setIsInitialized(true);

        return () => {
            resetFabricCanvas();
            setIsInitialized(false);
        };
    }, []);

    // Load page when it changes
    useEffect(() => {
        if (!isInitialized || !activePage) return;

        const fabricCanvas = getFabricCanvas();
        fabricCanvas.loadPage(activePage);
    }, [activePage, isInitialized]);

    // Update zoom
    useEffect(() => {
        if (!isInitialized) return;

        const fabricCanvas = getFabricCanvas();
        fabricCanvas.setZoom(zoom);
    }, [zoom, isInitialized]);

    // Calculate displayed canvas dimensions
    const displayScale = zoom / 100;
    const canvasWidth = activePage?.width || 1080;
    const canvasHeight = activePage?.height || 1080;
    const displayWidth = canvasWidth * displayScale;
    const displayHeight = canvasHeight * displayScale;

    return (
        <div
            ref={containerRef}
            className={`relative bg-[#F0F1F5] overflow-hidden ${className}`}
        >
            {/* Centered canvas wrapper */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    padding: '20px',
                }}
            >
                <div
                    className="shadow-2xl flex-shrink-0"
                    style={{
                        width: displayWidth,
                        height: displayHeight,
                        maxWidth: '100%',
                        maxHeight: '100%',
                    }}
                >
                    <div
                        style={{
                            width: canvasWidth,
                            height: canvasHeight,
                            transform: `scale(${displayScale})`,
                            transformOrigin: 'top left',
                        }}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

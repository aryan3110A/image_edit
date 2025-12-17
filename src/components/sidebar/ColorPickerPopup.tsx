'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Pipette } from 'lucide-react';

interface ColorPickerPopupProps {
    color: string;
    onChange: (color: string) => void;
    onClose: () => void;
    showGradient?: boolean;
    gradient?: { from: string; to: string; angle: number };
    onGradientChange?: (gradient: {
        from: string;
        to: string;
        angle: number;
        type?: 'linear' | 'radial';
        radialPosition?: 'center' | 'top-left';
        colorStops?: Array<{ offset: number; color: string }>;
    }) => void;
}

// Convert hex to HSV
function hexToHsv(hex: string): { h: number; s: number; v: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (d !== 0) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
}

// Convert HSV to hex
function hsvToHex(h: number, s: number, v: number): string {
    h = h / 360;
    s = s / 100;
    v = v / 100;

    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Get hue color for background
function getHueColor(h: number): string {
    return hsvToHex(h, 100, 100);
}

export function ColorPickerPopup({
    color,
    onChange,
    onClose,
    showGradient = true,
    gradient,
    onGradientChange,
}: ColorPickerPopupProps) {
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
    const [hsv, setHsv] = useState(() => hexToHsv(color || '#FF0000'));
    const [hexInput, setHexInput] = useState(color || '#FFFFFF');
    const [isDraggingSaturation, setIsDraggingSaturation] = useState(false);
    const [isDraggingHue, setIsDraggingHue] = useState(false);

    // Gradient state - supports multiple color stops
    interface ColorStop { id: string; offset: number; color: string; }
    const [colorStops, setColorStops] = useState<ColorStop[]>(() => {
        const from = gradient?.from || '#FF7E5F';
        const to = gradient?.to || '#FEB47B';
        return [
            { id: 'stop-0', offset: 0, color: from },
            { id: 'stop-1', offset: 1, color: to }
        ];
    });
    const [selectedStopId, setSelectedStopId] = useState<string>('stop-0');
    const [gradientAngle, setGradientAngle] = useState(gradient?.angle || 90);
    const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
    const [radialPosition, setRadialPosition] = useState<'center' | 'top-left'>('center');
    const [gradientHsv, setGradientHsv] = useState(() => hexToHsv(gradient?.from || '#FF7E5F'));
    const [isDraggingGradientSat, setIsDraggingGradientSat] = useState(false);
    const [isDraggingGradientHue, setIsDraggingGradientHue] = useState(false);
    const [isDraggingStop, setIsDraggingStop] = useState(false);
    const gradientSatRef = useRef<HTMLDivElement>(null);
    const gradientHueRef = useRef<HTMLDivElement>(null);
    const gradientBarRef = useRef<HTMLDivElement>(null);

    // Get selected stop
    const selectedStop = colorStops.find(s => s.id === selectedStopId) || colorStops[0];

    // Get gradient CSS from color stops
    const getGradientBarCss = () => {
        const stops = [...colorStops].sort((a, b) => a.offset - b.offset);
        return stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ');
    };

    // Backward compatibility - get from/to for external callback
    const gradientFrom = colorStops.find(s => s.offset === 0)?.color || colorStops[0]?.color || '#FF7E5F';
    const gradientTo = colorStops.find(s => s.offset === 1)?.color || colorStops[colorStops.length - 1]?.color || '#FEB47B';


    const saturationRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    const isUserInteracting = useRef(false);

    // Update hex input and call onChange only when user is interacting
    useEffect(() => {
        const newColor = hsvToHex(hsv.h, hsv.s, hsv.v);
        setHexInput(newColor);
        if (activeTab === 'solid' && isUserInteracting.current) {
            onChange(newColor);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hsv, activeTab]);

    // Handle saturation/value picker
    const handleSaturationChange = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!saturationRef.current) return;
        isUserInteracting.current = true;
        const rect = saturationRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        setHsv(prev => ({ ...prev, s: x * 100, v: (1 - y) * 100 }));
    }, []);

    // Handle hue slider
    const handleHueChange = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!hueRef.current) return;
        isUserInteracting.current = true;
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setHsv(prev => ({ ...prev, h: x * 360 }));
    }, []);

    // Mouse move handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingSaturation) handleSaturationChange(e);
            if (isDraggingHue) handleHueChange(e);
        };
        const handleMouseUp = () => {
            setIsDraggingSaturation(false);
            setIsDraggingHue(false);
        };

        if (isDraggingSaturation || isDraggingHue) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingSaturation, isDraggingHue, handleSaturationChange, handleHueChange]);

    // Handle hex input change
    const handleHexInputChange = (value: string) => {
        isUserInteracting.current = true;
        setHexInput(value);
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            setHsv(hexToHsv(value));
        }
    };

    // Handle gradient saturation change
    const handleGradientSatChange = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!gradientSatRef.current) return;
        isUserInteracting.current = true;
        const rect = gradientSatRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        setGradientHsv(prev => ({ ...prev, s: x * 100, v: (1 - y) * 100 }));
    }, []);

    // Handle gradient hue change  
    const handleGradientHueChange = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!gradientHueRef.current) return;
        isUserInteracting.current = true;
        const rect = gradientHueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setGradientHsv(prev => ({ ...prev, h: x * 360 }));
    }, []);

    // Update selected stop color when HSV changes
    useEffect(() => {
        if (!isUserInteracting.current || activeTab !== 'gradient') return;
        const newColor = hsvToHex(gradientHsv.h, gradientHsv.s, gradientHsv.v);
        setColorStops(prev => prev.map(stop =>
            stop.id === selectedStopId ? { ...stop, color: newColor } : stop
        ));
    }, [gradientHsv, selectedStopId, activeTab]);

    // Update gradient HSV when selected stop changes
    useEffect(() => {
        if (selectedStop && /^#[0-9A-Fa-f]{6}$/.test(selectedStop.color)) {
            setGradientHsv(hexToHsv(selectedStop.color));
        }
    }, [selectedStopId, selectedStop?.color]);

    // Mouse handlers for gradient picker
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingGradientSat) handleGradientSatChange(e);
            if (isDraggingGradientHue) handleGradientHueChange(e);
        };
        const handleMouseUp = () => {
            setIsDraggingGradientSat(false);
            setIsDraggingGradientHue(false);
        };

        if (isDraggingGradientSat || isDraggingGradientHue) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingGradientSat, isDraggingGradientHue, handleGradientSatChange, handleGradientHueChange]);

    // Debounced gradient update to prevent infinite loops
    const gradientUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
    const pendingGradientUpdate = useRef<{
        from: string;
        to: string;
        angle: number;
        type: 'linear' | 'radial';
        radialPosition: 'center' | 'top-left';
        colorStops: Array<{ offset: number; color: string }>;
    } | null>(null);

    // Queue a gradient update (debounced)
    const queueGradientUpdate = useCallback((
        from: string,
        to: string,
        angle: number,
        type: 'linear' | 'radial',
        radialPos: 'center' | 'top-left',
        stops: Array<{ offset: number; color: string }>
    ) => {
        pendingGradientUpdate.current = { from, to, angle, type, radialPosition: radialPos, colorStops: stops };
        if (gradientUpdateTimeout.current) {
            clearTimeout(gradientUpdateTimeout.current);
        }
        gradientUpdateTimeout.current = setTimeout(() => {
            if (pendingGradientUpdate.current && onGradientChange) {
                onGradientChange(pendingGradientUpdate.current);
                pendingGradientUpdate.current = null;
            }
        }, 50); // Reduced debounce for faster updates
    }, [onGradientChange]);

    // Immediate gradient update (for drag operations - no debounce)
    const immediateGradientUpdate = useCallback((stops: Array<{ offset: number; color: string }>) => {
        if (!onGradientChange) return;
        const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);
        const from = sortedStops[0]?.color || '#FF7E5F';
        const to = sortedStops[sortedStops.length - 1]?.color || '#FEB47B';
        onGradientChange({
            from,
            to,
            angle: gradientAngle,
            type: gradientType,
            radialPosition,
            colorStops: sortedStops
        });
    }, [onGradientChange, gradientAngle, gradientType, radialPosition]);

    // Effect to queue gradient update when colors or direction change (only when user is interacting)
    useEffect(() => {
        if (activeTab === 'gradient' && isUserInteracting.current) {
            // Get first and last color stops for backward compatibility
            const sortedStops = [...colorStops].sort((a, b) => a.offset - b.offset);
            const from = sortedStops[0]?.color || '#FF7E5F';
            const to = sortedStops[sortedStops.length - 1]?.color || '#FEB47B';
            // Pass all color stops
            const stops = sortedStops.map(s => ({ offset: s.offset, color: s.color }));
            queueGradientUpdate(from, to, gradientAngle, gradientType, radialPosition, stops);
            isUserInteracting.current = false;
        }
    }, [colorStops, gradientAngle, gradientType, radialPosition, activeTab, queueGradientUpdate]);

    // Get gradient CSS string
    const getGradientCss = () => {
        if (gradientType === 'radial') {
            const pos = radialPosition === 'center' ? 'circle' : 'circle at left top';
            return `radial-gradient(${pos}, ${gradientFrom}, ${gradientTo})`;
        }
        return `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`;
    };

    return (
        <div className="relative bg-white rounded-xl border border-gray-200 mb-4 shadow-sm overflow-hidden w-full animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('solid')}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${activeTab === 'solid' ? 'text-violet-600' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    Solid
                    {activeTab === 'solid' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-t-full mx-4" />
                    )}
                </button>
                {showGradient && (
                    <button
                        onClick={() => setActiveTab('gradient')}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${activeTab === 'gradient' ? 'text-violet-600' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Gradient
                        {activeTab === 'gradient' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-t-full mx-4" />
                        )}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Content */}
            <div className="p-3">
                {activeTab === 'solid' ? (
                    <>
                        {/* Saturation/Brightness Picker */}
                        <div
                            ref={saturationRef}
                            className="w-full h-32 rounded-lg mb-3 relative cursor-crosshair shadow-inner ring-1 ring-black/5 overflow-hidden touch-none"
                            style={{
                                backgroundColor: getHueColor(hsv.h),
                                backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
                            }}
                            onMouseDown={(e) => {
                                setIsDraggingSaturation(true);
                                handleSaturationChange(e);
                            }}
                        >
                            {/* Picker indicator */}
                            <div
                                className="absolute w-3 h-3 border-2 border-white rounded-full shadow-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                                style={{
                                    left: `${hsv.s}%`,
                                    top: `${100 - hsv.v}%`,
                                    backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v),
                                }}
                            />
                        </div>

                        {/* Hue Slider */}
                        <div
                            ref={hueRef}
                            className="relative h-3 mb-3 rounded-full overflow-hidden shadow-inner border border-gray-200 ring-1 ring-black/5 cursor-pointer"
                            onMouseDown={(e) => {
                                setIsDraggingHue(true);
                                handleHueChange(e);
                            }}
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                                }}
                            />
                            {/* Hue indicator */}
                            <div
                                className="absolute top-0 bottom-0 w-3 h-3 border-2 border-white rounded-full shadow-sm pointer-events-none"
                                style={{
                                    left: `${(hsv.h / 360) * 100}%`,
                                    transform: 'translateX(-50%)',
                                    backgroundColor: getHueColor(hsv.h),
                                    boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                                }}
                            />
                        </div>

                        {/* Hex Input */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-2 py-1 bg-white focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-200 transition-all shadow-sm">
                                <div
                                    className="w-5 h-5 rounded-full border border-gray-200 shadow-sm shrink-0 mr-2"
                                    style={{ backgroundColor: hexInput }}
                                />
                                <input
                                    className="w-full bg-transparent text-xs font-medium text-gray-700 focus:outline-none uppercase"
                                    type="text"
                                    value={hexInput}
                                    onChange={(e) => handleHexInputChange(e.target.value)}
                                />
                            </div>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm bg-white"
                                title="Pick color from screen"
                            >
                                <Pipette size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Gradient Tab - With Gradient Bar */
                    <div className="p-3">
                        {/* Gradient Bar with Color Stops */}
                        <div className="mb-3">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Gradient Bar</h4>
                            <div
                                ref={gradientBarRef}
                                className="relative h-4 rounded-md border border-gray-200 shadow-inner cursor-crosshair"
                                style={{ background: `linear-gradient(90deg, ${getGradientBarCss()})` }}
                                onClick={(e) => {
                                    // Add new color stop on click
                                    if (!gradientBarRef.current) return;
                                    const rect = gradientBarRef.current.getBoundingClientRect();
                                    const offset = (e.clientX - rect.left) / rect.width;
                                    // Don't add too close to existing stops
                                    const tooClose = colorStops.some(s => Math.abs(s.offset - offset) < 0.05);
                                    if (tooClose) return;

                                    const newId = `stop-${Date.now()}`;
                                    // Interpolate color based on position
                                    const sortedStops = [...colorStops].sort((a, b) => a.offset - b.offset);
                                    let newColor = '#888888';
                                    for (let i = 0; i < sortedStops.length - 1; i++) {
                                        if (offset >= sortedStops[i].offset && offset <= sortedStops[i + 1].offset) {
                                            // Simple average for now
                                            newColor = sortedStops[i].color;
                                            break;
                                        }
                                    }

                                    setColorStops(prev => [...prev, { id: newId, offset, color: newColor }]);
                                    setSelectedStopId(newId);
                                    isUserInteracting.current = true;
                                }}
                            >
                                {/* Color Stop Handles */}
                                {colorStops.map((stop) => (
                                    <div
                                        key={stop.id}
                                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 shadow-sm cursor-grab transition-transform ${stop.id === selectedStopId
                                            ? 'border-violet-600 ring-2 ring-violet-200 scale-110 z-10'
                                            : 'border-white hover:scale-105'
                                            }`}
                                        style={{
                                            left: `${stop.offset * 100}%`,
                                            transform: `translateX(-50%) translateY(-50%)`,
                                            background: stop.color,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedStopId(stop.id);
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            // Delete stop if not first or last
                                            if (colorStops.length > 2 && stop.offset !== 0 && stop.offset !== 1) {
                                                setColorStops(prev => prev.filter(s => s.id !== stop.id));
                                                setSelectedStopId(colorStops[0].id);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setSelectedStopId(stop.id);
                                            setIsDraggingStop(true);

                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                if (!gradientBarRef.current) return;
                                                const rect = gradientBarRef.current.getBoundingClientRect();
                                                let newOffset = (moveEvent.clientX - rect.left) / rect.width;
                                                newOffset = Math.max(0, Math.min(1, newOffset));

                                                // Update local state
                                                const newStops = colorStops.map(s =>
                                                    s.id === stop.id ? { ...s, offset: newOffset } : s
                                                );
                                                setColorStops(newStops);

                                                // Immediately update the canvas
                                                immediateGradientUpdate(newStops.map(s => ({ offset: s.offset, color: s.color })));
                                            };

                                            const handleMouseUp = () => {
                                                setIsDraggingStop(false);
                                                // Final update with current stops
                                                immediateGradientUpdate(colorStops.map(s => ({ offset: s.offset, color: s.color })));
                                                window.removeEventListener('mousemove', handleMouseMove);
                                                window.removeEventListener('mouseup', handleMouseUp);
                                            };

                                            window.addEventListener('mousemove', handleMouseMove);
                                            window.addEventListener('mouseup', handleMouseUp);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Direction Presets */}
                        <div className="mb-3">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Direction</h4>
                            <div className="flex gap-1">
                                {/* Linear 90° */}
                                <button
                                    onClick={() => { setGradientType('linear'); setGradientAngle(90); isUserInteracting.current = true; }}
                                    className={`w-6 h-6 rounded-md border transition-all ${gradientType === 'linear' && gradientAngle === 90
                                        ? 'border-violet-600 ring-2 ring-violet-100'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    title="Linear 90°"
                                    style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
                                />
                                {/* Linear 180° */}
                                <button
                                    onClick={() => { setGradientType('linear'); setGradientAngle(180); isUserInteracting.current = true; }}
                                    className={`w-6 h-6 rounded-md border transition-all ${gradientType === 'linear' && gradientAngle === 180
                                        ? 'border-violet-600 ring-2 ring-violet-100'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    title="Linear 180°"
                                    style={{ background: `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})` }}
                                />
                                {/* Linear 135° */}
                                <button
                                    onClick={() => { setGradientType('linear'); setGradientAngle(135); isUserInteracting.current = true; }}
                                    className={`w-6 h-6 rounded-md border transition-all ${gradientType === 'linear' && gradientAngle === 135
                                        ? 'border-violet-600 ring-2 ring-violet-100'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    title="Linear 135°"
                                    style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                                />
                                {/* Radial Center */}
                                <button
                                    onClick={() => { setGradientType('radial'); setRadialPosition('center'); isUserInteracting.current = true; }}
                                    className={`w-6 h-6 rounded-md border transition-all ${gradientType === 'radial' && radialPosition === 'center'
                                        ? 'border-violet-600 ring-2 ring-violet-100'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    title="Radial Center"
                                    style={{ background: `radial-gradient(circle, ${gradientFrom}, ${gradientTo})` }}
                                />
                                {/* Radial Top-Left */}
                                <button
                                    onClick={() => { setGradientType('radial'); setRadialPosition('top-left'); isUserInteracting.current = true; }}
                                    className={`w-6 h-6 rounded-md border transition-all ${gradientType === 'radial' && radialPosition === 'top-left'
                                        ? 'border-violet-600 ring-2 ring-violet-100'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    title="Radial Top-Left"
                                    style={{ background: `radial-gradient(circle at left top, ${gradientFrom}, ${gradientTo})` }}
                                />
                            </div>
                        </div>

                        {/* Color Picker for Selected Stop */}
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mb-0">
                            {/* Saturation/Brightness Picker */}
                            <div
                                ref={gradientSatRef}
                                className="w-full h-32 rounded-lg mb-3 relative cursor-crosshair shadow-inner ring-1 ring-black/5 overflow-hidden touch-none"
                                style={{
                                    backgroundColor: getHueColor(gradientHsv.h),
                                    backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
                                }}
                                onMouseDown={(e) => {
                                    setIsDraggingGradientSat(true);
                                    handleGradientSatChange(e);
                                }}
                            >
                                <div
                                    className="absolute w-3 h-3 border-2 border-white rounded-full shadow-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                                    style={{
                                        left: `${gradientHsv.s}%`,
                                        top: `${100 - gradientHsv.v}%`,
                                        backgroundColor: hsvToHex(gradientHsv.h, gradientHsv.s, gradientHsv.v),
                                    }}
                                />
                            </div>

                            {/* Hue Slider */}
                            <div
                                ref={gradientHueRef}
                                className="relative h-3 mb-3 rounded-full overflow-hidden shadow-inner border border-gray-200 ring-1 ring-black/5 cursor-pointer"
                                onMouseDown={(e) => {
                                    setIsDraggingGradientHue(true);
                                    handleGradientHueChange(e);
                                }}
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                                />
                                <div
                                    className="absolute top-0 bottom-0 w-3 h-3 border-2 border-white rounded-full shadow-sm pointer-events-none"
                                    style={{
                                        left: `${(gradientHsv.h / 360) * 100}%`,
                                        transform: 'translateX(-50%)',
                                        backgroundColor: getHueColor(gradientHsv.h),
                                        boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                                    }}
                                />
                            </div>

                            {/* Hex Input */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-2 py-1 bg-white focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-200 transition-all shadow-sm">
                                    <div
                                        className="w-5 h-5 rounded-full border border-gray-200 shadow-sm shrink-0 mr-2"
                                        style={{ backgroundColor: selectedStop?.color || '#888888' }}
                                    />
                                    <input
                                        className="w-full bg-transparent text-xs font-medium text-gray-700 focus:outline-none uppercase"
                                        type="text"
                                        value={selectedStop?.color || '#888888'}
                                        onChange={(e) => {
                                            isUserInteracting.current = true;
                                            const value = e.target.value.toUpperCase();
                                            setColorStops(prev => prev.map(stop =>
                                                stop.id === selectedStopId ? { ...stop, color: value } : stop
                                            ));
                                            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                                                setGradientHsv(hexToHsv(value));
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm bg-white"
                                    title="Pick color from screen"
                                >
                                    <Pipette size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

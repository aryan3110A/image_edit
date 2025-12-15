'use client';

import { useCanvasStore } from '@/store/canvasStore';
import { useActivePage } from '@/store/editorStore';
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export function LayersPanel() {
    const activePage = useActivePage();
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const select = useCanvasStore((state) => state.select);
    const toggleVisibility = useCanvasStore((state) => state.toggleVisibility);
    const lockElement = useCanvasStore((state) => state.lockElement);
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const bringForward = useCanvasStore((state) => state.bringForward);
    const sendBackward = useCanvasStore((state) => state.sendBackward);
    const removeElement = useCanvasStore((state) => state.removeElement);

    const elements = activePage?.elements || [];
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-white font-semibold">Layers</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {sortedElements.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No elements on canvas
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {sortedElements.map((element) => {
                            const isSelected = selectedIds.includes(element.id);

                            return (
                                <div
                                    key={element.id}
                                    onClick={() => select(element.id)}
                                    className={`
                    flex items-center gap-2 p-2 rounded-lg cursor-pointer
                    ${isSelected
                                            ? 'bg-blue-600/30 border border-blue-500'
                                            : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'}
                  `}
                                >
                                    {/* Layer Icon */}
                                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400">
                                        {element.type === 'text' && 'T'}
                                        {element.type === 'image' && '🖼'}
                                        {element.type === 'shape' && '◻'}
                                    </div>

                                    {/* Layer Name */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white text-sm truncate">
                                            {element.name}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                            {element.type}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleVisibility(element.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-white"
                                        >
                                            {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                element.locked ? unlockElement(element.id) : lockElement(element.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-white"
                                        >
                                            {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Layer Actions */}
            {selectedIds.length > 0 && (
                <div className="p-4 border-t border-gray-700 flex items-center justify-center gap-2">
                    <button
                        onClick={() => bringForward(selectedIds[0])}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600 text-gray-300"
                        title="Bring Forward"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        onClick={() => sendBackward(selectedIds[0])}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600 text-gray-300"
                        title="Send Backward"
                    >
                        <ChevronDown size={16} />
                    </button>
                    <button
                        onClick={() => removeElement(selectedIds)}
                        className="p-2 bg-red-600/20 rounded hover:bg-red-600/40 text-red-400"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

// Canvas Store
// Element management and selection state using Zustand

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    CanvasElement,
    TextElement,
    ImageElement,
    ShapeElement,
    createDefaultTransform,
    createDefaultStyle,
    createDefaultTextStyle,
    createDefaultImageFilter,
    Transform,
    Style,
} from '@/types/canvas';
import { useEditorStore } from './editorStore';
import { useHistoryStore } from './historyStore';

interface CanvasState {
    // Selection state
    selectedIds: string[];
    hoveredId: string | null;

    // Clipboard
    clipboard: CanvasElement[];

    // Drag state
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;

    // Transform state for active operations
    activeTransform: Partial<Transform> | null;
}

interface CanvasActions {
    // Selection actions
    select: (id: string | string[], addToSelection?: boolean) => void;
    deselect: (id?: string) => void;
    selectAll: () => void;
    setHovered: (id: string | null) => void;

    // Element CRUD
    addElement: (element: CanvasElement) => void;
    addTextElement: (options?: Partial<TextElement>) => string;
    addImageElement: (src: string, options?: Partial<ImageElement>) => string;
    addShapeElement: (shapeType: string, options?: Partial<ShapeElement>) => string;
    updateElement: (id: string, updates: Partial<CanvasElement>) => void;
    removeElement: (id: string | string[]) => void;
    duplicateElements: (ids?: string[]) => string[];

    // Transform actions
    updateTransform: (id: string, transform: Partial<Transform>) => void;
    updateStyle: (id: string, style: Partial<Style>) => void;

    // Z-index operations
    bringToFront: (id: string) => void;
    sendToBack: (id: string) => void;
    bringForward: (id: string) => void;
    sendBackward: (id: string) => void;

    // Group operations
    groupElements: (ids: string[]) => string;
    ungroupElement: (groupId: string) => string[];

    // Layer operations
    lockElement: (id: string) => void;
    unlockElement: (id: string) => void;
    toggleVisibility: (id: string) => void;

    // Clipboard operations
    copy: () => void;
    cut: () => void;
    paste: () => void;

    // Drag state
    setDragging: (isDragging: boolean) => void;
    setResizing: (isResizing: boolean) => void;
    setRotating: (isRotating: boolean) => void;
    setActiveTransform: (transform: Partial<Transform> | null) => void;

    // Utility
    getSelectedElements: () => CanvasElement[];
    getElement: (id: string) => CanvasElement | undefined;
    getElements: () => CanvasElement[];
}

export type CanvasStore = CanvasState & CanvasActions;

// Helper to get active page elements
const getActivePageElements = (): CanvasElement[] => {
    const project = useEditorStore.getState().project;
    if (!project) return [];
    const activePage = project.pages.find(p => p.id === project.activePageId);
    return activePage?.elements ?? [];
};

// Helper to update active page elements
const updateActivePageElements = (updater: (elements: CanvasElement[]) => void) => {
    const editorStore = useEditorStore.getState();
    if (!editorStore.project) return;

    const activePage = editorStore.project.pages.find(
        p => p.id === editorStore.project?.activePageId
    );
    if (activePage) {
        updater(activePage.elements);
        editorStore.markAsChanged();
    }
};

// Helper to push history state after changes
const pushHistory = (label: string) => {
    // Use setTimeout to ensure state is updated before capturing
    setTimeout(() => {
        useHistoryStore.getState().pushState(label);
    }, 0);
};

export const useCanvasStore = create<CanvasStore>()(
    immer((set, get) => ({
        // Initial state
        selectedIds: [],
        hoveredId: null,
        clipboard: [],
        isDragging: false,
        isResizing: false,
        isRotating: false,
        activeTransform: null,

        // Selection actions
        select: (id: string | string[], addToSelection = false) => {
            const ids = Array.isArray(id) ? id : [id];
            set((state) => {
                if (addToSelection) {
                    // Add to existing selection, avoiding duplicates
                    const newIds = ids.filter(i => !state.selectedIds.includes(i));
                    state.selectedIds.push(...newIds);
                } else {
                    state.selectedIds = ids;
                }
            });
        },

        deselect: (id?: string) => {
            set((state) => {
                if (id) {
                    state.selectedIds = state.selectedIds.filter(i => i !== id);
                } else {
                    state.selectedIds = [];
                }
            });
        },

        selectAll: () => {
            const elements = getActivePageElements();
            set((state) => {
                state.selectedIds = elements
                    .filter(e => !e.locked && e.selectable)
                    .map(e => e.id);
            });
        },

        setHovered: (id: string | null) => {
            set((state) => {
                state.hoveredId = id;
            });
        },

        // Element CRUD
        addElement: (element: CanvasElement) => {
            const editorStore = useEditorStore.getState();
            if (!editorStore.project) return;

            editorStore.updatePage(editorStore.project.activePageId, {
                elements: [...getActivePageElements(), element],
            });

            set((state) => {
                state.selectedIds = [element.id];
            });

            pushHistory(`Add ${element.type}`);
        },

        addTextElement: (options?: Partial<TextElement>) => {
            const id = crypto.randomUUID();
            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            const textElement: TextElement = {
                id,
                type: 'text',
                name: 'Text',
                content: options?.content ?? 'Click to edit text',
                transform: { ...createDefaultTransform(), ...options?.transform },
                style: { ...createDefaultStyle(), fill: '#1a1a1a', ...options?.style },
                textStyle: { ...createDefaultTextStyle(), ...options?.textStyle },
                effect: options?.effect ?? { type: 'none' },
                locked: false,
                visible: true,
                selectable: true,
                editable: true,
                zIndex: maxZIndex + 1,
                ...options,
            };

            get().addElement(textElement);
            return id;
        },

        addImageElement: (src: string, options?: Partial<ImageElement>) => {
            const id = crypto.randomUUID();
            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            const imageElement: ImageElement = {
                id,
                type: 'image',
                name: 'Image',
                src,
                originalSrc: src,
                transform: { ...createDefaultTransform(), width: 200, height: 200, ...options?.transform },
                style: { ...createDefaultStyle(), fill: null, ...options?.style },
                filters: { ...createDefaultImageFilter(), ...options?.filters },
                crop: null,
                crossOrigin: 'anonymous',
                locked: false,
                visible: true,
                selectable: true,
                zIndex: maxZIndex + 1,
                ...options,
            };

            get().addElement(imageElement);
            return id;
        },

        addShapeElement: (shapeType: string, options?: Partial<ShapeElement>) => {
            const id = crypto.randomUUID();
            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            const shapeElement: ShapeElement = {
                id,
                type: 'shape',
                name: `Shape (${shapeType})`,
                shapeType: shapeType as ShapeElement['shapeType'],
                transform: { ...createDefaultTransform(), ...options?.transform },
                style: { ...createDefaultStyle(), fill: '#4A90D9', ...options?.style },
                locked: false,
                visible: true,
                selectable: true,
                zIndex: maxZIndex + 1,
                ...options,
            };

            get().addElement(shapeElement);
            return id;
        },

        updateElement: (id: string, updates: Partial<CanvasElement>) => {
            const editorStore = useEditorStore.getState();
            if (!editorStore.project) return;

            const elements = getActivePageElements();
            const updatedElements = elements.map(el =>
                el.id === id ? { ...el, ...updates } : el
            );

            editorStore.updatePage(editorStore.project.activePageId, {
                elements: updatedElements,
            });
        },

        removeElement: (id: string | string[]) => {
            const ids = Array.isArray(id) ? id : [id];
            const editorStore = useEditorStore.getState();
            if (!editorStore.project) return;

            const elements = getActivePageElements();
            const updatedElements = elements.filter(el => !ids.includes(el.id));

            editorStore.updatePage(editorStore.project.activePageId, {
                elements: updatedElements,
            });

            set((state) => {
                state.selectedIds = state.selectedIds.filter(i => !ids.includes(i));
            });

            pushHistory(`Delete ${ids.length} element(s)`);
        },

        duplicateElements: (ids?: string[]) => {
            const targetIds = ids ?? get().selectedIds;
            if (targetIds.length === 0) return [];

            const elements = getActivePageElements();
            const duplicatedIds: string[] = [];

            const elementsToDuplicate = elements.filter(el => targetIds.includes(el.id));
            const newElements = elementsToDuplicate.map(el => {
                const newId = crypto.randomUUID();
                duplicatedIds.push(newId);
                return {
                    ...JSON.parse(JSON.stringify(el)),
                    id: newId,
                    name: `${el.name} (Copy)`,
                    transform: {
                        ...el.transform,
                        x: el.transform.x + 20,
                        y: el.transform.y + 20,
                    },
                };
            });

            const editorStore = useEditorStore.getState();
            if (editorStore.project) {
                editorStore.updatePage(editorStore.project.activePageId, {
                    elements: [...elements, ...newElements],
                });
            }

            set((state) => {
                state.selectedIds = duplicatedIds;
            });

            pushHistory(`Duplicate ${duplicatedIds.length} element(s)`);

            return duplicatedIds;
        },

        // Transform actions
        updateTransform: (id: string, transform: Partial<Transform>) => {
            const elements = getActivePageElements();
            const element = elements.find(el => el.id === id);
            if (element) {
                get().updateElement(id, {
                    transform: { ...element.transform, ...transform },
                });
            }
        },

        updateStyle: (id: string, style: Partial<Style>) => {
            const elements = getActivePageElements();
            const element = elements.find(el => el.id === id);
            if (element) {
                get().updateElement(id, {
                    style: { ...element.style, ...style },
                });
            }
        },

        // Z-index operations
        bringToFront: (id: string) => {
            const elements = getActivePageElements();
            const maxZIndex = Math.max(...elements.map(e => e.zIndex));
            get().updateElement(id, { zIndex: maxZIndex + 1 });
        },

        sendToBack: (id: string) => {
            const elements = getActivePageElements();
            const minZIndex = Math.min(...elements.map(e => e.zIndex));
            get().updateElement(id, { zIndex: minZIndex - 1 });
        },

        bringForward: (id: string) => {
            const elements = getActivePageElements();
            const element = elements.find(e => e.id === id);
            if (element) {
                get().updateElement(id, { zIndex: element.zIndex + 1 });
            }
        },

        sendBackward: (id: string) => {
            const elements = getActivePageElements();
            const element = elements.find(e => e.id === id);
            if (element) {
                get().updateElement(id, { zIndex: element.zIndex - 1 });
            }
        },

        // Group operations
        groupElements: (ids: string[]) => {
            // TODO: Implement grouping
            const groupId = crypto.randomUUID();
            return groupId;
        },

        ungroupElement: (groupId: string) => {
            // TODO: Implement ungrouping
            return [];
        },

        // Layer operations
        lockElement: (id: string) => {
            get().updateElement(id, { locked: true, selectable: false });
            set((state) => {
                state.selectedIds = state.selectedIds.filter(i => i !== id);
            });
        },

        unlockElement: (id: string) => {
            get().updateElement(id, { locked: false, selectable: true });
        },

        toggleVisibility: (id: string) => {
            const elements = getActivePageElements();
            const element = elements.find(el => el.id === id);
            if (element) {
                get().updateElement(id, { visible: !element.visible });
            }
        },

        // Clipboard operations
        copy: () => {
            const selectedIds = get().selectedIds;
            const elements = getActivePageElements();
            const selectedElements = elements.filter(el => selectedIds.includes(el.id));

            set((state) => {
                state.clipboard = JSON.parse(JSON.stringify(selectedElements));
            });
        },

        cut: () => {
            get().copy();
            get().removeElement(get().selectedIds);
        },

        paste: () => {
            const { clipboard } = get();
            if (clipboard.length === 0) return;

            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            const pastedIds: string[] = [];
            const pastedElements = clipboard.map((el, index) => {
                const newId = crypto.randomUUID();
                pastedIds.push(newId);
                return {
                    ...JSON.parse(JSON.stringify(el)),
                    id: newId,
                    transform: {
                        ...el.transform,
                        x: el.transform.x + 20,
                        y: el.transform.y + 20,
                    },
                    zIndex: maxZIndex + index + 1,
                };
            });

            const editorStore = useEditorStore.getState();
            if (editorStore.project) {
                editorStore.updatePage(editorStore.project.activePageId, {
                    elements: [...elements, ...pastedElements],
                });
            }

            set((state) => {
                state.selectedIds = pastedIds;
            });
        },

        // Drag state
        setDragging: (isDragging: boolean) => {
            set((state) => {
                state.isDragging = isDragging;
            });
        },

        setResizing: (isResizing: boolean) => {
            set((state) => {
                state.isResizing = isResizing;
            });
        },

        setRotating: (isRotating: boolean) => {
            set((state) => {
                state.isRotating = isRotating;
            });
        },

        setActiveTransform: (transform: Partial<Transform> | null) => {
            set((state) => {
                state.activeTransform = transform;
            });
        },

        // Utility
        getSelectedElements: () => {
            const selectedIds = get().selectedIds;
            const elements = getActivePageElements();
            return elements.filter(el => selectedIds.includes(el.id));
        },

        getElement: (id: string) => {
            const elements = getActivePageElements();
            return elements.find(el => el.id === id);
        },

        getElements: () => {
            return getActivePageElements();
        },
    }))
);

// Selector hooks
// Note: To get selected elements, use the store's getSelectedElements() method
// outside of React's render cycle, or use the selectedIds selector and derive elements
export const useSelectedIds = () => {
    return useCanvasStore((state) => state.selectedIds);
};

export const useIsSelected = (id: string) => {
    return useCanvasStore((state) => state.selectedIds.includes(id));
};

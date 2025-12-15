// Export Store
// Export settings and progress management using Zustand

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    ExportSettings,
    ExportProgress,
    ExportResult,
    ImageExportSettings,
    PDFExportSettings,
    PPTXExportSettings,
    SVGExportSettings,
    createDefaultImageExportSettings,
    createDefaultPDFExportSettings,
    createDefaultPPTXExportSettings,
    createDefaultSVGExportSettings,
} from '@/types/export';

interface ExportState {
    // Current export settings
    settings: ExportSettings;

    // Export progress
    progress: ExportProgress;

    // Export history
    recentExports: ExportResult[];
    maxRecentExports: number;

    // Queue for batch exports
    exportQueue: ExportSettings[];
    isProcessingQueue: boolean;
}

interface ExportActions {
    // Settings management
    setSettings: (settings: Partial<ExportSettings>) => void;
    setFormat: (format: 'png' | 'jpg' | 'svg' | 'pdf' | 'pptx') => void;
    resetSettings: () => void;

    // Image-specific settings
    setImageSettings: (settings: Partial<ImageExportSettings>) => void;

    // PDF-specific settings
    setPDFSettings: (settings: Partial<PDFExportSettings>) => void;

    // PPTX-specific settings
    setPPTXSettings: (settings: Partial<PPTXExportSettings>) => void;

    // SVG-specific settings
    setSVGSettings: (settings: Partial<SVGExportSettings>) => void;

    // Progress management
    setProgress: (progress: Partial<ExportProgress>) => void;
    resetProgress: () => void;

    // Export execution (placeholder - actual implementation in engine)
    startExport: () => void;
    cancelExport: () => void;

    // Result management
    addExportResult: (result: ExportResult) => void;
    clearRecentExports: () => void;

    // Queue management
    addToQueue: (settings: ExportSettings) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    processQueue: () => void;
}

export type ExportStore = ExportState & ExportActions;

const initialProgress: ExportProgress = {
    status: 'idle',
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    message: '',
};

export const useExportStore = create<ExportStore>()(
    immer((set, get) => ({
        // Initial state
        settings: createDefaultImageExportSettings('png'),
        progress: initialProgress,
        recentExports: [],
        maxRecentExports: 10,
        exportQueue: [],
        isProcessingQueue: false,

        // Settings management
        setSettings: (settings: Partial<ExportSettings>) => {
            set((state) => {
                state.settings = { ...state.settings, ...settings } as ExportSettings;
            });
        },

        setFormat: (format: 'png' | 'jpg' | 'svg' | 'pdf' | 'pptx') => {
            set((state) => {
                switch (format) {
                    case 'png':
                        state.settings = createDefaultImageExportSettings('png');
                        break;
                    case 'jpg':
                        state.settings = createDefaultImageExportSettings('jpg');
                        break;
                    case 'svg':
                        state.settings = createDefaultSVGExportSettings();
                        break;
                    case 'pdf':
                        state.settings = createDefaultPDFExportSettings();
                        break;
                    case 'pptx':
                        state.settings = createDefaultPPTXExportSettings();
                        break;
                }
            });
        },

        resetSettings: () => {
            set((state) => {
                state.settings = createDefaultImageExportSettings('png');
            });
        },

        // Format-specific settings
        setImageSettings: (settings: Partial<ImageExportSettings>) => {
            set((state) => {
                if (state.settings.format === 'png' || state.settings.format === 'jpg') {
                    state.settings = {
                        ...state.settings,
                        ...settings
                    } as ImageExportSettings;
                }
            });
        },

        setPDFSettings: (settings: Partial<PDFExportSettings>) => {
            set((state) => {
                if (state.settings.format === 'pdf') {
                    state.settings = {
                        ...state.settings,
                        ...settings
                    } as PDFExportSettings;
                }
            });
        },

        setPPTXSettings: (settings: Partial<PPTXExportSettings>) => {
            set((state) => {
                if (state.settings.format === 'pptx') {
                    state.settings = {
                        ...state.settings,
                        ...settings
                    } as PPTXExportSettings;
                }
            });
        },

        setSVGSettings: (settings: Partial<SVGExportSettings>) => {
            set((state) => {
                if (state.settings.format === 'svg') {
                    state.settings = {
                        ...state.settings,
                        ...settings
                    } as SVGExportSettings;
                }
            });
        },

        // Progress management
        setProgress: (progress: Partial<ExportProgress>) => {
            set((state) => {
                state.progress = { ...state.progress, ...progress };
            });
        },

        resetProgress: () => {
            set((state) => {
                state.progress = initialProgress;
            });
        },

        // Export execution (placeholder)
        startExport: () => {
            set((state) => {
                state.progress = {
                    status: 'preparing',
                    progress: 0,
                    currentPage: 0,
                    totalPages: 1, // Will be set by actual export
                    message: 'Preparing export...',
                };
            });

            // TODO: Actual export logic will be in the export engine
            // This is just a placeholder for state management
        },

        cancelExport: () => {
            set((state) => {
                state.progress = {
                    ...state.progress,
                    status: 'idle',
                    message: 'Export cancelled',
                };
            });
        },

        // Result management
        addExportResult: (result: ExportResult) => {
            set((state) => {
                state.recentExports.unshift(result);
                if (state.recentExports.length > state.maxRecentExports) {
                    state.recentExports = state.recentExports.slice(0, state.maxRecentExports);
                }
                state.progress = {
                    status: result.success ? 'complete' : 'error',
                    progress: 100,
                    currentPage: state.progress.totalPages,
                    totalPages: state.progress.totalPages,
                    message: result.success ? 'Export complete!' : result.error || 'Export failed',
                    error: result.error,
                };
            });
        },

        clearRecentExports: () => {
            set((state) => {
                state.recentExports = [];
            });
        },

        // Queue management
        addToQueue: (settings: ExportSettings) => {
            set((state) => {
                state.exportQueue.push(settings);
            });
        },

        removeFromQueue: (index: number) => {
            set((state) => {
                state.exportQueue.splice(index, 1);
            });
        },

        clearQueue: () => {
            set((state) => {
                state.exportQueue = [];
            });
        },

        processQueue: () => {
            // TODO: Implement batch processing
            set((state) => {
                state.isProcessingQueue = true;
            });
        },
    }))
);

// Selector hooks
export const useExportProgress = () => {
    return useExportStore((state) => state.progress);
};

export const useExportSettings = () => {
    return useExportStore((state) => state.settings);
};

export const useIsExporting = () => {
    return useExportStore((state) =>
        state.progress.status !== 'idle' &&
        state.progress.status !== 'complete' &&
        state.progress.status !== 'error'
    );
};

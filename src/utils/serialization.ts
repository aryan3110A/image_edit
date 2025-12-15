// Serialization Utilities
// Project and element serialization/deserialization

import { Project, Page } from '@/types/project';
import { CanvasElement } from '@/types/canvas';

const STORAGE_PREFIX = 'wildmind_designer_';
const CURRENT_VERSION = '1.0.0';

export interface SerializedProject {
    version: string;
    project: Project;
    savedAt: number;
}

/**
 * Serialize project to JSON string
 */
export const serializeProject = (project: Project): string => {
    const serialized: SerializedProject = {
        version: CURRENT_VERSION,
        project,
        savedAt: Date.now(),
    };

    return JSON.stringify(serialized);
};

/**
 * Deserialize project from JSON string
 */
export const deserializeProject = (json: string): Project | null => {
    try {
        const parsed: SerializedProject = JSON.parse(json);

        // Version migration could happen here
        if (parsed.version !== CURRENT_VERSION) {
            // TODO: Implement version migration
            console.warn(`Project version ${parsed.version} may need migration`);
        }

        return parsed.project;
    } catch (error) {
        console.error('Failed to deserialize project:', error);
        return null;
    }
};

/**
 * Save project to localStorage
 */
export const saveProjectToStorage = (project: Project): boolean => {
    try {
        const key = `${STORAGE_PREFIX}project_${project.id}`;
        const serialized = serializeProject(project);
        localStorage.setItem(key, serialized);

        // Update project list
        updateProjectList(project.id, project.name);

        return true;
    } catch (error) {
        console.error('Failed to save project:', error);
        return false;
    }
};

/**
 * Load project from localStorage
 */
export const loadProjectFromStorage = (projectId: string): Project | null => {
    try {
        const key = `${STORAGE_PREFIX}project_${projectId}`;
        const json = localStorage.getItem(key);

        if (!json) return null;

        return deserializeProject(json);
    } catch (error) {
        console.error('Failed to load project:', error);
        return null;
    }
};

/**
 * Delete project from localStorage
 */
export const deleteProjectFromStorage = (projectId: string): boolean => {
    try {
        const key = `${STORAGE_PREFIX}project_${projectId}`;
        localStorage.removeItem(key);

        // Update project list
        removeFromProjectList(projectId);

        return true;
    } catch (error) {
        console.error('Failed to delete project:', error);
        return false;
    }
};

/**
 * Get list of saved projects
 */
export const getProjectList = (): Array<{ id: string; name: string; savedAt: number }> => {
    try {
        const listKey = `${STORAGE_PREFIX}project_list`;
        const json = localStorage.getItem(listKey);

        if (!json) return [];

        return JSON.parse(json);
    } catch (error) {
        console.error('Failed to get project list:', error);
        return [];
    }
};

/**
 * Update project list
 */
const updateProjectList = (id: string, name: string): void => {
    const list = getProjectList();
    const existingIndex = list.findIndex(p => p.id === id);

    const entry = { id, name, savedAt: Date.now() };

    if (existingIndex >= 0) {
        list[existingIndex] = entry;
    } else {
        list.unshift(entry);
    }

    const listKey = `${STORAGE_PREFIX}project_list`;
    localStorage.setItem(listKey, JSON.stringify(list));
};

/**
 * Remove from project list
 */
const removeFromProjectList = (id: string): void => {
    const list = getProjectList().filter(p => p.id !== id);
    const listKey = `${STORAGE_PREFIX}project_list`;
    localStorage.setItem(listKey, JSON.stringify(list));
};

/**
 * Export project to file
 */
export const exportProjectToFile = (project: Project): void => {
    const serialized = serializeProject(project);
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.wmd`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

/**
 * Import project from file
 */
export const importProjectFromFile = (file: File): Promise<Project | null> => {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const json = e.target?.result as string;
            const project = deserializeProject(json);
            resolve(project);
        };

        reader.onerror = () => {
            console.error('Failed to read file');
            resolve(null);
        };

        reader.readAsText(file);
    });
};

/**
 * Clone element with new ID
 */
export const cloneElement = (element: CanvasElement): CanvasElement => {
    const cloned = JSON.parse(JSON.stringify(element));
    cloned.id = crypto.randomUUID();
    cloned.name = `${element.name} (Copy)`;
    return cloned;
};

/**
 * Clone page with new IDs
 */
export const clonePage = (page: Page): Page => {
    const cloned: Page = {
        ...JSON.parse(JSON.stringify(page)),
        id: crypto.randomUUID(),
        name: `${page.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    // Update all element IDs
    cloned.elements = cloned.elements.map(el => ({
        ...el,
        id: crypto.randomUUID(),
    }));

    return cloned;
};

/**
 * Deep compare two objects
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
    return JSON.stringify(a) === JSON.stringify(b);
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
    return crypto.randomUUID();
};

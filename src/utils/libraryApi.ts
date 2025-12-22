import axios from 'axios';

// API interfaces matching the backend response format
export interface LibraryItem {
    id: string;
    historyId: string;
    url: string;
    type: 'image' | 'video';
    thumbnail?: string;
    prompt?: string;
    model?: string;
    createdAt?: string;
    storagePath?: string;
    mediaId?: string;
    aspectRatio?: string;
    aestheticScore?: number;
    originalUrl?: string;
}

export interface LibraryResponse {
    responseStatus: 'success' | 'error';
    message: string;
    data: {
        items: LibraryItem[];
        nextCursor?: string | number;
        hasMore: boolean;
    };
}

export interface UploadItem {
    id: string;
    historyId: string;
    url: string;
    type: 'image' | 'video';
    thumbnail?: string;
    prompt?: string;
    model?: string;
    createdAt?: string;
    storagePath?: string;
    mediaId?: string;
    originalUrl?: string;
}

export interface UploadResponse {
    responseStatus: 'success' | 'error';
    message?: string;
    data?: {
        items: UploadItem[];
        nextCursor?: string | number;
        hasMore?: boolean;
    };
}

// Get stored auth token from localStorage
const getStoredIdToken = (): string | null => {
    try {
        // Try direct token
        const directToken = localStorage.getItem('authToken');
        if (directToken && directToken.startsWith('eyJ')) {
            return directToken;
        }

        // Try user object
        const userString = localStorage.getItem('user');
        if (userString) {
            const userObj = JSON.parse(userString);
            const token = userObj?.idToken || userObj?.token || null;
            if (token && token.startsWith('eyJ')) {
                return token;
            }
        }

        // Try authToken as JSON object
        if (directToken) {
            try {
                const authToken = JSON.parse(directToken);
                const token = authToken?.accessToken || authToken?.idToken || authToken?.token || null;
                if (token && token.startsWith('eyJ')) {
                    return token;
                }
            } catch {
                if (directToken.startsWith('eyJ')) {
                    return directToken;
                }
            }
        }

        return null;
    } catch (err) {
        console.log('[libraryApi] Error extracting token:', err);
        return null;
    }
};

// Get device ID for API requests
const getDeviceId = (): string => {
    try {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    } catch {
        return `${Date.now()}-${Math.random()}`;
    }
};

// Create configured axios instance for API calls
const getApiClient = () => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-gateway-services-wildmind.onrender.com';
    console.log('[libraryApi] Using API Base URL:', baseURL);

    const client = axios.create({
        baseURL,
        withCredentials: true,
        timeout: 60000,
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        },
    });

    // Add auth interceptor
    client.interceptors.request.use((config: any) => {
        const token = getStoredIdToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['X-Device-Id'] = getDeviceId();
        return config;
    });

    return client;
};

/**
 * Fetch library items (user-generated media) with pagination
 */
export async function fetchLibrary(params: {
    limit?: number;
    cursor?: string;
    nextCursor?: string | number;
    mode?: 'image' | 'video' | 'music' | 'branding' | 'all';
}): Promise<LibraryResponse> {
    try {
        const api = getApiClient();
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.set('limit', String(params.limit));
        if (params.cursor) queryParams.set('cursor', params.cursor);
        if (params.nextCursor !== undefined) queryParams.set('nextCursor', String(params.nextCursor));
        if (params.mode) queryParams.set('mode', params.mode);

        const response = await api.get(`/api/library?${queryParams.toString()}`);
        return response.data;
    } catch (error: any) {
        console.error('[libraryApi] Error fetching library:', error);
        return {
            responseStatus: 'error',
            message: error?.response?.data?.message || error?.message || 'Failed to fetch library',
            data: {
                items: [],
                hasMore: false,
            },
        };
    }
}

/**
 * Fetch upload items (user-uploaded media) with pagination
 */
export async function fetchUploads(params: {
    limit?: number;
    cursor?: string;
    nextCursor?: string | number;
    mode?: 'image' | 'video' | 'music' | 'branding' | 'all';
}): Promise<LibraryResponse> {
    try {
        const api = getApiClient();
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.set('limit', String(params.limit));
        if (params.cursor !== undefined && params.cursor !== null) {
            queryParams.set('cursor', String(params.cursor));
            queryParams.set('nextCursor', String(params.cursor));
        }
        if (params.nextCursor !== undefined && params.nextCursor !== null) {
            queryParams.set('nextCursor', String(params.nextCursor));
            queryParams.set('cursor', String(params.nextCursor));
        }
        if (params.mode) queryParams.set('mode', params.mode);

        const response = await api.get(`/api/uploads?${queryParams.toString()}`);
        return response.data;
    } catch (error: any) {
        console.error('[libraryApi] Error fetching uploads:', error);
        return {
            responseStatus: 'error',
            message: error?.response?.data?.message || error?.message || 'Failed to fetch uploads',
            data: {
                items: [],
                hasMore: false,
            },
        };
    }
}

/**
 * Helper to fetch library page with clean return type
 */
export async function getLibraryPage(
    limit: number = 50,
    nextCursor?: string | number,
    mode?: 'image' | 'video' | 'music' | 'branding' | 'all'
): Promise<{
    items: LibraryItem[];
    nextCursor?: string | number;
    hasMore: boolean;
}> {
    const result = await fetchLibrary({ limit, nextCursor, mode });
    return {
        items: result.data?.items || [],
        nextCursor: result.data?.nextCursor,
        hasMore: result.data?.hasMore || false,
    };
}

/**
 * Helper to fetch uploads page with clean return type
 */
export async function getUploadsPage(
    limit: number = 50,
    nextCursor?: string | number,
    mode?: 'image' | 'video' | 'music' | 'branding' | 'all'
): Promise<{
    items: UploadItem[];
    nextCursor?: string | number;
    hasMore: boolean;
}> {
    const result = await fetchUploads({ limit, nextCursor, mode });
    const items = (result.data?.items || []) as UploadItem[];
    const next = (result as any)?.data?.nextCursor ?? (result as any)?.data?.cursor;
    const hasMore = Boolean((result as any)?.data?.hasMore ?? next);
    return {
        items,
        nextCursor: next,
        hasMore,
    };
}

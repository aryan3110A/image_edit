// Zata CDN URL utilities for transforming storage paths to display URLs

const ZATA_PREFIX = (process.env.NEXT_PUBLIC_ZATA_PREFIX || 'https://idr01.zata.ai/devstoragev1/').replace(/\/$/, '/');

/**
 * Convert a Zata URL or path to a relative storage path
 */
export function toZataPath(urlOrPath: string): string {
    if (!urlOrPath) return '';

    // If the URL starts with the known Zata bucket prefix, strip it
    if (urlOrPath.startsWith(ZATA_PREFIX)) {
        return urlOrPath.substring(ZATA_PREFIX.length);
    }

    // If it's an absolute URL but not Zata, don't treat it as a path
    try {
        const u = new URL(urlOrPath);
        if (!u.href.startsWith(ZATA_PREFIX)) return '';
    } catch {
        // It's a relative path (already a Zata-style path) -> pass through
        return urlOrPath;
    }

    return '';
}

/**
 * Convert a Zata path or URL to a direct CDN URL
 */
export function toDirectUrl(urlOrPath: string): string {
    if (!urlOrPath) return '';

    try {
        const u = new URL(urlOrPath);
        // Already a Zata CDN URL, return as-is
        if (u.href.startsWith(ZATA_PREFIX)) return u.href;
        // Not our CDN, return original
        return urlOrPath;
    } catch {
        // It's a relative path, construct full URL
        return ZATA_PREFIX + urlOrPath.replace(/^\//, '');
    }
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-gateway-services-wildmind.onrender.com').replace(/\/$/, '');

/**
 * Convert a URL to a media proxy URL (for caching/optimization and CORS)
 * We route through the backend proxy which handles CORS headers correctly for canvas.
 */
export function toMediaProxy(urlOrPath: string): string {
    const path = toZataPath(urlOrPath);

    // If it's a Zata path, proxy it
    if (path) {
        return `${API_BASE}/api/proxy/media/${encodeURIComponent(path)}`;
    }

    // If it's an external URL (http/https), we can also proxy it if needed for CORS
    if (urlOrPath.startsWith('http')) {
        return `${API_BASE}/api/proxy/media/${encodeURIComponent(urlOrPath)}`;
    }

    return urlOrPath;
}

/**
 * Get the best display URL for an image item
 * Prefers thumbnail, falls back to full URL
 */
export function getDisplayUrl(item: {
    url?: string;
    thumbnail?: string;
    storagePath?: string;
    originalUrl?: string;
}): string {
    // Priority: thumbnail > storagePath > url > originalUrl
    if (item.thumbnail) {
        // Thumbnails are usually small, we can fetch them directly properly or via proxy
        // For display (<img> tag), direct URL is fine usually, but proxy handles caching well.
        return item.thumbnail.startsWith('http') ? item.thumbnail : toDirectUrl(item.thumbnail);
    }

    if (item.storagePath) {
        return toDirectUrl(item.storagePath);
    }

    if (item.url) {
        return item.url.startsWith('http') ? item.url : toDirectUrl(item.url);
    }

    if (item.originalUrl) {
        return item.originalUrl;
    }

    return '';
}

/**
 * Get the full resolution URL for adding to canvas
 * MUST return a CORS-friendly URL (proxied)
 */
export function getFullResUrl(item: {
    url?: string;
    storagePath?: string;
    originalUrl?: string;
} | string): string {
    // Handle string input
    if (typeof item === 'string') {
        return toMediaProxy(item);
    }

    // Priority: storagePath (full res) > url > originalUrl
    if (item.storagePath) {
        return toMediaProxy(item.storagePath);
    }

    if (item.url) {
        return toMediaProxy(item.url);
    }

    if (item.originalUrl) {
        return toMediaProxy(item.originalUrl);
    }

    return '';
}

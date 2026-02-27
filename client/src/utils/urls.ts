const normalizeBasePath = (baseUrl: string): string => {
    if (!baseUrl) return '/';
    let normalized = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
    if (!normalized.endsWith('/')) normalized = `${normalized}/`;
    return normalized;
};

const BASE_PATH = normalizeBasePath(import.meta.env.BASE_URL ?? '/');

export const withBasePath = (path: string): string => {
    if (path === '/' || path.length === 0) {
        return BASE_PATH;
    }
    const relative = path.startsWith('/') ? path.slice(1) : path;
    return `${BASE_PATH}${relative}`;
};

export const stripBasePath = (pathname: string): string => {
    if (BASE_PATH === '/') return pathname;

    const baseNoTrailingSlash = BASE_PATH.slice(0, -1);
    if (pathname === baseNoTrailingSlash || pathname === BASE_PATH) {
        return '/';
    }
    if (pathname.startsWith(BASE_PATH)) {
        return `/${pathname.slice(BASE_PATH.length)}`;
    }
    return pathname;
};

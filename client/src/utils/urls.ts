const normalizeBasePath = (baseUrl: string): string => {
    if (!baseUrl) return '/';
    let normalized = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
    if (!normalized.endsWith('/')) normalized = `${normalized}/`;
    return normalized;
};

const deriveGithubPagesBasePath = (pathname: string): string | null => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    return `/${parts[0]}/`;
};

const resolveBasePath = (): string => {
    const envBase = normalizeBasePath(import.meta.env.BASE_URL ?? '/');
    if (typeof window === 'undefined') return envBase;

    // Extra safety for GitHub Pages if an old/cached build resolves BASE_URL incorrectly.
    if (window.location.hostname.endsWith('github.io')) {
        const ghBase = deriveGithubPagesBasePath(window.location.pathname);
        if (ghBase) return ghBase;
    }

    return envBase;
};

const BASE_PATH = resolveBasePath();

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

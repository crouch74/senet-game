export const normalizeBasePath = (baseUrl: string): string => {
    if (!baseUrl) return '/';
    let normalized = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
    if (!normalized.endsWith('/')) normalized = `${normalized}/`;
    return normalized;
};

export const deriveGithubPagesBasePath = (pathname: string): string | null => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    return `/${parts[0]}/`;
};

export const resolveBasePath = (
    currentWindow: Pick<Window, 'location'> | undefined = typeof window === 'undefined' ? undefined : window
): string => {
    const envBase = normalizeBasePath(import.meta.env.BASE_URL ?? '/');
    if (!currentWindow) return envBase;

    // Extra safety for GitHub Pages if an old/cached build resolves BASE_URL incorrectly.
    if (currentWindow.location.hostname.endsWith('github.io')) {
        const ghBase = deriveGithubPagesBasePath(currentWindow.location.pathname);
        if (ghBase) return ghBase;
    }

    return envBase;
};

const BASE_PATH = resolveBasePath();

export const withResolvedBasePath = (basePath: string, path: string): string => {
    if (path === '/' || path.length === 0) {
        return basePath;
    }
    const relative = path.startsWith('/') ? path.slice(1) : path;
    return `${basePath}${relative}`;
};

export const withBasePath = (path: string): string => withResolvedBasePath(BASE_PATH, path);

export const stripResolvedBasePath = (basePath: string, pathname: string): string => {
    if (basePath === '/') return pathname;

    const baseNoTrailingSlash = basePath.slice(0, -1);
    if (pathname === baseNoTrailingSlash || pathname === basePath) {
        return '/';
    }
    if (pathname.startsWith(basePath)) {
        return `/${pathname.slice(basePath.length)}`;
    }
    return pathname;
};

export const stripBasePath = (pathname: string): string => stripResolvedBasePath(BASE_PATH, pathname);

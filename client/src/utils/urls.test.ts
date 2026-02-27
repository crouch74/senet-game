import { describe, expect, it } from 'vitest';
import {
  deriveGithubPagesBasePath,
  normalizeBasePath,
  resolveBasePath,
  stripResolvedBasePath,
  stripBasePath,
  withResolvedBasePath,
  withBasePath,
} from './urls';

describe('urls', () => {
  it('normalizes base paths and derives GitHub Pages roots', () => {
    expect(normalizeBasePath('')).toBe('/');
    expect(normalizeBasePath('senet-game')).toBe('/senet-game/');
    expect(normalizeBasePath('/')).toBe('/');
    expect(deriveGithubPagesBasePath('/senet-game/room/abc-def-ghi')).toBe('/senet-game/');
    expect(deriveGithubPagesBasePath('/')).toBeNull();
  });

  it('resolves the GitHub Pages base path from the window location', () => {
    expect(
      resolveBasePath({
        location: {
          hostname: 'aeid.github.io',
          pathname: '/senet-game/room/abc-def-ghi',
        } as Location,
      }),
    ).toBe('/senet-game/');
    expect(resolveBasePath(undefined)).toBe('/');
  });

  it('keeps root paths stable when composing and stripping base paths', () => {
    expect(withBasePath('/')).toBe('/');
    expect(withBasePath('/room/abc-def-ghi')).toBe('/room/abc-def-ghi');
    expect(stripBasePath('/room/abc-def-ghi')).toBe('/room/abc-def-ghi');
  });

  it('composes and strips explicit non-root base paths', () => {
    expect(withResolvedBasePath('/senet-game/', 'room/abc-def-ghi')).toBe(
      '/senet-game/room/abc-def-ghi',
    );
    expect(withResolvedBasePath('/senet-game/', '/room/abc-def-ghi')).toBe(
      '/senet-game/room/abc-def-ghi',
    );
    expect(stripResolvedBasePath('/senet-game/', '/senet-game')).toBe('/');
    expect(stripResolvedBasePath('/senet-game/', '/senet-game/')).toBe('/');
    expect(stripResolvedBasePath('/senet-game/', '/senet-game/room/abc-def-ghi')).toBe(
      '/room/abc-def-ghi',
    );
    expect(stripResolvedBasePath('/senet-game/', '/other/path')).toBe('/other/path');
  });
});

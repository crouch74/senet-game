import { describe, expect, it, vi } from 'vitest';
import { applyTheme, getInitialTheme } from './themePersistence';

describe('themePersistence', () => {
  it('returns the default theme when storage is invalid or unavailable', () => {
    expect(getInitialTheme(null)).toBe('royal');
    expect(getInitialTheme({ getItem: () => 'royal' })).toBe('royal');
    expect(getInitialTheme({ getItem: () => 'invalid' })).toBe('royal');
    expect(
      getInitialTheme({
        getItem: () => {
          throw new Error('blocked');
        },
      }),
    ).toBe('royal');
  });

  it('applies the theme to the document root and persists it', () => {
    const setItem = vi.fn();
    applyTheme('nile-papyrus', {
      root: document.documentElement,
      storage: { setItem },
    });

    expect(document.documentElement.dataset.theme).toBe('nile-papyrus');
    expect(setItem).toHaveBeenCalledWith('senet_theme', 'nile-papyrus');
  });

  it('applies themes without persistence when storage is absent or throws', () => {
    expect(() =>
      applyTheme('royal', {
        root: document.documentElement,
        storage: null,
      }),
    ).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe('royal');

    expect(() =>
      applyTheme('royal', {
        root: document.documentElement,
        storage: {
          setItem: () => {
            throw new Error('blocked');
          },
        },
      }),
    ).not.toThrow();
  });
});

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const clipboard = {
  writeText: vi.fn(() => Promise.resolve()),
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: clipboard,
})

beforeEach(() => {
  clipboard.writeText.mockClear()
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
  document.documentElement.dir = 'ltr'
  delete document.documentElement.dataset.theme
})

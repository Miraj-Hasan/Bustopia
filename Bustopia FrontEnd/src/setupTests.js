import '@testing-library/jest-dom';
import { beforeAll, afterEach, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { configure } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 2000, // Default timeout for async utilities
  eventWrapper: (cb) => {
    let result;
    act(() => {
      result = cb();
    });
    return result;
  },
});

// Establish API mocking before all tests
beforeAll(() => {
  // Reset all mocks before each test suite
  vi.useFakeTimers();
  // Use "modern" timers for better async handling
  vi.setSystemTime(new Date('2024-01-01'));
});

// Clean up after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.useRealTimers();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.ResizeObserver = mockResizeObserver;

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Create storage mock factory
function createStorageMock() {
  const store = new Map();
  return {
    getItem: vi.fn(key => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    clear: vi.fn(() => store.clear()),
    removeItem: vi.fn(key => store.delete(key)),
    length: 0,
    key: vi.fn(index => Array.from(store.keys())[index] || null),
  };
}

// Create separate instances for localStorage and sessionStorage
const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock fetch with controlled timing
window.fetch = vi.fn().mockImplementation(() => 
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: async () => ({}),
        text: async () => '',
        blob: async () => new Blob(),
      });
    }, 100);
  })
);

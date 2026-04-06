import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.electronAPI (not available in test env)
Object.defineProperty(window, 'electronAPI', {
    value: {
        getDbPath: vi.fn().mockResolvedValue('/tmp/test.db'),
        seedLentilleConv: vi.fn().mockResolvedValue({ success: true }),
        factoryReset: vi.fn().mockResolvedValue({ success: true }),
        onUpdateAvailable: vi.fn(),
        onUpdateDownloaded: vi.fn(),
        installUpdate: vi.fn(),
    },
    writable: true,
});

// Mock matchMedia
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

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Suppress console errors from React in tests
const originalError = console.error;
beforeEach(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning:') || args[0].includes('ReactDOM.render'))
        ) {
            return;
        }
        originalError.apply(console, args);
    };
});
afterEach(() => {
    console.error = originalError;
});

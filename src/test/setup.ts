import '@testing-library/jest-dom';

// jsdom doesn't implement ResizeObserver — provide a no-op stub
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

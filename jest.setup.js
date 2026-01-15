import '@testing-library/jest-dom';

// Mock fetch for testing environment
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

// Mock window.URL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-object-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

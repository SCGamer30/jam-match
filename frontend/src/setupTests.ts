// Jest setup file
import "@testing-library/jest-dom";

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveValue(value: string | number): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toHaveLength(length: number): R;
      toContain(item: any): R;
      toContainEqual(item: any): R;
      toBeGreaterThan(value: number): R;
      toBeGreaterThanOrEqual(value: number): R;
      toBeLessThan(value: number): R;
      toBeLessThanOrEqual(value: number): R;
      toBeNull(): R;
      toBe(value: any): R;
      toEqual(value: any): R;
    }
  }
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

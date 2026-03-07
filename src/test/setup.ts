import '@testing-library/jest-dom';

// Mock canvas for tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  strokeRect: vi.fn(),
  stroke: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  roundRect: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

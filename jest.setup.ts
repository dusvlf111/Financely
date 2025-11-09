import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Mock next/image to avoid errors in tests
jest.mock('next/image', () => {
  // require React inside factory to avoid referencing out-of-scope variables
  const React = require('react');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => React.createElement('img', props),
  };
});

const globalPolyfill = globalThis as Record<string, unknown>;

if (!globalPolyfill.TextEncoder) {
  globalPolyfill.TextEncoder = TextEncoder as unknown;
}

if (!globalPolyfill.TextDecoder) {
  globalPolyfill.TextDecoder = TextDecoder as unknown;
}
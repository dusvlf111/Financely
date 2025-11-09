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

const { ReadableStream: NodeReadableStream, WritableStream: NodeWritableStream, TransformStream: NodeTransformStream } = require('node:stream/web');

if (!('ReadableStream' in globalPolyfill)) {
  globalPolyfill.ReadableStream = NodeReadableStream as unknown;
}

if (!('WritableStream' in globalPolyfill)) {
  globalPolyfill.WritableStream = NodeWritableStream as unknown;
}

if (!('TransformStream' in globalPolyfill)) {
  globalPolyfill.TransformStream = NodeTransformStream as unknown;
}

const { fetch: undiciFetch, Request: UndiciRequest, Response: UndiciResponse, Headers: UndiciHeaders } = require('undici') as typeof import('undici');

if (!('fetch' in globalPolyfill) || typeof globalPolyfill.fetch !== 'function') {
  globalPolyfill.fetch = undiciFetch as unknown;
}

if (!('Request' in globalPolyfill)) {
  globalPolyfill.Request = UndiciRequest as unknown;
}

if (!('Response' in globalPolyfill)) {
  globalPolyfill.Response = UndiciResponse as unknown;
}

if (!('Headers' in globalPolyfill)) {
  globalPolyfill.Headers = UndiciHeaders as unknown;
}


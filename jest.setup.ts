import '@testing-library/jest-dom';
import React from 'react';

// Mock next/image to avoid errors in tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props),
}));
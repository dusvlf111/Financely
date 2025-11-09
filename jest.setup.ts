import '@testing-library/jest-dom';

// Mock next/image to avoid errors in tests
jest.mock('next/image', () => {
  // require React inside factory to avoid referencing out-of-scope variables
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('img', props),
  };
});
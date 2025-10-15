// Register jest-dom matchers
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('@testing-library/jest-dom');

import React from 'react';

// Mock next/image to avoid requiring loader
jest.mock('next/image', () => ({ __esModule: true, default: (props: any) => React.createElement('img', props) }));

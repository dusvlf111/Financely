module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react$": "react"
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};

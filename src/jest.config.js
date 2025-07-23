module.exports = {
  preset: 'jest-expo',
  rootDir: '../',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo|@expo|@unimodules)',
  ],
  testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],
};

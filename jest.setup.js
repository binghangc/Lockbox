console.log('💥 [jest.setup.js] Loaded');

const mockAsyncStorage = require('@react-native-async-storage/async-storage/jest/async-storage-mock');

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

console.log('✅ [jest.setup.js] AsyncStorage mocked');

// eslint-disable-next-line no-underscore-dangle
global.__DEV__ = true;

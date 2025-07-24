console.log('💥 [jest.setup.js] Loaded');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

console.log('✅ [jest.setup.js] AsyncStorage mocked');

global.__DEV__ = true;

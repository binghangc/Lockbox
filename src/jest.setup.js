/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-unpublished-import */
import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

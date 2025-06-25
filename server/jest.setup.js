/* global jest */
require('dotenv').config({ path: '.env.server' });

jest.mock('./utils/r2client.js', () => ({
  upload: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      ETag: '"mocked-etag"',
      Location: 'https://mocked-r2-url.com/file.png',
      Bucket: 'mocked-bucket',
      Key: 'mocked-key',
    }),
  }),

  getSignedUrlPromise: jest
    .fn()
    .mockResolvedValue('https://mocked-signed-url.com'),

  getObject: jest.fn().mockReturnValue({
    promise: jest
      .fn()
      .mockResolvedValue({ Body: Buffer.from('mocked content') }),
  }),

  deleteObject: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
  }),
}));

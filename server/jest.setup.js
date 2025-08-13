/* global jest */
require('dotenv').config({ path: '.env.server' });

jest.setTimeout(30000);

jest.mock('./utils/r2client.js', () => {
  const putObject = jest.fn(() => ({
    promise: jest.fn().mockResolvedValue({
      ETag: '"mocked-etag"',
      Location: 'https://mocked-r2-url.com/file.png',
      Bucket: 'mocked-bucket',
      Key: 'mocked-key',
    }),
  }));``

  const getSignedUrlPromise = jest
    .fn()
    .mockResolvedValue('https://mocked-signed-url.com');

  const getObject = jest.fn(() => ({
    promise: jest
      .fn()
      .mockResolvedValue({ Body: Buffer.from('mocked content') }),
  }));

  const deleteObject = jest.fn(() => ({
    promise: jest.fn().mockResolvedValue({}),
  }));

  return {
    putObject,
    getSignedUrlPromise,
    getObject,
    deleteObject,
  };
});

jest.mock('./utils/geminiclient.js', () => ({
  generateVibeCheck: jest
    .fn()
    .mockImplementation(
      ({ itineraryText }) => `Mocked vibecheck for: ${itineraryText}`,
    ),
}));

jest.mock('./encoder.js', () => ({
  __esModule: true,
  default: async () => {
    console.log('[mock encodeToHLS] called');
  },
}));

jest.mock('./utils/r2SignedUrl.js', () => ({
  __esModule: true,
  getDownloadUrl: jest.fn(async (key) => {
    console.log(`[mock getDownloadUrl] called with key: ${key}`);
    return `https://mocked-r2-url.com/${key}`;
  }),
}));

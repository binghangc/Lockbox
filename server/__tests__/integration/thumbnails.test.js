require('dotenv').config({ path: '../server/.env.server' });

const request = require('supertest');
const app = require('../../app.js');

const mockListObjectsPromise = jest.fn();

jest.mock('aws-sdk', () => {
  const mS3 = {
    listObjectsV2: jest.fn(() => ({
      promise: mockListObjectsPromise,
    })),
  };
  return {
    S3: jest.fn(() => mS3),
    Endpoint: jest.fn(),
  };
});

describe('GET /thumbnails', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return a list of thumbnails with name and URL', async () => {
    mockListObjectsPromise.mockResolvedValueOnce({
      Contents: [{ Key: 'thumb1.jpg' }, { Key: 'thumb2.png' }],
    });

    const res = await request(app).get('/thumbnails');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        name: 'thumb1',
        url: `${process.env.R2_PUBLIC_DOMAIN_THUMBNAILS}/thumb1.jpg`,
      },
      {
        name: 'thumb2',
        url: `${process.env.R2_PUBLIC_DOMAIN_THUMBNAILS}/thumb2.png`,
      },
    ]);
  });

  it('should return 500 on S3 error', async () => {
    mockListObjectsPromise.mockRejectedValueOnce(new Error('S3 failure'));

    const res = await request(app).get('/thumbnails');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch thumbnails');
  });
});

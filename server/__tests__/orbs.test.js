jest.mock('../utils/r2SignedUrl.js', () => ({
  getDownloadUrl: jest.fn(),
}));

jest.mock('../utils/supabaseAdminClient.js', () => ({
  from: jest.fn(),
}));

jest.mock('../utils/r2client.js', () => ({
  send: jest.fn(),
}));

jest.mock('../encoder.js', () => jest.fn());

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    readFile: jest.fn().mockResolvedValue('mock-content'),
    writeFileSync: jest.fn().mockResolvedValue(),
    rm: jest.fn().mockResolvedValue(),
    mkdir: jest.fn().mockResolvedValue(),
    createReadStream: jest.fn().mockReturnValue('mocked-stream'),
    readdirSync: jest.fn().mockReturnValue(['file1.ts', 'file2.m3u8']),
    unlinkSync: jest.fn().mockReturnValue(undefined),
    rmSync: jest.fn().mockReturnValue(undefined),
    existsSync: jest.fn().mockReturnValue(true),
  };
});

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app.js');
const supabase = require('../utils/supabaseAdminClient.js');
const r2 = require('../utils/r2client.js');
const encodeToHLS = require('../encoder.js');
const { getDownloadUrl } = require('../utils/r2SignedUrl.js');

describe('GET /vibecheck/:id/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns orb status for a given user and vibecheck', async () => {
    const maybeSingleMock = jest.fn().mockResolvedValue({
      data: { id: 'orb1', created_at: '2025-07-20T00:00:00Z' },
      error: null,
    });

    // Mock first call for maybeSingle()
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: maybeSingleMock,
          }),
        }),
      }),
    });

    // Mock second call for count
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => Promise.resolve({ count: 1, error: null }),
      }),
    });

    const res = await request(app).get(
      '/orbs/vibecheck/vibecheck123/status?userId=user123',
    );
    console.log('Response:', res.statusCode, res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      userHasResponded: true,
      orbId: 'orb1',
      submittedAt: '2025-07-20T00:00:00Z',
      anyoneHasResponded: true,
    });
  });
});

describe('POST /upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload an orb video and return metadata', async () => {
    // Mocks
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({ data: { id: 'orb123' }, error: null }),
        }),
      }),
    });

    r2.send.mockResolvedValue(); // simulate successful upload
    encodeToHLS.mockResolvedValue();

    fs.createReadStream.mockReturnValue('mocked-stream');
    fs.readdirSync.mockReturnValue([]);
    fs.unlinkSync.mockReturnValue();
    fs.rmSync.mockReturnValue();
    fs.existsSync.mockReturnValue(true);

    const tempFilePath = path.join(__dirname, 'mock.mp4');
    fs.writeFileSync(tempFilePath, 'dummy-content');

    const res = await request(app)
      .post('/orbs/upload')
      .field('tripId', 'trip123')
      .field('userId', 'user123')
      .field('vibecheckId', 'vibecheck123')
      .attach('video', Buffer.from('dummy-content'), {
        filename: 'mock.mp4',
        contentType: 'video/mp4',
      });

    fs.unlinkSync(tempFilePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Upload complete');
    expect(res.body.orb).toBeDefined();
  });
});

describe('GET /url', () => {
  it('returns signed URL for valid query', async () => {
    getDownloadUrl.mockResolvedValue('https://r2.example.com/signed-url');

    const res = await request(app)
      .get('/orbs/url')
      .query({ tripId: 'trip123', userId: 'user123', orbId: 'orb123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe('https://r2.example.com/signed-url');
  });

  it('returns 400 if query params are missing', async () => {
    const res = await request(app)
      .get('/orbs/url')
      .query({ tripId: 'trip123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing query parameters/i);
  });

  it('returns 500 if getDownloadUrl throws', async () => {
    getDownloadUrl.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/orbs/url')
      .query({ tripId: 'trip123', userId: 'user123', orbId: 'orb123' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Failed to generate URL/i);
  });
});

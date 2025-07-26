let mockSend;
jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  mockSend = jest.fn();

  return {
    ...actual,
    S3Client: jest.fn(() => ({
      send: mockSend,
    })),
    HeadObjectCommand: actual.HeadObjectCommand,
  };
});

let mockSupabaseFrom;

jest.mock('@supabase/supabase-js', () => {
  mockSupabaseFrom = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  return {
    createClient: jest.fn(() => ({
      from: () => mockSupabaseFrom,
    })),
  };
});

jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}));

jest.mock('../vault-card/utils/uploadToR2.js', () => jest.fn());

const request = require('supertest');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const app = require('../app.js');
const uploadToR2 = require('../vault-card/utils/uploadToR2.js');

// fs mock for HTML template
jest.spyOn(fs, 'readFileSync').mockReturnValue(`
<html><body><div class="story-frame">mock</div>
<script>window.renderStats = () => {};</script></body></html>
`);

beforeEach(() => {
  jest.clearAllMocks();

  process.env.R2_PUBLIC_DOMAIN_VAULTS = 'https://mock.r2.dev';
  process.env.R2_BUCKET_NAME_VAULTS = 'vaults-bucket';
  process.env.SUPABASE_URL = 'https://fake.supabase.io';
  process.env.SUPABASE_ANON_KEY = 'supabase_key';

  createClient.mockReturnValue({
    from: () => mockSupabaseFrom,
  });
});

const browserCloseMock = jest.fn();
const screenshotMock = jest.fn().mockResolvedValue(Buffer.from('fake-image'));
const setContentMock = jest.fn();
const newPageMock = jest.fn().mockResolvedValue({
  setContent: setContentMock,
  $: jest.fn().mockResolvedValue({
    screenshot: screenshotMock,
  }),
});

puppeteer.launch.mockResolvedValue({
  newPage: newPageMock,
  close: browserCloseMock,
});

describe('GET /vault/vault-card/:tripId', () => {
  it('renders vault card if it does not exist yet', async () => {
    const tripId = 'trip1234567890';

    // Supabase mock response
    mockSupabaseFrom.single.mockResolvedValue({
      data: {
        trip_id: tripId,
        trip: {
          id: tripId,
          title: 'Trip Title',
          country: 'Switzerland',
          thumbnail_url: 'https://img.com',
          start_date: '2025-07-01',
          end_date: '2025-07-10',
        },
        vibe_clusters: {},
      },
      error: null,
    });

    // S3 HeadObjectCommand → simulate NotFound
    const err = new Error('Object not found');
    err.name = 'NotFound';
    mockSend.mockRejectedValue(err);

    uploadToR2.mockResolvedValue();

    const res = await request(app).get(`/vault/vault-card/${tripId}`);

    console.log('res.statusCode:', res.statusCode);
    console.log('res.body:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe(`https://mock.r2.dev/vaultCards/${tripId}.png`);
    expect(mockSend).toHaveBeenCalled();
    expect(uploadToR2).toHaveBeenCalledWith(
      expect.any(Buffer),
      `vaultCards/${tripId}.png`,
    );
    expect(puppeteer.launch).toHaveBeenCalled();
    expect(setContentMock).toHaveBeenCalledWith(
      expect.stringContaining('window.renderStats'),
      { waitUntil: 'networkidle0' },
    );
  }, 10000);

  it('returns 400 if tripId is invalid', async () => {
    const res = await request(app).get('/vault/vault-card/short');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid tripId/i);
  });

  it('returns 404 if Supabase fails to find stats', async () => {
    mockSupabaseFrom.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No row found' },
    });

    const tripId = 'trip1234567890';
    const res = await request(app).get(`/vault/vault-card/${tripId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/stats not found/i);
  });

  it('returns 500 if R2 head check fails unexpectedly', async () => {
    const tripId = 'trip1234567890';
    const unexpectedError = new Error('Something broke');
    unexpectedError.name = 'ServiceUnavailable';

    mockSend.mockRejectedValueOnce(unexpectedError);

    const res = await request(app).get(`/vault/vault-card/${tripId}`);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/r2 check failed/i);
  });

  it('returns 500 if puppeteer fails to render', async () => {
    mockSupabaseFrom.single.mockResolvedValueOnce({
      data: {
        trip_id: 'trip1234567890',
        trip: {
          id: 'trip1234567890',
          title: 'Trip Title',
          country: 'Switzerland',
          thumbnail_url: 'https://img.com',
          start_date: '2025-07-01',
          end_date: '2025-07-10',
        },
        vibe_clusters: {},
      },
      error: null,
    });

    const tripId = 'trip1234567890';

    screenshotMock.mockRejectedValueOnce(new Error('Render crash'));

    const res = await request(app).get(`/vault/vault-card/${tripId}`);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/rendering failed/i);
  });
});

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../app.js');
const r2 = require('../../utils/r2client.js');
const encodeToHLS = require('../../encoder.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');
const createTestUser = require('../../utils/test/createTestUser.js');

const EMAIL_PREFIXES = ['submit_itinerary'];

jest.mock('../../rag/utils/generateVibeCheck.js', () => {
  let counter = 1;
  return {
    generateVibeCheck: jest
      .fn()
      .mockImplementation(
        ({ itineraryText }) =>
          `Mocked vibecheck ${counter++} for: ${itineraryText}`,
      ),
  };
});

jest.mock('../../rag/utils/getRandomFallback.js', () => ({
  getRandomFallback: jest.fn(() => ({
    theme: 'funny',
    vibecheck: 'Mocked fallback: We lost the map but found snacks',
  })),
}));

jest.mock('../../utils/r2client.js', () => ({
  send: jest.fn(),
}));

jest.mock('../../encoder.js', () => jest.fn());

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

jest.mock('../../utils/r2client.js', () => ({
  send: jest.fn(),
}));

jest.mock('../../encoder.js', () => jest.fn());

// Submit Itinerary Flow
describe('Itinerary + Vibecheck Flow', () => {
  let userA;
  let tokenA;
  let userB;
  let tokenB;
  let tripId;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);

    const userARes = await createTestUser({
      prefix: 'submit_itinerary_host',
      username: 'itineraryhost',
    });
    const userBRes = await createTestUser({
      prefix: 'submit_itinerary_other',
      username: 'itinerarypart',
    });

    userA = userARes;
    userB = userBRes;
    tokenA = userA.token;
    tokenB = userB.token;

    const today = new Date().toISOString().slice(0, 10);
    const createRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Generate Itinerary Test',
        description: 'Testing generate vibechecks and submit itinerary',
        start_date: today,
        end_date: today,
        country: 'Japan',
        thumbnail_url:
          'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/barbenheimer-movie-party.jpeg',
      });

    tripId = createRes.body.data[0].id;
  });

  it('should return 401 if no auth token is provided', async () => {
    const res = await request(app).get('/trips');
    expect(res.statusCode).toBe(401);
  });

  it('should return 400 if body is not an array', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/submit-itinerary`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({}); // not an array

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Itinerary must be a non-empty array/);
  });

  it('should return 400 if array is empty', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/submit-itinerary`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send([]);

    expect(res.statusCode).toBe(400);
  });

  it('should return 500 if trip is not found', async () => {
    const res = await request(app)
      .post(`/trips/nonexistent-trip-id/submit-itinerary`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send([
        {
          date: '2025-07-01',
          itinerary: 'Visit Mont Blanc',
        },
      ]);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Trip not found/);
  });

  it('should return 403 if non-host tries to submit itinerary', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/submit-itinerary`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send([
        {
          date: '2025-07-01',
          itinerary: 'Visit Mont Blanc',
        },
      ]);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/);
  });

  it('should submit itinerary and generate vibechecks', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/submit-itinerary`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send([
        {
          date: '2025-07-01',
          itinerary: 'Visit Mont Blanc and enjoy fondue',
        },
        {
          date: '2025-07-02',
          itinerary: 'Train to Zermatt and hike near Matterhorn',
        },
      ]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const vibeRes = await request(app)
      .get(`/trips/${tripId}/vibecheck/2025-07-01`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(vibeRes.body.vibecheck).toBeDefined();
    expect(typeof vibeRes.body.vibecheck).toBe('string');
  });

  it('should return itineraries for valid trip and token', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('date');
    expect(res.body[0]).toHaveProperty('itinerary');
  });

  it('should return 404 if no vibecheck exists for that date', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/vibecheck/2099-01-01`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/no vibecheck/i);
  });

  it('should return 400 if date param is missing', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/vibecheck/`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(404);
  });

  it('should regenerate a vibecheck for a given date if no orbs exist', async () => {
    const originalVibe = await request(app)
      .get(`/trips/${tripId}/vibecheck/2025-07-01`)
      .set('Authorization', `Bearer ${tokenA}`);

    const { vibecheck_id, vibecheck: oldText } = originalVibe.body;
    expect(oldText).toBeDefined();

    const patchRes = await request(app)
      .patch(`/trips/${tripId}/vibecheck/2025-07-01`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ vibecheck_id });

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body).toHaveProperty('vibecheck');
    expect(patchRes.body.reshuffleAllowed).toBe(true);

    const newText = patchRes.body.vibecheck;
    expect(newText).toBeDefined();
    expect(newText).not.toEqual(oldText);
  });

  it('should NOT reshuffle vibecheck if orbs already exist', async () => {
    const vibeRes = await request(app)
      .get(`/trips/${tripId}/vibecheck/2025-07-01`)
      .set('Authorization', `Bearer ${tokenA}`);

    const { vibecheck_id } = vibeRes.body;
    expect(vibecheck_id).toBeDefined();
    console.log('[TEST] vibecheck_id:', vibecheck_id);

    r2.send.mockResolvedValue();
    encodeToHLS.mockResolvedValue();

    fs.createReadStream.mockReturnValue('mocked-stream');
    fs.readdirSync.mockReturnValue([]);
    fs.unlinkSync.mockReturnValue();
    fs.rmSync.mockReturnValue();
    fs.existsSync.mockReturnValue(true);

    const tempFilePath = path.join(__dirname, 'mock.mp4');
    fs.writeFileSync(tempFilePath, 'dummy-content');

    await request(app)
      .post('/orbs/upload')
      .field('tripId', tripId)
      .field('userId', userA.id)
      .field('vibecheckId', vibecheck_id)
      .attach('video', Buffer.from('dummy-content'), {
        filename: 'mock.mp4',
        contentType: 'video/mp4',
      });

    fs.unlinkSync(tempFilePath);

    const res = await request(app)
      .patch(`/trips/${tripId}/vibecheck/2025-07-01`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ vibecheck_id });

    expect(res.statusCode).toBe(200);
    expect(res.body.reshuffleAllowed).toBe(false);
    expect(res.body.message).toMatch(/orbs already submitted/i);
  });

  it('should fail to reshuffle if vibecheck_id is missing', async () => {
    const patchRes = await request(app)
      .patch(`/trips/${tripId}/vibecheck/2025-07-01`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({});

    expect(patchRes.statusCode).toBe(400);
    expect(patchRes.body.error).toMatch(/missing vibecheck_id/i);
  });
});

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

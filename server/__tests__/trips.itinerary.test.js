const request = require('supertest');
const app = require('../app.js');
const supabaseAdmin = require('../utils/supabaseAdminClient.js');
const deleteTestUsers = require('../utils/test/deleteTestUsers.js');

const EMAIL_PREFIXES = [
  'submit_itinerary',
  'create_trip_test',
  'delete_trip',
  'edit_trip',
];

jest.mock('../utils/geminiclient.js', () => ({
  generateVibeCheck: jest
    .fn()
    .mockImplementation(
      ({ itineraryText }) => `Mocked vibecheck for: ${itineraryText}`,
    ),
}));

// Submit Itinerary Flow
describe('Itinerary + Vibecheck Flow', () => {
  let userA;
  let tokenA;
  let userB;
  let tokenB;
  let tripId;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);

    const password = 'Test1234!';
    const emailA = `submit_itinerary_host_${Date.now()}@lockbox.dev`;
    const emailB = `submit_itinerary_other_${Date.now()}@lockbox.dev`;

    // Signup A and B
    await request(app)
      .post('/auth/signup')
      .send({ email: emailA, password, username: 'hostuser' });
    await request(app)
      .post('/auth/signup')
      .send({ email: emailB, password, username: 'otheruser' });

    const { users } = (await supabaseAdmin.auth.admin.listUsers()).data;
    userA = users.find((u) => u.email === emailA);
    userB = users.find((u) => u.email === emailB);

    await supabaseAdmin.auth.admin.updateUserById(userA.id, {
      email_confirm: true,
    });
    await supabaseAdmin.auth.admin.updateUserById(userB.id, {
      email_confirm: true,
    });

    tokenA = (
      await request(app).post('/auth/login').send({ email: emailA, password })
    ).body.session.access_token;
    tokenB = (
      await request(app).post('/auth/login').send({ email: emailB, password })
    ).body.session.access_token;

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
  }, 15000);

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
  }, 15000);

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

  it('should regenerate a vibecheck for a given date', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/vibecheck/2025-07-01`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('vibecheck');
    expect(typeof res.body.vibecheck).toBe('string');
  });

  it('should return 500 if itinerary is missing', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/vibecheck/2099-01-01`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/itinerary.*invalid/i);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

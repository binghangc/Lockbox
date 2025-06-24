const request = require('supertest');
const dayjs = require('dayjs');
const app = require('../app.js');
const supabaseAdmin = require('../utils/supabaseAdminClient.js');
const deleteTestUsers = require('../utils/test/deleteTestUsers.js');
const createTestUser = require('../utils/test/createTestUser.js');

const EMAIL_PREFIXES = [
  'trip_test',
  'create_trip_test',
  'delete_trip',
  'edit_trip',
];

// Get Trips Test for dashboard
describe('Trips: Get Flow', () => {
  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });

  it('should return 401 if no auth token is provided', async () => {
    const res = await request(app).get('/trips');
    expect(res.statusCode).toBe(401);
  });

  it('should return an empty friends list for new user', async () => {
    const user = await createTestUser({
      prefix: 'trip_test',
      username: 'triptest',
    });

    const res = await request(app)
      .get('/trips')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Create Trips Flow: upcoming trip
describe('Trips: Post Flow (Upcoming)', () => {
  let user;
  let tripId;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'create_trip_test',
      username: 'createtriptest',
    });
  });

  it('should return 400 error when fields are left blank', async () => {
    const createRes = await request(app)
      .post('/trips/')
      .set('Authorization', `Bearer ${user.token}`)
      .send({});

    expect(createRes.statusCode).toBeGreaterThanOrEqual(400);
    expect(createRes.body.error).toBeDefined();
  });

  it('should return 500 for invalid date format', async () => {
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: 'Test Trip',
        description: 'Test desc',
        start_date: 'invalid-date',
        end_date: 'invalid-date',
        country: 'Malaysia',
        thumbnail_url: '',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/invalid input/);
  });

  it('should create an upcoming trip with valid data', async () => {
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: 'Valid Trip',
        description: 'Some description',
        start_date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        end_date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
        country: 'Japan',
        thumbnail_url:
          'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/barbenheimer-movie-party.jpeg',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Trip created');
    expect(res.body.data).toBeDefined();
    expect(res.body.needsImmediateItinerary).toBe(false);

    tripId = res.body.data[0].id;
  });

  it('should return the correct trip by ID', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', tripId);
    expect(res.body).toHaveProperty('title', 'Valid Trip');
    expect(res.body).toHaveProperty('is_host', true);
    expect(res.body.host).toHaveProperty('id', user.id);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Create Trips Flow: ongoing trip
describe('Trips: Post Flow (Ongoing)', () => {
  let user;
  let tripId;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'create_trip_test',
      username: 'createtriptest',
    });
  });

  it('should create an ongoing trip with valid data', async () => {
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: 'Valid Ongoing Trip',
        description: 'Some description',
        start_date: dayjs().format('YYYY-MM-DD'),
        end_date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
        country: 'Japan',
        thumbnail_url:
          'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/barbenheimer-movie-party.jpeg',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Trip created');
    expect(res.body.data).toBeDefined();
    expect(res.body.needsImmediateItinerary).toBe(true);
    expect(res.body.data[0].status).toBe('ongoing');

    tripId = res.body.data[0].id;
  });

  it('should return the correct trip by ID', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', tripId);
    expect(res.body).toHaveProperty('title', 'Valid Ongoing Trip');
    expect(res.body).toHaveProperty('is_host', true);
    expect(res.body.host).toHaveProperty('id', user.id);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Delete Trip route
describe('Trips: Delete Flow', () => {
  let userA;
  let userB;
  let tripId;

  beforeAll(async () => {
    userA = await createTestUser({
      prefix: 'delete_trip_host',
      username: 'hostuser',
    });
    userB = await createTestUser({
      prefix: 'delete_trip_other',
      username: 'otheruser',
    });

    const today = new Date().toISOString().slice(0, 10);
    const createRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        title: 'Trip to Delete',
        description: 'Testing deletion',
        start_date: today,
        end_date: today,
        country: 'Japan',
        thumbnail_url:
          'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/barbenheimer-movie-party.jpeg',
      });

    tripId = createRes.body.data[0].id;
  }, 15000);

  it('should return 403 when trying to delete trip as non-host', async () => {
    const res = await request(app)
      .delete(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/not the trip owner/i);
  });

  it('should allow the host to delete their trip', async () => {
    const res = await request(app)
      .delete(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 403 or 500 when trying to delete already-deleted trip', async () => {
    const res = await request(app)
      .delete(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    console.log(res.statusCode);
    expect([403, 500, 404]).toContain(res.statusCode);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Edit Trips flow
describe('Trips: Edit Flow', () => {
  let hostUser;
  let partUser;
  let tripId;

  beforeAll(async () => {
    hostUser = await createTestUser({
      prefix: 'edit_trip_host',
      username: 'hostuser',
    });
    partUser = await createTestUser({
      prefix: 'edit_trip_nonhost',
      username: 'partuser',
    });

    const today = new Date().toISOString().slice(0, 10);
    const tripRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${hostUser.token}`)
      .send({
        title: 'Edit Trip Test',
        description: 'Testing editing',
        start_date: today,
        end_date: today,
        country: 'France',
        thumbnail_url: '',
      });

    tripId = tripRes.body.data[0].id;

    // Manually insert participant
    await supabaseAdmin
      .from('participants')
      .insert([{ trip_id: tripId, user_id: partUser.id, role: 'participant' }]);
  }, 15000);

  it('should update trip successfully for host', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/edit`)
      .set('Authorization', `Bearer ${hostUser.token}`)
      .send({ title: 'Updated Trip Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.trip.title).toBe('Updated Trip Title');
    expect(res.body.message).toMatch(/updated successfully/i);
  });

  it('should return 400 if non-host tries to edit trip', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/edit`)
      .set('Authorization', `Bearer ${partUser.token}`)
      .send({ title: 'Malicious Edit' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/only hosts can edit/i);
  });

  it('should return 401 if no auth token is provided', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/edit`)
      .send({ title: 'No Token Edit' });

    expect(res.statusCode).toBe(401);
  });

  it('should fail gracefully with empty update payload', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/edit`)
      .set('Authorization', `Bearer ${hostUser.token}`)
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

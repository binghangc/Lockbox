const request = require('supertest');
const app = require('../../app.js');
const supabaseAdmin = require('../../utils/supabaseAdminClient.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');
const createTestUser = require('../../utils/test/createTestUser.js');

const EMAIL_PREFIXES = ['leave_trip', 'participants'];

// Leave Trip route
describe('Trips: Leave Trip Flow', () => {
  let hostToken;
  let partToken;
  let tripId;

  beforeAll(async () => {
    const hostUser = await createTestUser({
      prefix: 'leave_trip_host',
      username: 'leavetriphost',
    });
    const partUser = await createTestUser({
      prefix: 'leave_trip_participant',
      username: 'leavetrippart',
    });

    hostToken = hostUser.token;
    partToken = partUser.token;

    const today = new Date().toISOString().slice(0, 10);
    const tripRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Leave Trip Test',
        description: 'Testing leaving',
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
  });

  it('should allow a participant to leave the trip', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/leave`)
      .set('Authorization', `Bearer ${partToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should not allow host to leave their own trip', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/leave`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/host cannot leave/i);
  });

  it('should succeed silently if non-participant tries to leave', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/leave`)
      .set('Authorization', `Bearer ${partToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// Get Participants
describe('Trips: Get Participants Flow', () => {
  let tripId;
  let hostUser;
  let partUser;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);

    hostUser = await createTestUser({
      prefix: 'participants_host',
      username: 'getparthost',
    });
    partUser = await createTestUser({
      prefix: 'participants_nonhost',
      username: 'getpartpart',
    });

    const today = new Date().toISOString().slice(0, 10);
    const tripRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${hostUser.token}`)
      .send({
        title: 'Test Trip',
        description: 'Testing participants',
        start_date: today,
        end_date: today,
        country: 'Malaysia',
        thumbnail_url: '',
      });

    tripId = tripRes.body.data[0].id;

    await supabaseAdmin
      .from('participants')
      .insert([{ trip_id: tripId, user_id: partUser.id, role: 'participant' }]);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get(`/trips/${tripId}/participants`);
    expect(res.statusCode).toBe(401);
  });

  it('host should see participant profiles', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/participants`)
      .set('Authorization', `Bearer ${hostUser.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const participant = res.body.find((p) => p.user_id === partUser.id);
    expect(participant).toBeDefined();
    expect(participant.profile).toHaveProperty('username', 'getpartpart');
  });

  it('participants should see participant profiles', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/participants`)
      .set('Authorization', `Bearer ${partUser.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const participant = res.body.find((p) => p.user_id === partUser.id);
    expect(participant).toBeDefined();
    expect(participant.profile).toHaveProperty('username', 'getpartpart');
  });
});

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

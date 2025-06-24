const request = require('supertest');
const app = require('../app.js');
const supabaseAdmin = require('../utils/supabaseAdminClient.js');

const EMAIL_PREFIXES = ['leave_trip', 'participants'];

async function deleteTestUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error.message);
    return;
  }

  const { users } = data;

  const testUsers = users.filter(
    (u) =>
      u.email.endsWith('@lockbox.dev') &&
      EMAIL_PREFIXES.some((prefix) => u.email.startsWith(prefix)),
  );

  await Promise.all(
    testUsers.map((user) => {
      console.log(`Deleting test user: ${user.email}`);
      return supabaseAdmin.auth.admin.deleteUser(user.id);
    }),
  );
}

// Leave Trip route
describe('Trips: Leave Trip Flow', () => {
  let hostToken;
  let participantToken;
  let tripId;

  beforeAll(async () => {
    const password = 'Test1234!';
    const ts = Date.now();
    const hostEmail = `leave_trip_host_${ts}@lockbox.dev`;
    const partEmail = `leave_trip_participant_${ts}@lockbox.dev`;

    await request(app)
      .post('/auth/signup')
      .send({ email: hostEmail, password, username: 'hostuser' });
    await request(app)
      .post('/auth/signup')
      .send({ email: partEmail, password, username: 'partuser' });

    const { users } = (await supabaseAdmin.auth.admin.listUsers()).data;
    const hostUser = users.find((u) => u.email === hostEmail);
    const partUser = users.find((u) => u.email === partEmail);

    await supabaseAdmin.auth.admin.updateUserById(hostUser.id, {
      email_confirm: true,
    });
    await supabaseAdmin.auth.admin.updateUserById(partUser.id, {
      email_confirm: true,
    });

    hostToken = (
      await request(app)
        .post('/auth/login')
        .send({ email: hostEmail, password })
    ).body.session.access_token;
    participantToken = (
      await request(app)
        .post('/auth/login')
        .send({ email: partEmail, password })
    ).body.session.access_token;

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
  }, 15000);

  it('should allow a participant to leave the trip', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/leave`)
      .set('Authorization', `Bearer ${participantToken}`);

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
      .set('Authorization', `Bearer ${participantToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// Get Participants
describe('Trips: Get Participants Flow', () => {
  let tripId;
  let hostToken;
  let partToken;
  let partUser;

  beforeAll(async () => {
    await deleteTestUsers();

    const hostEmail = `participants_host_${Date.now()}@lockbox.dev`;
    const password = 'Test123!';
    await request(app).post('/auth/signup').send({
      email: hostEmail,
      password,
      username: 'hostuser',
    });

    const partEmail = `participants_nonhost${Date.now()}@lockbox.dev`;
    await request(app).post('/auth/signup').send({
      email: partEmail,
      password,
      username: 'participantuser',
    });

    const { users } = (await supabaseAdmin.auth.admin.listUsers()).data;
    const hostUser = users.find((u) => u.email === hostEmail);
    partUser = users.find((u) => u.email === partEmail);

    await supabaseAdmin.auth.admin.updateUserById(hostUser.id, {
      email_confirm: true,
    });
    await supabaseAdmin.auth.admin.updateUserById(partUser.id, {
      email_confirm: true,
    });

    const loginHost = await request(app).post('/auth/login').send({
      email: hostEmail,
      password,
    });
    hostToken = loginHost.body.session.access_token;

    const today = new Date().toISOString().slice(0, 10);
    const tripRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Test Trip',
        description: 'Testing participants',
        start_date: today,
        end_date: today,
        country: 'Malaysia',
        thumbnail_url: '',
      });

    tripId = tripRes.body.data[0].id;

    const loginPart = await request(app).post('/auth/login').send({
      email: partEmail,
      password,
    });
    partToken = loginPart.body.session.access_token;

    await supabaseAdmin
      .from('participants')
      .insert([{ trip_id: tripId, user_id: partUser.id, role: 'participant' }]);
  }, 15000);

  it('should return 401 without token', async () => {
    const res = await request(app).get(`/trips/${tripId}/participants`);
    expect(res.statusCode).toBe(401);
  });

  it('host should see participant profiles', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/participants`)
      .set('Authorization', `Bearer ${hostToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const participant = res.body.find((p) => p.user_id === partUser.id);
    expect(participant).toBeDefined();
    expect(participant.profile).toHaveProperty('username', 'participantuser');
  });

  it('participants should see participant profiles', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/participants`)
      .set('Authorization', `Bearer ${partToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const participant = res.body.find((p) => p.user_id === partUser.id);
    expect(participant).toBeDefined();
    expect(participant.profile).toHaveProperty('username', 'participantuser');
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

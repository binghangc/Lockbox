const request = require('supertest');
const dayjs = require('dayjs');
const app = require('../app.js');
const supabaseAdmin = require('../utils/supabaseAdminClient.js');

const EMAIL_PREFIXES = [
  'trip_test',
  'create_trip_test',
  'delete_trip',
  'edit_trip',
];

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

// Get Trips Test for dashboard
describe('Trips: Get Flow', () => {
  beforeAll(async () => {
    await deleteTestUsers();
  });

  it('should return 401 if no auth token is provided', async () => {
    const res = await request(app).get('/trips');
    expect(res.statusCode).toBe(401);
  });

  it('should return an empty friends list for new user', async () => {
    const testEmail = `trip_test_${Date.now()}@lockbox.dev`;
    const password = 'Test1234!';

    await request(app).post('/auth/signup').send({
      email: testEmail,
      password,
      username: 'triptest',
    });

    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const { users } = data;

    const user = users.find((u) => u.email === testEmail);
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    const loginRes = await request(app).post('/auth/login').send({
      email: testEmail,
      password,
    });

    const token = loginRes.body.session.access_token;

    const res = await request(app)
      .get('/trips')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// Create Trips Flow: upcoming trip
describe('Trips: Post Flow (Upcoming)', () => {
  let user;
  let token;
  let tripId;

  beforeAll(async () => {
    const timestamp = Date.now();
    const testEmail = `create_trip_test_${timestamp}@lockbox.dev`;
    const password = 'Test1234!';

    await request(app).post('/auth/signup').send({
      email: testEmail,
      password,
      username: `createtriptest`,
    });

    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const { users } = data;

    user = users.find((u) => u.email === testEmail);

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    const loginRes = await request(app).post('/auth/login').send({
      email: testEmail,
      password,
    });
    token = loginRes.body.session.access_token;
  });

  it('should return 400 error when fields are left blank', async () => {
    const createRes = await request(app)
      .post('/trips/')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(createRes.statusCode).toBeGreaterThanOrEqual(400);
    expect(createRes.body.error).toBeDefined();
  });

  it('should return 500 for invalid date format', async () => {
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', tripId);
    expect(res.body).toHaveProperty('title', 'Valid Trip');
    expect(res.body).toHaveProperty('is_host', true);
    expect(res.body.host).toHaveProperty('id', user.id);
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// Create Trips Flow: ongoing trip
describe('Trips: Post Flow (Ongoing)', () => {
  let user;
  let token;
  let tripId;

  beforeAll(async () => {
    const timestamp = Date.now();
    const testEmail = `create_trip_test_${timestamp}@lockbox.dev`;
    const password = 'Test1234!';

    await request(app).post('/auth/signup').send({
      email: testEmail,
      password,
      username: `createtriptest`,
    });

    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const { users } = data;

    user = users.find((u) => u.email === testEmail);

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    const loginRes = await request(app).post('/auth/login').send({
      email: testEmail,
      password,
    });
    token = loginRes.body.session.access_token;
  });

  it('should create an ongoing trip with valid data', async () => {
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', tripId);
    expect(res.body).toHaveProperty('title', 'Valid Ongoing Trip');
    expect(res.body).toHaveProperty('is_host', true);
    expect(res.body.host).toHaveProperty('id', user.id);
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// Delete Trip route
describe('Trips: Delete Flow', () => {
  let userA;
  let tokenA;
  let userB;
  let tokenB;
  let tripId;

  beforeAll(async () => {
    const password = 'Test1234!';
    const emailA = `delete_trip_host_${Date.now()}@lockbox.dev`;
    const emailB = `delete_trip_other_${Date.now()}@lockbox.dev`;

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
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/not the trip owner/i);
  });

  it('should allow the host to delete their trip', async () => {
    const res = await request(app)
      .delete(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 403 or 500 when trying to delete already-deleted trip', async () => {
    const res = await request(app)
      .delete(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    console.log(res.statusCode);
    expect([403, 500, 404]).toContain(res.statusCode);
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// Edit Trips flow
describe('Trips: Edit Flow', () => {
  let hostToken;
  let nonHostToken;
  let tripId;

  beforeAll(async () => {
    const password = 'Test1234!';
    const ts = Date.now();
    const hostEmail = `edit_trip_host_${ts}@lockbox.dev`;
    const nonHostEmail = `edit_trip_nonhost_${ts}@lockbox.dev`;

    await request(app)
      .post('/auth/signup')
      .send({ email: hostEmail, password, username: 'hostuser' });
    await request(app)
      .post('/auth/signup')
      .send({ email: nonHostEmail, password, username: 'nonhostuser' });

    const { users } = (await supabaseAdmin.auth.admin.listUsers()).data;
    const hostUser = users.find((u) => u.email === hostEmail);
    const nonHostUser = users.find((u) => u.email === nonHostEmail);

    await supabaseAdmin.auth.admin.updateUserById(hostUser.id, {
      email_confirm: true,
    });
    await supabaseAdmin.auth.admin.updateUserById(nonHostUser.id, {
      email_confirm: true,
    });

    hostToken = (
      await request(app)
        .post('/auth/login')
        .send({ email: hostEmail, password })
    ).body.session.access_token;
    nonHostToken = (
      await request(app)
        .post('/auth/login')
        .send({ email: nonHostEmail, password })
    ).body.session.access_token;

    const today = new Date().toISOString().slice(0, 10);
    const tripRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${hostToken}`)
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
      .insert([
        { trip_id: tripId, user_id: nonHostUser.id, role: 'participant' },
      ]);
  }, 15000);

  it('should update trip successfully for host', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/edit`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ title: 'Updated Trip Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.trip.title).toBe('Updated Trip Title');
    expect(res.body.message).toMatch(/updated successfully/i);
  });

  it('should return 400 if non-host tries to edit trip', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/edit`)
      .set('Authorization', `Bearer ${nonHostToken}`)
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
      .set('Authorization', `Bearer ${hostToken}`)
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

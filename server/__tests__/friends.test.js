const request = require('supertest');
const app = require('../app.js');
const supabaseAdmin = require('../utils/supabaseAdminClient.js');

const EMAIL_PREFIXES = ['friend_test', 'send_request_test'];

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

// Get Friends Test
describe('Friends: Get Flow', () => {
  beforeAll(async () => {
    await deleteTestUsers();
  });

  it('should return 401 if no auth token is provided', async () => {
    const res = await request(app).get('/friends');
    expect(res.statusCode).toBe(401);
  });

  it('should return an empty friends list for new user', async () => {
    const testEmail = `friend_test_${Date.now()}@lockbox.dev`;
    const password = 'Test1234!';

    await request(app).post('/auth/signup').send({
      email: testEmail,
      password,
      username: 'friendtest',
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
      .get('/friends')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// Accept Friend Request Test
describe('Friends: Accept Request Flow', () => {
  let userA;
  let userB;
  let tokenA;

  beforeAll(async () => {
    const timestamp = Date.now();
    const testEmailA = `send_request_test_a_${timestamp}@lockbox.dev`;
    const testEmailB = `send_request_test_b_${timestamp}@lockbox.dev`;
    const password = 'Test1234!';

    // Sign up both users
    await request(app).post('/auth/signup').send({
      email: testEmailA,
      password,
      username: `sendrequesta`,
    });

    await request(app).post('/auth/signup').send({
      email: testEmailB,
      password,
      username: `sendrequestb`,
    });

    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const { users } = data;

    userA = users.find((u) => u.email === testEmailA);
    userB = users.find((u) => u.email === testEmailB);
    await Promise.all([
      supabaseAdmin.auth.admin.updateUserById(userA.id, {
        email_confirm: true,
      }),
      supabaseAdmin.auth.admin.updateUserById(userB.id, {
        email_confirm: true,
      }),
    ]);

    const loginRes = await request(app).post('/auth/login').send({
      email: testEmailA,
      password,
    });
    tokenA = loginRes.body.session.access_token;
  });

  it('should send a friend request and return success', async () => {
    const sendRes = await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ uid1: userA.id, uid2: userB.id })
      .expect(200);

    expect(sendRes.statusCode).toBe(200);
    expect(sendRes.body).toHaveProperty(
      'message',
      'Friend request sent successfully',
    );
  });

  it('should show the friend request as pending for userB', async () => {
    const loginResB = await request(app).post('/auth/login').send({
      email: userB.email,
      password: 'Test1234!',
    });

    const tokenB = loginResB.body.session.access_token;

    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(pendingRes.statusCode).toBe(200);

    const friend = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.sender?.username === 'sendrequesta',
    );

    expect(friend).toBeDefined();
    expect(friend.status).toBe('pending');
  });

  it('should show the friend request as accepted once userB accepts', async () => {
    const loginResB = await request(app).post('/auth/login').send({
      email: userB.email,
      password: 'Test1234!',
    });

    const tokenB = loginResB.body.session.access_token;

    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${tokenB}`);

    const requestToAccept = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.uid2 === userB.id,
    );

    expect(requestToAccept).toBeDefined();

    const acceptedRes = await request(app)
      .patch('/friends/accept-request')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        id: requestToAccept.id,
        uid1: userA.id,
        uid2: userB.id,
      });

    expect(acceptedRes.statusCode).toBe(200);
    expect(acceptedRes.body.message).toBe(
      'Friend request accepted successfully',
    );

    const friendsRes = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${tokenB}`);

    const newFriend = friendsRes.body.find(
      (f) => f.username === 'sendrequesta',
    );

    expect(newFriend).toBeDefined();
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// Reject Friend Request Test
describe('Friends: Reject Request Flow', () => {
  let userA;
  let userB;
  let tokenA;

  beforeAll(async () => {
    const timestamp = Date.now();
    const testEmailA = `send_request_test_a_${timestamp}@lockbox.dev`;
    const testEmailB = `send_request_test_b_${timestamp}@lockbox.dev`;
    const password = 'Test1234!';

    // Sign up both users
    await request(app).post('/auth/signup').send({
      email: testEmailA,
      password,
      username: `sendrequesta`,
    });

    await request(app).post('/auth/signup').send({
      email: testEmailB,
      password,
      username: `sendrequestb`,
    });

    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const { users } = data;

    userA = users.find((u) => u.email === testEmailA);
    userB = users.find((u) => u.email === testEmailB);
    await Promise.all([
      supabaseAdmin.auth.admin.updateUserById(userA.id, {
        email_confirm: true,
      }),
      supabaseAdmin.auth.admin.updateUserById(userB.id, {
        email_confirm: true,
      }),
    ]);

    const loginRes = await request(app).post('/auth/login').send({
      email: testEmailA,
      password,
    });
    tokenA = loginRes.body.session.access_token;
  });

  it('should send a friend request and return success', async () => {
    const sendRes = await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ uid1: userA.id, uid2: userB.id })
      .expect(200);

    expect(sendRes.statusCode).toBe(200);
    expect(sendRes.body).toHaveProperty(
      'message',
      'Friend request sent successfully',
    );
  });

  it('should show the friend request as pending for userB', async () => {
    const loginResB = await request(app).post('/auth/login').send({
      email: userB.email,
      password: 'Test1234!',
    });

    const tokenB = loginResB.body.session.access_token;

    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(pendingRes.statusCode).toBe(200);

    const friend = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.sender?.username === 'sendrequesta',
    );

    expect(friend).toBeDefined();
    expect(friend.status).toBe('pending');
  });

  it('should show the friend request as rejected once userB rejects', async () => {
    const loginResB = await request(app).post('/auth/login').send({
      email: userB.email,
      password: 'Test1234!',
    });

    const tokenB = loginResB.body.session.access_token;

    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${tokenB}`);

    const requestToReject = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.uid2 === userB.id,
    );

    expect(requestToReject).toBeDefined();

    const rejectedRes = await request(app)
      .patch('/friends/reject-request')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        id: requestToReject.id,
        uid1: userA.id,
        uid2: userB.id,
      });

    expect(rejectedRes.statusCode).toBe(200);
    expect(rejectedRes.body.message).toBe(
      'Friend request rejected successfully',
    );
    // TODO: query reject requests
  });

  afterAll(async () => {
    await deleteTestUsers();
  });
});

// TODO: route for remove friendship

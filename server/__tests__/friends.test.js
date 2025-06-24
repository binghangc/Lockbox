const request = require('supertest');
const app = require('../app.js');
const deleteTestUsers = require('../utils/test/deleteTestUsers.js');
const createTestUser = require('../utils/test/createTestUser.js');

const EMAIL_PREFIXES = ['friend_test', 'send_request_test'];

// Get Friends Test
describe('Friends: Get Flow', () => {
  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });

  it('should return 401 if no auth token is provided', async () => {
    const res = await request(app).get('/friends');
    expect(res.statusCode).toBe(401);
  });

  it('should return an empty friends list for new user', async () => {
    const user = await createTestUser({
      prefix: 'friend_test',
      username: 'friendtest',
    });

    const res = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Accept Friend Request Test
describe('Friends: Accept Request Flow', () => {
  let userA;
  let userB;

  beforeAll(async () => {
    userA = await createTestUser({
      prefix: 'send_request_test_a',
      username: 'sendrequesta',
    });
    userB = await createTestUser({
      prefix: 'send_request_test_b',
      username: 'sendrequestb',
    });
  });

  it('should send a friend request and return success', async () => {
    const sendRes = await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ uid1: userA.id, uid2: userB.id })
      .expect(200);

    expect(sendRes.statusCode).toBe(200);
    expect(sendRes.body).toHaveProperty(
      'message',
      'Friend request sent successfully',
    );
  });

  it('should show the friend request as pending for userB', async () => {
    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${userB.token}`);

    expect(pendingRes.statusCode).toBe(200);

    const friend = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.sender?.username === 'sendrequesta',
    );

    expect(friend).toBeDefined();
    expect(friend.status).toBe('pending');
  });

  it('should show the friend request as accepted once userB accepts', async () => {
    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${userB.token}`);

    const requestToAccept = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.uid2 === userB.id,
    );

    expect(requestToAccept).toBeDefined();

    const acceptedRes = await request(app)
      .patch('/friends/accept-request')
      .set('Authorization', `Bearer ${userB.token}`)
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
      .set('Authorization', `Bearer ${userB.token}`);

    const newFriend = friendsRes.body.find(
      (f) => f.username === 'sendrequesta',
    );

    expect(newFriend).toBeDefined();
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Reject Friend Request Test
describe('Friends: Reject Request Flow', () => {
  let userA;
  let userB;

  beforeAll(async () => {
    userA = await createTestUser({
      prefix: 'send_request_test_a',
      username: 'sendrequesta',
    });
    userB = await createTestUser({
      prefix: 'send_request_test_b',
      username: 'sendrequestb',
    });
  });

  it('should send a friend request and return success', async () => {
    const sendRes = await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ uid1: userA.id, uid2: userB.id })
      .expect(200);

    expect(sendRes.statusCode).toBe(200);
    expect(sendRes.body).toHaveProperty(
      'message',
      'Friend request sent successfully',
    );
  });

  it('should show the friend request as pending for userB', async () => {
    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${userB.token}`);

    expect(pendingRes.statusCode).toBe(200);

    const friend = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.sender?.username === 'sendrequesta',
    );

    expect(friend).toBeDefined();
    expect(friend.status).toBe('pending');
  });

  it('should show the friend request as rejected once userB rejects', async () => {
    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${userB.token}`);

    const requestToReject = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.uid2 === userB.id,
    );

    expect(requestToReject).toBeDefined();

    const rejectedRes = await request(app)
      .patch('/friends/reject-request')
      .set('Authorization', `Bearer ${userB.token}`)
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
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// TODO: route for remove friendship

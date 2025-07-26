const request = require('supertest');
const app = require('../../app.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');
const createTestUser = require('../../utils/test/createTestUser.js');

const EMAIL_PREFIXES = [
  'friend_test',
  'accept_request_test',
  'reject_request_test',
  'remove_test',
  'search_test_a',
  'search_test_b',
  'search_test_c',
];

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
      prefix: 'accept_request_test_a',
      username: 'sendreqaccepta',
    });
    userB = await createTestUser({
      prefix: 'accept_request_test_b',
      username: 'sendreqacceptb',
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
      (req) =>
        req.uid1 === userA.id && req.sender?.username === 'sendreqaccepta',
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
      (f) => f.username === 'sendreqaccepta',
    );

    expect(newFriend).toBeDefined();
  });
});

// Reject Friend Request Test
describe('Friends: Reject Request Flow', () => {
  let userA;
  let userB;

  beforeAll(async () => {
    userA = await createTestUser({
      prefix: 'reject_request_test_a',
      username: 'sendreqrejecta',
    });
    userB = await createTestUser({
      prefix: 'reject_request_test_b',
      username: 'sendreqrejectb',
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
      (req) =>
        req.uid1 === userA.id && req.sender?.username === 'sendreqrejecta',
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
  });
});

// Remove Friendship Flow
describe('Friends: Remove Flow', () => {
  let userA;
  let userB;

  beforeAll(async () => {
    await deleteTestUsers(['remove_test_a', 'remove_test_b']);

    userA = await createTestUser({
      prefix: 'remove_test_a',
      username: 'removea',
    });
    userB = await createTestUser({
      prefix: 'remove_test_b',
      username: 'removeb',
    });

    // Send request A to B and accept
    await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ uid1: userA.id, uid2: userB.id });

    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${userB.token}`);

    const friendRequest = pendingRes.body.find(
      (req) => req.uid1 === userA.id && req.uid2 === userB.id,
    );

    expect(friendRequest).toBeDefined();

    await request(app)
      .patch('/friends/accept-request')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        id: friendRequest.id,
        uid1: userA.id,
        uid2: userB.id,
      });
  });

  it('should successfully remove a friend', async () => {
    const res = await request(app)
      .delete(`/friends/remove/${userB.id}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it("should confirm the friend is no longer in A's friend list", async () => {
    const res = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${userA.token}`);

    const stillFriend = res.body.find((f) => f.id === userB.id);
    expect(stillFriend).toBeUndefined();
  });
});

describe('Friends: Search Flow', () => {
  let userA;
  let userB;
  let userC;

  beforeAll(async () => {
    userA = await createTestUser({
      prefix: 'search_test_a',
      username: 'alpha',
    });
    userB = await createTestUser({
      prefix: 'search_test_b',
      username: 'betamax',
    });
    userC = await createTestUser({
      prefix: 'search_test_c',
      username: 'alphabuddy',
    });

    // A sends request to B (pending)
    await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ uid1: userA.id, uid2: userB.id });

    // C sends request to A (incoming)
    await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${userC.token}`)
      .send({ uid1: userC.id, uid2: userA.id });
  });

  it('should return 400 if no username is provided', async () => {
    const res = await request(app)
      .get('/friends/search')
      .set('Authorization', `Bearer ${userA.token}`);
    expect(res.statusCode).toBe(400);
  });

  it('should return matching users with correct status', async () => {
    const res = await request(app)
      .get('/friends/search?username=alpha')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const foundB = res.body.find((u) => u.id === userB.id);
    const foundC = res.body.find((u) => u.id === userC.id);

    expect(foundB).toBeUndefined(); // username doesn’t match 'alpha'
    expect(foundC).toBeDefined();
    expect(foundC.status).toBe('incoming');
  });

  it('should show pending status for sent requests', async () => {
    const res = await request(app)
      .get('/friends/search?username=betamax')
      .set('Authorization', `Bearer ${userA.token}`);

    const found = res.body.find((u) => u.id === userB.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');
  });

  it('should return "none" status for unrelated users', async () => {
    const res = await request(app)
      .get('/friends/search?username=betamax')
      .set('Authorization', `Bearer ${userC.token}`); // C has no relation to B

    const found = res.body.find((u) => u.id === userB.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('none');
  });
});

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

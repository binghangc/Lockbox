const request = require('supertest');
const app = require('../../app.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');
const createTestUser = require('../../utils/test/createTestUser.js');

const EMAIL_PREFIXES = [
  'friend_base_user',
  'friend_target_user',
  'friend_extra_user',
];

let userA;
let userB;
let userC;

beforeAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);

  userA = await createTestUser({
    prefix: 'friend_base_user',
    username: 'friendbase',
  });
  userB = await createTestUser({
    prefix: 'friend_target_user',
    username: 'friendtarget',
  });
  userC = await createTestUser({
    prefix: 'friend_extra_user',
    username: 'friendextra',
  });
});

// Get Friends Test
describe('Friends: Get Flow', () => {
  it('should return 401 if no auth token is provided', async () => {
    const res = await request(app).get('/friends');
    expect(res.statusCode).toBe(401);
  });

  it('should return an empty friends list for new user', async () => {
    const res = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// Accept Friend Request Test
describe('Friends: Accept Request Flow', () => {
  it('should send a friend request and return success', async () => {
    const sendRes = await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ uid1: userA.id, uid2: userB.id });

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
      (req) => req.uid1 === userA.id && req.sender?.username === 'friendbase',
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

    const newFriend = friendsRes.body.find((f) => f.username === 'friendbase');

    expect(newFriend).toBeDefined();
  });
});

// Reject Friend Request Test
describe('Friends: Reject Request Flow', () => {
  it('should send a friend request and return success', async () => {
    const sendRes = await request(app)
      .post('/friends/send-request')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ uid1: userB.id, uid2: userC.id });

    expect(sendRes.statusCode).toBe(200);
    expect(sendRes.body).toHaveProperty(
      'message',
      'Friend request sent successfully',
    );
  });

  it('should show the friend request as pending for userC', async () => {
    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${userC.token}`);

    expect(pendingRes.statusCode).toBe(200);

    const friend = pendingRes.body.find(
      (req) => req.uid1 === userB.id && req.sender?.username === 'friendtarget',
    );

    expect(friend).toBeDefined();
    expect(friend.status).toBe('pending');
  });

  it('should show the friend request as rejected once userC rejects', async () => {
    const pendingRes = await request(app)
      .get('/friends/requests')
      .set('Authorization', `Bearer ${userC.token}`);

    const requestToReject = pendingRes.body.find(
      (req) => req.uid1 === userB.id && req.uid2 === userC.id,
    );

    expect(requestToReject).toBeDefined();

    const rejectedRes = await request(app)
      .patch('/friends/reject-request')
      .set('Authorization', `Bearer ${userC.token}`)
      .send({
        id: requestToReject.id,
        uid1: userB.id,
        uid2: userC.id,
      });

    expect(rejectedRes.statusCode).toBe(200);
    expect(rejectedRes.body.message).toBe(
      'Friend request rejected successfully',
    );
  });
});

// Search Flow
describe('Friends: Search Flow', () => {
  beforeAll(async () => {
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
      .get('/friends/search?username=friend')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const foundC = res.body.find((u) => u.id === userC.id);
    expect(foundC).toBeDefined();
    expect(foundC.status).toBe('incoming');
  });

  it('should show accepted status for friends', async () => {
    const res = await request(app)
      .get('/friends/search?username=friendtarget')
      .set('Authorization', `Bearer ${userA.token}`);

    const found = res.body.find((u) => u.id === userB.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('accepted');
  });

  it('should return "none" status for unrelated users', async () => {
    const res = await request(app)
      .get('/friends/search?username=friendtarget')
      .set('Authorization', `Bearer ${userC.token}`);

    const found = res.body.find((u) => u.id === userB.id);
    expect(found).toBeDefined();
    expect(found.status).toBe('none');
  });
});

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

const request = require('supertest');
const app = require('../app.js');
const deleteTestUsers = require('../utils/test/deleteTestUsers.js');
const createTestUser = require('../utils/test/createTestUser.js');

const EMAIL_PREFIXES = ['invite_test'];

describe('Invites Flow', () => {
  let host;
  let invitee;
  let tripId;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);

    host = await createTestUser({
      prefix: 'invite_test',
      username: 'invitehost',
    });
    invitee = await createTestUser({
      prefix: 'invite_test',
      username: 'invitepart',
    });

    const today = new Date().toISOString().slice(0, 10);

    const tripRes = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${host.token}`)
      .send({
        title: 'Invite Test Trip',
        description: 'Testing trip invites',
        start_date: today,
        end_date: today,
        country: 'Italy',
        thumbnail_url: '',
      });

    tripId = tripRes.body.data[0].id;
  });

  it('should send an invite to another user', async () => {
    const res = await request(app).post('/invites/send-invite').send({
      host_id: host.id,
      user_id: invitee.id,
      trip_id: tripId,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Invite sent to/i);
  });

  it('should show the invite as pending to invitee', async () => {
    const res = await request(app)
      .get('/invites')
      .set('Authorization', `Bearer ${invitee.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    const invite = res.body.find((i) => i.trip.id === tripId);
    expect(invite).toBeDefined();
    expect(invite.status).toBe('pending');
  });

  it('should return invited user IDs for trip', async () => {
    const res = await request(app).get(`/invites/invited?trip_id=${tripId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.invites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ user_id: invitee.id }),
      ]),
    );
  });

  it('should return single invite by ID', async () => {
    const allInvites = await request(app)
      .get('/invites')
      .set('Authorization', `Bearer ${invitee.token}`);
    const invite = allInvites.body[0];

    const res = await request(app)
      .get(`/invites/${invite.id}`)
      .set('Authorization', `Bearer ${invitee.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(invite.id);
  });

  it('should allow invitee to accept invite', async () => {
    const allInvites = await request(app)
      .get('/invites')
      .set('Authorization', `Bearer ${invitee.token}`);
    const invite = allInvites.body[0];

    const res = await request(app).patch('/invites/accept-invite').send({
      id: invite.id,
      user_id: invitee.id,
      trip_id: tripId,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/accepted/i);
  });

  it('should allow invitee to decline another invite', async () => {
    await request(app).post('/invites/send-invite').send({
      host_id: host.id,
      user_id: invitee.id,
      trip_id: tripId,
    });

    const invites = await request(app)
      .get('/invites')
      .set('Authorization', `Bearer ${invitee.token}`);
    const pending = invites.body.find((i) => i.status === 'pending');

    const res = await request(app).patch('/invites/decline-invite').send({
      id: pending.id,
      user_id: invitee.id,
      trip_id: tripId,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/rejected/i);
  });

  it('should fail sending invite with missing params', async () => {
    const res = await request(app).post('/invites/send-invite').send({});
    expect(res.statusCode).toBe(400);
  });
});

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

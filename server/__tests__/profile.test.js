const request = require('supertest');
const app = require('../app.js');
const deleteTestUsers = require('../utils/test/deleteTestUsers.js');
const createTestUser = require('../utils/test/createTestUser.js');

jest.mock('../utils/r2client');
const r2 = require('../utils/r2client.js');

const EMAIL_PREFIXES = ['profile_test'];

// Get Profiles Flow
describe('Profile: Get Flow', () => {
  let user;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
    user = await createTestUser({
      prefix: 'profile_test',
      username: 'testprofile',
    });
  });

  it('should return profile for logged in user', async () => {
    const res = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('profile');
    expect(res.body.profile).toHaveProperty('username', 'testprofile');
  });

  it('should return 401 with no token', async () => {
    const res = await request(app).get('/profile');
    expect(res.statusCode).toBe(401);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Edit Profile Flow
describe('Profile: Edit Name/Bio Flow', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'profile_test',
      username: 'testprofile',
    });
  });

  it('should update the profile field successfully', async () => {
    const res = await request(app)
      .patch('/profile/edit')
      .send({ user_id: user.id, field: 'bio', value: 'Hello World' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
  });

  it('should fail with 400 if params are missing', async () => {
    const res = await request(app).patch('/profile/edit').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should fail with 400 if value is not a string', async () => {
    const res = await request(app)
      .patch('/profile/edit')
      .send({ user_id: user.id, field: 'bio', value: 123 });
    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Upload Avatar Flow
describe('Profile: Upload Avatar Flow', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'profile_test',
      username: 'testprofile',
    });
  });

  it('should upload avatar and return URL', async () => {
    r2.putObject.mockReturnValue({ promise: () => Promise.resolve() });

    const res = await request(app)
      .post('/profile/upload-avatar')
      .field('user_id', user.id)
      .attach('avatar', Buffer.from('dummy image'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.avatar_url).toMatch(/avatars\//);
  });

  it('should fail with 400 if file is missing', async () => {
    const res = await request(app)
      .post('/profile/upload-avatar')
      .field('user_id', user.id);

    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

// Get User Stats Flow
describe('Profile: Get User Stats Flow', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'profile_test',
      username: 'testprofile',
    });
  });
  it('should return public stats', async () => {
    const res = await request(app).get(`/profile/stats/${user.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('trip_count');
    expect(res.body).toHaveProperty('friend_count');
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

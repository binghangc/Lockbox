jest.mock('../utils/r2client.js', () => {
  const putObjectCommand = jest.fn(() => ({
    promise: jest.fn().mockResolvedValue({
      ETag: '"mocked-etag"',
      Location: 'https://mocked-r2-url.com/file.png',
      Bucket: 'mocked-bucket',
      Key: 'mocked-key',
    }),
  }));

  return {
    putObjectCommand,
    send: jest.fn(),
  };
});

const request = require('supertest');
const app = require('../app.js');
const deleteTestUsers = require('../utils/test/deleteTestUsers.js');
const createTestUser = require('../utils/test/createTestUser.js');
const r2 = require('../utils/r2client.js');

const EMAIL_PREFIXES = [
  'profile_get_test',
  'profile_edit_test',
  'profile_upload_test',
  'profile_stats_test',
];

// Get Profiles Flow
describe('Profile: Get Flow', () => {
  let user;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
    user = await createTestUser({
      prefix: 'profile_get_test',
      username: 'profiletest',
    });
  });

  it('should return profile for logged in user', async () => {
    const res = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('profile');
    expect(res.body.profile).toHaveProperty('username', 'profiletest');
  });

  it('should return 401 with no token', async () => {
    const res = await request(app).get('/profile');
    expect(res.statusCode).toBe(401);
  });
});

// Edit Profile Flow
describe('Profile: Edit Name/Bio Flow', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'profile_edit_test',
      username: 'edittest',
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
});

// Upload Avatar Flow
describe('Profile: Upload Avatar Flow', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'profile_upload_test',
      username: 'avatarurltest',
    });
  });

  it('should upload avatar and return URL', async () => {
    r2.send.mockResolvedValueOnce({});

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
      .type('multipart/form-data')
      .field('user_id', user.id);

    expect(res.statusCode).toBe(400);
  });
});

// Get User Stats Flow
describe('Profile: Get User Stats Flow', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'profile_stats_test',
      username: 'statstest',
    });
  });
  it('should return public stats', async () => {
    const res = await request(app).get(`/profile/stats/${user.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('trip_count');
    expect(res.body).toHaveProperty('friend_count');
  });
});

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

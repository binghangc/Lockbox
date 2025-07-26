require('dotenv').config({ path: '../server/.env.server' });

const request = require('supertest');
const app = require('../../app.js');
const supabaseAdmin = require('../../utils/supabaseAdminClient.js');
const supabase = require('../../utils/supabaseUserClient.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');
const createTestUser = require('../../utils/test/createTestUser.js');

const EMAIL_PREFIXES = [
  'signup_test',
  'duplicate_test',
  'login_test',
  'fail_login_test',
  'delete_test',
  'refresh_test',
  'email_update_test',
  'password_update_test',
];

beforeAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

// Signup Flow Test
describe('Auth: Signup Flow', () => {
  it('should reject signup with missing fields', async () => {
    const res = await request(app).post('/auth/signup').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should reject signup with invalid credentials fields', async () => {
    // invalid password
    const testEmail = `signup_test_${Date.now()}@lockbox.dev`;

    const res = await request(app).post('/auth/signup').send({
      email: testEmail,
      password: 'test1234',
      username: 'testuser',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should create a user with valid credentials', async () => {
    const testEmail = `signup_test_${Date.now()}@lockbox.dev`;

    const res = await request(app).post('/auth/signup').send({
      email: testEmail,
      password: 'Test1234!',
      username: `testuser123`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty(
      'message',
      'Signup successful! Please check your email.',
    );
  });

  it('should prevent signup with duplicate email', async () => {
    const testEmail = `duplicate_test@lockbox.dev`;
    // First signup
    await request(app).post('/auth/signup').send({
      email: testEmail,
      password: 'Test1234!',
      username: 'duplicateuser1',
    });

    // Second signup with same email
    const res = await request(app).post('/auth/signup').send({
      email: testEmail,
      password: 'Test1234!',
      username: 'duplicateuser2',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// Login Flow Test
describe('Auth: Login Flow', () => {
  it('should log in a confirmed user with correct credentials', async () => {
    const testEmail = `login_test_${Date.now()}@lockbox.dev`;
    const password = 'Test1234!';
    const username = 'loginuser';

    // Sign up
    const signupRes = await request(app).post('/auth/signup').send({
      email: testEmail,
      password,
      username,
    });
    expect(signupRes.statusCode).toBe(200);

    // Confirm
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === testEmail);
    if (user) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
    }

    // Login
    const loginRes = await request(app).post('/auth/login').send({
      email: testEmail,
      password,
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.session).toHaveProperty('access_token');
    expect(loginRes.body.user).toHaveProperty('email');
  });

  it('should reject login with incorrect password', async () => {
    const testEmail = `fail_login_test_${Date.now()}@lockbox.dev`;

    await request(app).post('/auth/signup').send({
      email: testEmail,
      password: 'Correct123!',
      username: 'failuser',
    });

    // Confirm
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === testEmail);
    if (user) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
    }

    // Try login with wrong password
    const res = await request(app).post('/auth/login').send({
      email: testEmail,
      password: 'WrongPassword!',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// Delete User Flow
describe('Auth: Delete User Flow', () => {
  let user;

  beforeAll(async () => {
    user = await createTestUser({
      prefix: 'delete_test',
      username: 'deleteuser',
    });
  });

  it('should delete the user and related data successfully', async () => {
    const res = await request(app)
      .delete('/auth/delete')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const { data: listed } = await supabaseAdmin.auth.admin.listUsers();
    const deleted = listed.users.find((u) => u.id === user.id);
    expect(deleted).toBeUndefined();
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).delete('/auth/delete');
    expect(res.statusCode).toBe(401);
  });
});

describe('Auth: Refresh Token, Email and Password Update', () => {
  let refreshUser;
  let passwordUser;

  beforeAll(async () => {
    refreshUser = await createTestUser({
      prefix: 'refresh_test',
      username: 'refreshuser',
    });

    passwordUser = await createTestUser({
      prefix: 'password_update_test',
      username: 'passworduser',
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 400 if no token is provided', async () => {
      const res = await request(app).post('/auth/refresh').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should refresh session successfully with a valid refresh_token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: refreshUser.refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('session');
    });

    it('should return 401 if the token is invalid', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid-token' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PATCH /auth/update-email', () => {
    it('should reject if email is missing or invalid', async () => {
      const res = await request(app)
        .patch('/auth/update-email')
        .set('Authorization', `Bearer ${refreshUser.token}`)
        .send({ email: 'bademail' });

      expect(res.statusCode).toBe(400);
    });

    it('should update email and prompt confirmation', async () => {
      const testEmail = `email_update_test_${Date.now()}@lockbox.dev`;

      await supabase.auth.setSession({
        access_token: refreshUser.token,
        refresh_token: refreshUser.refreshToken,
      });

      const res = await request(app)
        .patch('/auth/update-email')
        .set('Authorization', `Bearer ${refreshUser.token}`)
        .send({ email: testEmail });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      if ('email_change' in res.body) {
        expect(res.body.email_change).toMatch(/@lockbox.dev$/);
      }
    });
  });

  describe('PATCH /auth/update-password', () => {
    it('should reject if missing current or new password', async () => {
      const res = await request(app)
        .patch('/auth/update-password')
        .set('Authorization', `Bearer ${passwordUser.token}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should reject if new password is too short', async () => {
      const res = await request(app)
        .patch('/auth/update-password')
        .set('Authorization', `Bearer ${passwordUser.token}`)
        .send({ currentPassword: 'Test1234!', newPassword: 'short' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject if current password is incorrect', async () => {
      const res = await request(app)
        .patch('/auth/update-password')
        .set('Authorization', `Bearer ${passwordUser.token}`)
        .send({ currentPassword: 'Wrong123!', newPassword: 'Newpass123!' });

      expect(res.statusCode).toBe(401);
    });

    it('should update password successfully', async () => {
      const res = await request(app)
        .patch('/auth/update-password')
        .set('Authorization', `Bearer ${passwordUser.token}`)
        .send({ currentPassword: 'Test1234!', newPassword: 'NewTest123!' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Password updated successfully/);
    });
  });
});

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

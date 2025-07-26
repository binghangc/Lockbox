require('dotenv').config({ path: '../server/.env.server' });

const request = require('supertest');
const app = require('../../app.js');
const supabaseAdmin = require('../../utils/supabaseAdminClient.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');
const createTestUser = require('../../utils/test/createTestUser.js');

const EMAIL_PREFIXES = [
  'signup_test',
  'duplicate_test',
  'login_test',
  'fail_login_test',
  'delete_test',
];

// Signup Flow Test
describe('Auth: Signup Flow', () => {
  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });

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

afterAll(async () => {
  await deleteTestUsers(EMAIL_PREFIXES);
});

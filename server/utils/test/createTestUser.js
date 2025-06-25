const request = require('supertest');
const supabaseAdmin = require('../supabaseAdminClient.js');
const app = require('../../app.js');

/* async function waitForUserWithRetry(email, retries = 5, delayMs = 1000) {
  const tryFetch = async (attempt = 1) => {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw new Error(`listUsers failed: ${error.message}`);

    const user = data.users.find((u) => u.email === email);
    if (user) return user;

    if (attempt >= retries) {
      throw new Error(
        `User with email ${email} not found after ${retries} retries`,
      );
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(tryFetch(attempt + 1)), 2 ** attempt * delayMs);
    });
  };

  return tryFetch();
} */

/**
 * Creates and confirms a test user, returns { email, id, token }
 */
/* async function createTestUser({ prefix, username, password = 'Test1234!' }) {
  const email = `${prefix}_${Date.now()}@lockbox.dev`;

  await request(app).post('/auth/signup').send({ email, password, username });

  const user = await waitForUserWithRetry(email);

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });

  const res = await request(app).post('/auth/login').send({ email, password });
  const token = res.body.session.access_token;

  return { email, id: user.id, token };
} */

async function createTestUser({ prefix, username, password = 'Test1234!' }) {
  const email = `${prefix}_${Date.now()}@lockbox.dev`;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: username, name: username },
  });

  if (error) {
    throw new Error(`admin.createUser failed: ${error.message}`);
  }

  const res = await request(app).post('/auth/login').send({ email, password });
  const token = res.body.session.access_token;

  return { email, id: data.user.id, token };
}

module.exports = createTestUser;

module.exports = createTestUser;

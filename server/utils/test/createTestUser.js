const request = require('supertest');
const supabaseAdmin = require('../supabaseAdminClient.js');
const app = require('../../app.js');

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function retryWithBackoff(fn, maxRetries = 5, baseDelay = 300) {
  async function attempt(i) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      const waitTime = baseDelay * 2 ** i + Math.random() * 100;
      console.warn(
        `Retry ${i + 1}/${maxRetries} after ${waitTime.toFixed(0)}ms...`,
      );
      await delay(waitTime);
      return attempt(i + 1);
    }
  }
  return attempt(0);
}

/**
 * Creates and confirms a test user, returns { email, id, token }
 */

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

  await supabaseAdmin.from('profiles').insert({
    id: data.user.id,
    username,
    name: username,
    avatar_url: 'avatar.png',
  });

  const loginResponse = await retryWithBackoff(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password });

    if (!res.body?.session) {
      console.error(`❌ Login failed for ${email}:`, res.body, res.statusCode);
      throw new Error(res.body?.error || 'Login failed');
    }

    return res;
  });

  const token = loginResponse.body.session.access_token;
  const refreshToken = loginResponse.body.session.refresh_token;

  return {
    email,
    id: data.user.id,
    token,
    refreshToken,
  };
}

module.exports = createTestUser;

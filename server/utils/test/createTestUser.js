const request = require('supertest');
const supabaseAdmin = require('../supabaseAdminClient.js');
const app = require('../../app.js');

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

  const res = await request(app).post('/auth/login').send({ email, password });
  const token = res.body.session.access_token;

  return { email, id: data.user.id, token };
}

module.exports = createTestUser;

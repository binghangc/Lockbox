const request = require('supertest');
const supabaseAdmin = require('../supabaseAdminClient.js');
const app = require('../../app.js');

/**
 * Creates and confirms a test user, returns { email, id, token }
 */
async function createTestUser({
  prefix,
  username = 'testuser',
  password = 'Test1234!',
}) {
  const email = `${prefix}_${Date.now()}@lockbox.dev`;

  await request(app).post('/auth/signup').send({ email, password, username });

  const { users } = (await supabaseAdmin.auth.admin.listUsers()).data;
  const user = users.find((u) => u.email === email);

  if (!user) throw new Error(`User with email ${email} not found`);

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });

  const res = await request(app).post('/auth/login').send({ email, password });
  const token = res.body.session.access_token;

  return { email, id: user.id, token };
}

module.exports = createTestUser;

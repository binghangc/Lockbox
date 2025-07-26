const request = require('supertest');
const app = require('../../app.js');
const supabase = require('../../utils/supabaseAdminClient.js');
const createTestUser = require('../../utils/test/createTestUser.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');

const EMAIL_PREFIXES = ['notif_test'];

describe('Notifications: Register Push Token', () => {
  let testUser;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);

    testUser = await createTestUser({
      prefix: 'notif_test',
      username: 'notifuser',
    });
  });

  it('should reject if userId or token is missing', async () => {
    const res = await request(app)
      .post('/notifications/register')
      .send({ expoPushToken: 'some-token' });

    expect(res.statusCode).toBe(400);
  });

  it('should register a push token successfully', async () => {
    const res = await request(app)
      .post('/notifications/register')
      .send({
        userId: testUser.id,
        expoPushToken: 'ExponentPushToken[abc123]',
        preferences: {
          vibecheck: true,
          orbReminder: false,
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Optional: Check Supabase directly
    const { data, error } = await supabase
      .from('profiles')
      .select('expo_push_token, notification_preferences')
      .eq('id', testUser.id)
      .single();

    expect(error).toBeNull();
    expect(data.expo_push_token).toBe('ExponentPushToken[abc123]');
    expect(data.notification_preferences).toEqual({
      vibecheck: true,
      orbReminder: false,
    });
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
  });
});

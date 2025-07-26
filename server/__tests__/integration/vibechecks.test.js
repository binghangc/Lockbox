const request = require('supertest');
const app = require('../../app.js');
const createTestUser = require('../../utils/test/createTestUser.js');
const deleteTestUsers = require('../../utils/test/deleteTestUsers.js');
const supabase = require('../../utils/supabaseAdminClient.js');

const EMAIL_PREFIXES = ['vibe_test'];

describe('Vibechecks: GET /trips/:id/vibechecks', () => {
  let user;
  let tripId;
  let token;

  beforeAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);

    user = await createTestUser({
      prefix: 'vibe_test',
      username: 'vibetestuser',
    });
    token = user.token;

    // Insert a trip for this user
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .insert([
        {
          user_id: user.id,
          title: 'Test Trip',
          start_date: '2025-07-01',
          end_date: '2025-07-05',
          country: 'Japan',
          thumbnail_url:
            'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/barbenheimer-movie-party.jpeg',
        },
      ])
      .select()
      .single();

    if (tripError) throw tripError;
    tripId = tripData.id;

    // Insert vibechecks
    await supabase.from('vibechecks').insert([
      {
        trip_id: tripId,
        date: '2025-07-01',
        vibecheck: 'Kickoff the trip!',
      },
      {
        trip_id: tripId,
        date: '2025-07-02',
        vibecheck: 'Day 2 adventures?',
      },
    ]);
  });

  it('should return vibechecks for a trip with minimal fields', async () => {
    const res = await request(app)
      .get(`/vibechecks/trips/${tripId}/vibechecks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.vibechecks).toBeInstanceOf(Array);
    expect(res.body.vibechecks.length).toBeGreaterThanOrEqual(2);

    const vibe = res.body.vibechecks[0];
    expect(vibe).toHaveProperty('id');
    expect(vibe).toHaveProperty('vibecheck');
    expect(vibe).toHaveProperty('date');
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get(
      `/vibechecks/trips/${tripId}/vibechecks`,
    );
    expect(res.statusCode).toBe(401);
  });

  afterAll(async () => {
    await deleteTestUsers(EMAIL_PREFIXES);
    await supabase.from('vibechecks').delete().eq('trip_id', tripId);
    await supabase.from('trips').delete().eq('id', tripId);
  });
});

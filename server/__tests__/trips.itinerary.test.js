const request = require('supertest');
const dayjs = require('dayjs');
const app = require('../app.js');
const supabaseAdmin = require('../utils/supabaseAdminClient.js');
const deleteTestUsers = require('../utils/test/deleteTestUsers.js');

const EMAIL_PREFIXES = [
  'trip_test',
  'create_trip_test',
  'delete_trip',
  'edit_trip',
];
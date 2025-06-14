const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL } = process.env;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables',
  );
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

module.exports = supabaseAdmin;

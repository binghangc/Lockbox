// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// eslint-disable-next-line import/no-unresolved
import { serve } from 'https://deno.land/std@0.168.0/http/server';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { createClient } from 'https://deno.land/x/supabase_js/mod.ts';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('PROJECT_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!,
  );

  const now = new Date().toISOString();

  const { error: ongoingError } = await supabase
    .from('trips')
    .update({ status: 'ongoing' })
    .lt('start_date', now)
    .gt('end_date', now)
    .neq('status', 'ongoing');

  const { error: endedError } = await supabase
    .from('trips')
    .update({ status: 'ended' })
    .lte('end_date', now)
    .neq('status', 'ended');

  if (ongoingError || endedError) {
    return new Response(
      JSON.stringify({ message: 'Failed', ongoingError, endedError }),
      { status: 500 },
    );
  }

  return new Response(JSON.stringify({ message: 'Trip statuses updated' }), {
    status: 200,
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/updateTripStatus' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('PROJECT_URL')!,
  Deno.env.get('SERVICE_ROLE_KEY')!,
);

export async function sendPushNotification(
  expoPushToken: string,
  message: {
    title: string;
    body: string;
    data?: Record<string, any>;
  },
) {
  const { error } = await supabase.from('expo_messages').insert({
    token: expoPushToken,
    title: message.title,
    body: message.body,
    data: message.data || {},
  });

  if (error) {
    console.error('❌ Failed to send push message:', error.message);
  }
}
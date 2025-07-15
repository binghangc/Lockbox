import { createClient } from '@supabase/supabase-js';
import { Expo } from 'expo-server-sdk';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const expo = new Expo();

export async function pollMessages() {
  const { data: messages, error } = await supabase
    .from('expo_messages')
    .select('*')
    .eq('sent', false)
    .limit(50);

  if (error) {
    console.error('❌ Error fetching messages:', error);
    return;
  }

  if (!messages || messages.length === 0) {
    console.log('ℹ️ No messages to send');
    return;
  }

  const results = await Promise.all(
    messages.map(async (msg) => {
      if (!Expo.isExpoPushToken(msg.token)) {
        await supabase
          .from('expo_messages')
          .update({ sent: true, error: 'Invalid Expo token' })
          .eq('id', msg.id);
        return;
      }

      try {
        const ticketChunk = await expo.sendPushNotificationsAsync([
          {
            to: msg.token,
            title: msg.title,
            body: msg.body,
            data: msg.data ?? {},
          },
        ]);

        await supabase
          .from('expo_messages')
          .update({ sent: true })
          .eq('id', msg.id);

        return ticketChunk;
      } catch (err) {
        console.error('❌ Failed to send notification:', err);
        await supabase
          .from('expo_messages')
          .update({ sent: true, error: err.message })
          .eq('id', msg.id);
        return;
      }
    }),
  );

  const sentCount = results.filter(Boolean).length;
  if (sentCount > 0) {
    console.log(`✅ Sent ${sentCount} notifications`);
  }
}

// Keep polling every 30s
setInterval(pollMessages, 30 * 1000);

// First run immediately
pollMessages();
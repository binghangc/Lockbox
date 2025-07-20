const { Expo } = require('expo-server-sdk');
const supabase = require('../utils/supabaseAdminClient.js');

const expo = new Expo();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function pollMessagesLoop() {
  console.log('[sendMessages.worker] Starting push notification loop');

  async function pollOnce() {
    const { data: messages, error } = await supabase
      .from('expo_messages')
      .select('*')
      .eq('sent', false)
      .limit(50);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    if (!messages || messages.length === 0) {
      console.log('No messages to send');
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
          await expo.sendPushNotificationsAsync([
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
        } catch (err) {
          console.error('Failed to send notification:', err);
          await supabase
            .from('expo_messages')
            .update({ sent: true, error: err.message })
            .eq('id', msg.id);
        }
      }),
    );

    const sentCount = results.filter(Boolean).length;
    if (sentCount > 0) {
      console.log(`Sent ${sentCount} notifications`);
    }
  }

  /* eslint-disable no-await-in-loop */
  /* eslint-disable no-constant-condition */
  while (true) {
    await pollOnce();
    await sleep(30000);
  }
  /* eslint-enable no-constant-condition */
}

module.exports = pollMessagesLoop;

if (require.main === module) {
  pollMessagesLoop();
}

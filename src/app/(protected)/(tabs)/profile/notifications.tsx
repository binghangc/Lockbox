import React, { useEffect, useState } from 'react';
import { View, Alert, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/UserContext';
import registerForPushNotificationsAsync from '@/utils/registerForPushNotifications';
import SubToggle from '@/components/subToggle';
import useNotificationPermissions from '@/hooks/useNotificationPermissions';

const STORAGE_KEY = 'notifications_settings';

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [enabled, setEnabled] = useState(false);
  const [subSettings, setSubSettings] = useState({
    vibeChecks: true,
    vaultOpening: true,
    orbReminders: true,
    itineraryNudges: false,
  });
  const [isReady, setIsReady] = useState(false);
  const { granted, requestPermissions } = useNotificationPermissions();

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (typeof parsed.enabled === 'boolean') setEnabled(parsed.enabled);
          if (parsed.subSettings) setSubSettings(parsed.subSettings);
        } catch (err) {
          console.error('Failed to parse settings:', err);
        }
      }
      setIsReady(true);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isReady || !enabled) return;

    (async () => {
      console.log('⚙️ Registering for push notifications...');
      let token;
      try {
        token = await registerForPushNotificationsAsync();
        console.log('✅ Token returned:', token);
      } catch (err) {
        console.error('❌ Token fetch error:', err);
        Alert.alert('Token error', 'Failed to get push token');
        return;
      }

      if (!token) {
        Alert.alert(
          'Notifications not allowed',
          'Please enable notifications in system settings.',
        );
        console.warn('⚠️ No token returned');
        setEnabled(false);
        return;
      }

      if (user?.id) {
        try {
          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/notifications/register`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                expoPushToken: token,
                preferences: subSettings,
              }),
            },
          );
          if (!res.ok) {
            const error = await res.json();
            console.error('Push token save failed:', error);
          } else {
            console.log('Push token and prefs synced');
          }
        } catch (err) {
          console.error('Push token registration error:', err);
        }
      }
    })();
  }, [enabled, isReady, subSettings, user?.id]);

  const saveAllSettings = React.useCallback(async () => {
    if (isReady) {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ enabled, subSettings }),
      );
    }
  }, [enabled, subSettings, isReady]);

  useEffect(() => {
    saveAllSettings();
  }, [saveAllSettings]);

  const handleToggleEnabled = async (next: boolean) => {
    if (next) {
      const allowed = await requestPermissions();

      if (!allowed) {
        Alert.alert(
          'Permission Required',
          'To receive notifications, please enable them in system settings.',
          [{ text: 'Open Settings', onPress: () => Linking.openSettings() }],
        );
        return;
      }

      // At this point, permission is granted — try getting token again
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        Alert.alert(
          'Failed to get token',
          'Notifications are allowed, but we couldn’t get a token. Try restarting the app or check your network.',
        );
        return;
      }

      console.log('Push token:', token);
      setEnabled(true);
    } else {
      Alert.alert(
        'Disable Notifications',
        'To completely disable notifications, go to system settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      setEnabled(false);
    }
  };

  const handleVibeChecks = (next: boolean) =>
    setSubSettings((prev) => ({ ...prev, vibeChecks: next }));

  const handleVaultOpened = (next: boolean) =>
    setSubSettings((prev) => ({ ...prev, vaultOpening: next }));

  const handleOrbReminders = (next: boolean) =>
    setSubSettings((prev) => ({ ...prev, orbReminders: next }));

  const handleItineraryNudges = (next: boolean) =>
    setSubSettings((prev) => ({ ...prev, itineraryNudges: next }));

  return (
    <View
      className="flex-1 px-5"
      style={{
        backgroundColor: 'rgb(17, 17, 17)',
        paddingTop: insets.top + 60,
      }}
    >
      <BlurView
        intensity={50}
        tint="dark"
        style={{ borderRadius: 5, overflow: 'hidden' }}
      >
        <SubToggle
          key="enabled"
          label="Enable Notifications"
          value={enabled}
          onChange={handleToggleEnabled}
          icon={<Ionicons name="notifications" size={24} color="white" />}
        />
      </BlurView>

      {granted && enabled && (
        <BlurView
          intensity={50}
          tint="dark"
          style={{
            borderRadius: 5,
            overflow: 'hidden',
            marginTop: 32,
          }}
        >
          <SubToggle
            key="vibeChecks"
            label="New Vibe Checks"
            value={subSettings.vibeChecks}
            onChange={handleVibeChecks}
            icon={<Ionicons name="sparkles-outline" size={22} color="white" />}
          />
          <View
            style={{
              height: 1,
              backgroundColor: '#2a2a2a',
              marginHorizontal: 4,
            }}
          />

          <SubToggle
            key="vaultOpening"
            label="Vault Opened"
            value={subSettings.vaultOpening}
            onChange={handleVaultOpened}
            icon={<Feather name="unlock" size={22} color="white" />}
          />
          <View
            style={{
              height: 1,
              backgroundColor: '#2a2a2a',
              marginHorizontal: 4,
            }}
          />

          <SubToggle
            key="orbReminders"
            label="Orb Reminders"
            value={subSettings.orbReminders}
            onChange={handleOrbReminders}
            icon={<Ionicons name="send-outline" size={22} color="white" />}
          />
          <View
            style={{
              height: 1,
              backgroundColor: '#2a2a2a',
              marginHorizontal: 4,
            }}
          />

          <SubToggle
            key="itineraryNudges"
            label="Itinerary Nudges"
            value={subSettings.itineraryNudges}
            onChange={handleItineraryNudges}
            icon={<Ionicons name="calendar-outline" size={22} color="white" />}
          />
        </BlurView>
      )}
    </View>
  );
}

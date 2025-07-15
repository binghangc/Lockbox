import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/UserContext';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotifications';
import SubToggle from '@/components/subToggle';

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
    if (!isReady) return;

    if (enabled) {
      (async () => {
        const token = await registerForPushNotificationsAsync();
        if (!token) {
          Alert.alert(
            'Notifications not allowed',
            'Please enable notifications in system settings.',
          );
          setEnabled(false);
        } else {
          console.log('Got push token:', token);
          if (user?.id) {
            try {
              console.log('Sending to backend:', {
                userId: user.id,
                expoPushToken: token,
                preferences: subSettings,
              });
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
        }
      })();
    }
  }, [enabled, isReady, subSettings, user.id]);

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
          onChange={setEnabled}
          icon={<Ionicons name="notifications" size={24} color="white" />}
        />
      </BlurView>

      {enabled && (
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

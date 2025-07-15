import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotifications';

const STORAGE_KEY = 'notifications_settings';

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();

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
    if (!isReady) return; // wait for settings to load

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
          // TODO: send to backend
        }
      })();
    }
  }, [enabled, isReady]);

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

  const updateSubSetting = (key: keyof typeof subSettings) => {
    setSubSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: sync preference to Supabase
  };

  function SubToggle({
    label,
    value,
    onChange,
    icon,
  }: {
    label: string;
    value: boolean;
    onChange: () => void;
    icon: React.ReactNode;
  }) {
    return (
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          {icon}
          <Text className="text-white text-lg font-semibold ml-3">{label}</Text>
        </View>
        <Switch value={value} onValueChange={onChange} />
      </View>
    );
  }

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
            label="New Vibe Checks"
            value={subSettings.vibeChecks}
            onChange={() => updateSubSetting('vibeChecks')}
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
            label="Vault Opened"
            value={subSettings.vaultOpening}
            onChange={() => updateSubSetting('vaultOpening')}
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
            label="Orb Reminders"
            value={subSettings.orbReminders}
            onChange={() => updateSubSetting('orbReminders')}
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
            label="Itinerary Nudges"
            value={subSettings.itineraryNudges}
            onChange={() => updateSubSetting('itineraryNudges')}
            icon={<Ionicons name="calendar-outline" size={22} color="white" />}
          />
        </BlurView>
      )}
    </View>
  );
}

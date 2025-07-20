import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

export default function useNotificationPermissions() {
  const [status, setStatus] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined',
  );

  const getCurrentPermissions = async () => {
    const settings = await Notifications.getPermissionsAsync();
    setStatus(settings.status);
  };

  useEffect(() => {
    getCurrentPermissions();
  }, []);

  const requestPermissions = async () => {
    const settings = await Notifications.requestPermissionsAsync();
    setStatus(settings.status);
    return settings.granted;
  };

  return {
    status,
    granted: status === 'granted',
    requestPermissions,
  };
}

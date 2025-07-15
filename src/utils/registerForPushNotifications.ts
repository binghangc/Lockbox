import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export default async function registerForPushNotificationsAsync() {
  if (!Constants.isDevice) {
    console.warn('Push notifications only work on a physical device');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn('Missing EAS projectId – push token will not work!');
    return null;
  }

  console.log('Expo Project ID:', Constants.expoConfig?.extra?.eas?.projectId);

  try {
    // 1. Check current permission status
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 2. Request permission if not yet granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // 3. Abort if still not granted
    if (finalStatus !== 'granted') {
      console.warn('Notifications permission not granted');
      return null;
    }

    console.log('Permission status:', finalStatus);

    // 4. Get Expo push token
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenResponse.data;
    console.log('Expo Push Token:', token);
    return token;
  } catch (err) {
    console.error('Error getting push token:', err);
    return null;
  }
}

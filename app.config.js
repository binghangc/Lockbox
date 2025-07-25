export default ({ config }) => ({
  ...config,
  scheme: 'lockbox',
  deepLinking: true,
  name: 'Lockbox',
  slug: 'lockbox',
  owner: 'locked-in',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/lockicon.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/lockicon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lockedin.lockbox',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/lockicon.png',
      backgroundColor: '#ffffff',
    },
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    package: 'com.lockedin.lockbox',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
    ],
  },
  web: {
    favicon: './assets/lockicon.png',
  },
  plugins: [
    'expo-secure-store',
    'expo-router',
    'expo-dev-client',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Lockbox to access your camera',
        microphonePermission: 'Allow Lockbox to access your microphone',
        recordAudioAndroid: true,
      },
    ],
    'expo-video',
    'expo-font',
    'expo-notifications',
  ],
  extra: {
    ...config.extra,
    eas: {
      projectId: 'a6964f74-b71d-4ce7-8919-a7162991b136',
    },
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_REDIRECT_URL: process.env.EXPO_PUBLIC_REDIRECT_URL,
  },
});

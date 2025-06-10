import '../../global.css';
import { Stack, useRouter } from 'expo-router';
import { AppState } from 'react-native';
import { useEffect, useState } from 'react';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from '@/components/UserContext';
import supabase from '../../lib/supabase';

const myTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'white',
    card: '#101010',
  },
};

export default function RootLayout() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)'); // Navigate to home screen if session exists
      } else {
        router.replace('/(auth)/'); // Navigate to login screen if no session
      }
      setSessionChecked(true); // Mark session as checked
    };

    if (!sessionChecked) {
      console.log('Checking session...');
    }

    checkSession();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => subscription.remove();
  }, [router, sessionChecked]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ThemeProvider value={myTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

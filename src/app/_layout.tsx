import '../../global.css';
import { Slot, Stack, useRouter } from "expo-router";
import { AppState } from 'react-native'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { UserProvider } from '@/components/UserContext';
import { linking } from '../../lib/linking';

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
            const { data: { session } } = await supabase.auth.getSession();
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
            supabase.auth.startAutoRefresh()
        } else {
            supabase.auth.stopAutoRefresh()
        }
    })
        return () => subscription.remove()
    }, []);

    return (
      <ThemeProvider value={myTheme}>
        <Stack screenOptions={{ headerShown: false }}>
        </Stack>
      </ThemeProvider>
    );

}
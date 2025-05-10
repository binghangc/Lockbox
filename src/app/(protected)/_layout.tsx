import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
    const router = useRouter();
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="newTrip"
              options={{
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
        </Stack>
    );
}
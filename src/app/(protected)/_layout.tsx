import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
    const router = useRouter();
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="newTrip"
            options={{
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
          
          <Stack.Screen
            name="locationPicker"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    );
}
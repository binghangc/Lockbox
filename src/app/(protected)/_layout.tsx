import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function ProtectedLayout() {
    const router = useRouter();
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ 
            headerShown: false, 
          }}>
          <Stack.Screen
            name="newTrip"
            options={{
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    );
}
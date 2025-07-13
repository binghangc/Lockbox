import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="tripForm"
          options={{
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

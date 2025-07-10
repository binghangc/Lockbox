import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, Stack } from 'expo-router';

function HeaderLeft({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text className="text-white font-semibold text-base pl-1">Cancel</Text>
    </TouchableOpacity>
  );
}

function HeaderRight({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text className="text-white font-semibold text-base pr-1">Save</Text>
    </TouchableOpacity>
  );
}

function HeaderBackground() {
  return (
    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
  );
}

const headerBackground = HeaderBackground;

export default function ProtectedLayout() {
  const router = useRouter();

  const headerLeft = () => <HeaderLeft onPress={() => router.back()} />;
  const headerRight = () => (
    <HeaderRight
      onPress={() => {
        /* Save logic here */
      }}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="newTrip"
          options={{
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profileEdit"
          options={{
            headerShown: true,
            animation: 'slide_from_bottom',
            headerTransparent: true,
            headerTitle: 'Edit Profile',
            headerTitleAlign: 'center',
            headerBackground: headerBackground,
            headerLeft: headerLeft,
            headerRight: headerRight,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

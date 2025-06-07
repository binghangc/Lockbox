import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Octicons } from '@expo/vector-icons';

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
          <Stack.Screen
            name="profileEdit"
            options={{
              headerShown: true,
              animation: 'slide_from_bottom',
              headerTransparent: true,
              headerTitle: 'Edit Profile',
              headerTitleAlign: 'center',
              headerTintColor: 'white',
              headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="text-white font-semibold text-base pl-1">Cancel</Text>
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity onPress={() => {/* Save logic here */}}>
                  <Text className="text-white font-semibold text-base pr-1">Save</Text>
                </TouchableOpacity>
              ),
              headerBackground: () => (
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
              ),
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    );
}
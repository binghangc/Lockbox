import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Foundation, Octicons, MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileLayout() {
  const sharedScreenOptions: NativeStackNavigationOptions = {
    headerShown: true,
    headerTransparent: true,
    headerTintColor: 'white',
    headerTitleAlign: 'center',
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()}>
        <Octicons
          name="chevron-left"
          size={28}
          color="white"
          style={{ marginLeft: 12 }}
        />
      </TouchableOpacity>
    ),
    headerBackground: () => (
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
    ),
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerTitle: '',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          ...sharedScreenOptions,
          headerTitle: 'Profile Settings',
        }}
      />
      <Stack.Screen
        name="accountSettings"
        options={{
          ...sharedScreenOptions,
          headerTitle: 'Account Settings',
        }}
      />
    </Stack>
  );
}

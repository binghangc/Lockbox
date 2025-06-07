import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function ProfileLayout() {
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
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('profileEdit')}
                style={{ marginRight: 16 }}
              >
                <Foundation name="pencil" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/profile/settings')}
                style={{ marginRight: 16 }}
              >
                <Octicons name="gear" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerTitle:'Profile Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Octicons name="chevron-left" size={28} color="white" style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          ),
          headerBackground: () => (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          ),
        }}
      />
    </Stack>
  );
}
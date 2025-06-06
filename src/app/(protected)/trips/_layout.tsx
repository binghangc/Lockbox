import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TripsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerTransparent: true,
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Octicons name="chevron-left" size={28} color="white" style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          ),
          headerBackground: () => (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          ),
          title: '',
        })}
      />
    </SafeAreaView>
  );
}

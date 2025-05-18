import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}

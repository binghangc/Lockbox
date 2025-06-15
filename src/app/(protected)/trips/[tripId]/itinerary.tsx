import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import ItineraryInput from '@/components/itineraryInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const screenOptions = {
  headerShown: false, // 👈 hide the default header
};

export default function ItineraryScreen() {
  const { tripId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  if (!tripId || typeof tripId !== 'string') {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Invalid trip ID</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-black p-4"
      style={{ flex: 1, paddingTop: insets.top }}
    >
      <ItineraryInput tripId={tripId} />
    </View>
  );
}

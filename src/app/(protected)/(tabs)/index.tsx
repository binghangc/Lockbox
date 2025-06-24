import { ScrollView, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import TripCarousel from '@/components/tripCarousel';
import useAllTrips from '@/hooks/useAllTrips';

const FILTERS = ['upcoming', 'ongoing', 'ended', 'pinned'] as const;

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState<
    (typeof FILTERS)[number] | null
  >(null);

  const { trips, loading, refreshTrips } = useAllTrips();
  const insets = useSafeAreaInsets();
  const filteredTrips = selectedFilter
    ? trips.filter((trip) => trip.status === selectedFilter)
    : trips;

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
        refreshTrips();
      } else {
        console.error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleLeaveTrip = async (tripId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}/leave`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
        refreshTrips();
      } else {
        console.error('Failed to leave trip');
      }
    } catch (error) {
      console.error('Leave error:', error);
    }
  };

  return (
    <ScrollView
      style={{ paddingTop: insets.top, backgroundColor: 'rgb(17, 17, 17)' }}
      contentContainerStyle={{ paddingVertical: 70 }}
    >
      <View className="px-4">
        <Text className="text-white text-2xl font-bold mb-1">Bags packed</Text>
        <Text className="text-white text-2xl font-bold mb-4">
          Memories loading...
        </Text>

        <View className="flex-row gap-2 mb-6">
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              onPress={() =>
                setSelectedFilter(selectedFilter === filter ? null : filter)
              }
              className={`px-3 py-1 rounded-full ${
                selectedFilter === filter ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <Text
                className={`${
                  selectedFilter === filter
                    ? 'text-black font-semibold'
                    : 'text-white'
                } capitalize`}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <TripCarousel
        trips={filteredTrips}
        onDeleteTrip={handleDeleteTrip}
        onLeaveTrip={handleLeaveTrip}
      />
    </ScrollView>
  );
}

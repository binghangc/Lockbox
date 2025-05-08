import { ScrollView, View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { trips } from '@/dummyData';
import TripCarousel from '@/components/tripCarousel';
import { Octicons } from '@expo/vector-icons';


const FILTERS = ['upcoming', 'ongoing', 'past', 'pinned'] as const;

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState<(typeof FILTERS)[number] | null>(null);

  const filteredTrips = selectedFilter ? trips.filter((trip) => trip.status === selectedFilter) : trips;

  return (
    <ScrollView className="flex-1 bg-black" contentContainerStyle={{ paddingVertical: 24 }}>
      <View className="px-4">
        <Text className="text-white text-2xl font-bold mb-1">T-minus 10 days till</Text>
        <Text className="text-white text-2xl font-bold mb-4">Hawaiian Paradise 🌴</Text>

        <View className="flex-row gap-2 mb-6">
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(selectedFilter === filter ? null : filter)}
              className={`px-3 py-1 rounded-full ${
                selectedFilter === filter ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <Text
                className={`${
                  selectedFilter === filter ? 'text-black font-semibold' : 'text-white'
                } capitalize`}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        <TripCarousel trips={filteredTrips} />
      </View>
    </ScrollView>
  );
}

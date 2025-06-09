import React from 'react';
import { View, FlatList } from 'react-native';
import { Trip } from '@/types';
import TripCard from './tripCard';

interface TripCarouselProps {
  trips: Trip[];
}

function TripSeparator() {
  return <View className="w-3" />;
}

export default function TripCarousel({ trips }: TripCarouselProps) {
  const sortedTrips = [...trips].sort(
    (a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  );

  return (
    <View className="mb-6 overflow-visible">
      <FlatList
        data={sortedTrips}
        keyExtractor={(item) => item.id}
        horizontal
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 13, paddingRight: 4 }}
        ItemSeparatorComponent={TripSeparator}
        renderItem={({ item }) => <TripCard trip={item} />}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
}

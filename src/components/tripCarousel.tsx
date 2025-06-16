import { View, FlatList } from 'react-native';
import { Trip } from '@/types';
import TripCard from './tripCard';
import CreateTripCard from './createTripCard';

interface TripCarouselProps {
  trips: Trip[];
  onDeleteTrip?: (tripId: string) => void;
  onLeaveTrip?: (tripId: string) => void;
}

function TripSeparator() {
  return <View className="w-3" />;
}

export default function TripCarousel({
  trips,
  onDeleteTrip,
  onLeaveTrip,
}: TripCarouselProps) {
  const sortedTrips = [...trips].sort(
    (a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  );

  return (
    <View className="mb-6 overflow-visible">
      <FlatList
        data={[...sortedTrips, { id: 'create-trip-placeholder' } as Trip]}
        keyExtractor={(item) => item.id}
        horizontal
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 13, paddingRight: 4 }}
        ItemSeparatorComponent={TripSeparator}
        renderItem={({ item }) =>
          item.id === 'create-trip-placeholder' ? (
            <CreateTripCard />
          ) : (
            <TripCard
              trip={item}
              onDeleteTrip={onDeleteTrip}
              onLeaveTrip={onLeaveTrip}
            />
          )
        }
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
}

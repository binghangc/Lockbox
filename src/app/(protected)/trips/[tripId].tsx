import dayjs from 'dayjs';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';
import { BlurView } from 'expo-blur';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import TripPillbar from '@/components/tripPillbar';
import useTrips from '@/hooks/useTrips';
import ParticipantRowList from '@/components/participantRowList';

export const screenOptions = {
  headerTransparent: true,
  headerTintColor: 'white',
  headerTitleAlign: 'center',
  headerLeft: () => (
    <Octicons
      name="chevron-left"
      size={28}
      color="white"
      style={{ marginLeft: 12 }}
    />
  ),
  headerBackground: () => (
    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
  ),
  headerTitle: '',
};

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip, isHost, loading, hasItinerary } = useTrips(tripIdStr);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const HEADER_HEIGHT = insets.top + 60;

  const onSelect = (user: Profile) => {};
  const onCountUpdate = (count: number) => {};

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Trip not found</Text>
      </View>
    );
  }

  let handlePress;

  if (trip.status === 'upcoming') {
    handlePress = () => {
      router.push(`/trips/${tripId}/itinerary`);
    };
  } else {
    handlePress = () => {
      console.log('Not implemented yet.');
    };
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      {/* ScrollView starts below the image */}
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: 'black', flex: 1 }}>
          {/* Trip Title */}
          <View className="px-3 mb-6">
            <Text className="text-4xl font-extrabold text-center text-white">
              {trip.title}
            </Text>
          </View>
          <View className="items-center px-4 mb-5">
            <Image
              source={{ uri: trip.thumbnail_url }}
              style={{ width: '100%', aspectRatio: 1 }}
              resizeMode="cover"
            />
          </View>
          {/* Trip Dates */}
          <View className="flex-row items-center justify-between p-3">
            <Text
              className="text-white text-2xl font-semibold"
              numberOfLines={2}
              style={{ textAlign: 'left' }}
            >
              {trip.start_date && trip.end_date
                ? `${dayjs(trip.start_date).format('dddd, MMM D')} -\n${dayjs(trip.end_date).format('dddd, MMM D')}`
                : 'Dates unavailable'}
            </Text>
          </View>
          {/* Host row */}
          <View className="p-3">
            <View className="flex-row items-center">
              <FontAwesome6 name="crown" size={15} color="#a3a3a3" />
              <Text className="text-neutral-400 text-xl ml-2">Hosted by</Text>
            </View>
            {trip.host && (
              <TouchableOpacity
                className="flex-row items-center gap-3 mt-2 ml-4"
                onPress={() => {}}
              >
                <Image
                  source={{ uri: trip.host.avatar_url }}
                  className="w-10 h-10 rounded-full"
                />
                <Text className="text-white text-xl font-bold">
                  {trip.host.name}
                </Text>
              </TouchableOpacity>
            )}

            {/* Country */}
            {trip.country && (
              <View className="flex-row items-center mt-4 ml-[2px]">
                <FontAwesome6 name="location-dot" size={15} color="#a3a3a3" />
                <Text className="text-neutral-400 text-xl ml-2">
                  {trip.country}
                </Text>
              </View>
            )}
            {/* Description */}
            {trip.description && (
              <Text className="text-neutral-400 text-lg mt-4">
                {trip.description}
              </Text>
            )}

            {/* Participants */}
            <View className="p-3">
              <View className="flex-row justify-between items-center mt-4 mb-2 px-4">
                <Text className="text-white text-2xl font-semibold">
                  Participants
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/trips/${tripId}/participants`)}
                >
                  <Text className="text-sm text-gray-300 font-medium">
                    SEE ALL
                  </Text>
                </TouchableOpacity>
              </View>
              <ParticipantRowList
                onSelect={onSelect}
                onCountUpdate={onCountUpdate}
              />
            </View>

            {isHost && hasItinerary && (
              <TouchableOpacity
                className="bg-white rounded-lg px-4 py-3 mt-6 self-center"
                onPress={() => router.push(`/trips/${trip.id}/vibechecks`)}
              >
                <Text className="text-black font-semibold">
                  Generate Vibe Checks
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <TripPillbar
        handlePress={handlePress}
        status={(trip.status as 'upcoming' | 'ongoing' | 'ended') || 'upcoming'}
      />
    </View>
  );
}

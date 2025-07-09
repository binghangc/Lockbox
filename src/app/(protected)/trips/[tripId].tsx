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
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';
import { BlurView } from 'expo-blur';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ResizeMode, Video } from 'expo-av';
import useTrips from '@/hooks/useTrips';
import TripPillbarContainer from '@/containers/tripPillbarContainer';
import UserProfileModal from '@/components/userProfileModal';
import ParticipantRowList from '@/components/participants/participantRowList';
import { useState, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { Profile } from '@/types';
import videoBackgrounds from '@/constants/videoBackgrounds';

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
  const { trip, loading } = useTrips(tripIdStr);
  const insets = useSafeAreaInsets();

  const { user } = useUser();
  const isHost = user?.id === trip?.host?.id;
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);

  const HEADER_HEIGHT = insets.top + 60;

  const onSelect = (u: Profile) => {
    setSelectedUser(u);
  };
  const onCountUpdate = useCallback((count: number) => {
    setParticipantCount(count);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-transparent">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View className="flex-1 justify-center items-center bg-transparent">
        <Text className="text-white">Trip not found</Text>
      </View>
    );
  }

  let handlePress;

  if (trip.status === 'upcoming' && isHost) {
    handlePress = () => {
      router.push(`/trips/${tripId}/itinerary`);
    };
  } else if (trip.status === 'upcoming' && !isHost) {
    handlePress = () => {
      console.log('Not host - do nothing.');
    };
  } else {
    handlePress = () => {
      console.log('Not implemented yet.');
    };
  }

  const selectedVideo =
    trip.video_background && videoBackgrounds[trip.video_background]
      ? videoBackgrounds[trip.video_background]
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {selectedVideo ? (
        <Video
          source={selectedVideo}
          rate={1.0}
          volume={1.0}
          isMuted
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]} />
      )}
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
        <View style={{ backgroundColor: 'transparent', flex: 1 }}>
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
                  Participants ({participantCount})
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
          </View>
        </View>
      </ScrollView>
      <UserProfileModal
        isVisible={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        currentUserId={user?.id ?? ''}
        isFriends
      />
      <TripPillbarContainer
        tripId={tripIdStr}
        isHost={isHost}
        status={(trip.status as 'upcoming' | 'ongoing' | 'ended') || 'upcoming'}
        handlePress={handlePress}
      />
    </View>
  );
}

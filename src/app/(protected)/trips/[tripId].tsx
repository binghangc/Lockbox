/* eslint-disable no-param-reassign */
import dayjs from 'dayjs';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useTrips, { isTripDirty, clearTripDirty } from '@/hooks/useTrips';
import TripPillbarContainer from '@/containers/tripPillbarContainer';
import UserProfileModal from '@/components/userProfileModal';
import ParticipantRowList from '@/components/participants/participantRowList';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';
import { Profile } from '@/types';
import { useTripTheme, TripThemeProvider } from '@/context/TripThemeProvider';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

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

function TripDetailContent() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip, loading, refreshTrip } = useTrips(tripIdStr);

  useFocusEffect(
    useCallback(() => {
      if (tripIdStr && isTripDirty(tripIdStr)) {
        refreshTrip();
        clearTripDirty(tripIdStr);
      }
    }, [tripIdStr, refreshTrip]),
  );

  const insets = useSafeAreaInsets();
  const theme = useTripTheme();
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
        <ActivityIndicator color={theme.primaryText} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View className="flex-1 justify-center items-center bg-transparent">
        <Text style={{ color: theme.primaryText }}>Trip not found</Text>
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

  return (
    <>
      <TripVisualBackground
        videoKey={trip?.video_background ?? null}
        effectKey={trip?.effects ?? null}
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
      >
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        {/* ScrollView starts below the image */}
        <MaskedView
          style={{ flex: 1 }}
          maskElement={
            <LinearGradient
              colors={['transparent', 'black']}
              locations={[0, 0.15]}
              style={{ flex: 1 }}
            />
          }
        >
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
                <Text
                  style={{
                    color: theme.primaryText,
                    fontSize: 36,
                    fontWeight: '800',
                    textAlign: 'center',
                    fontFamily: 'RocGrotesk-WideMedium',
                  }}
                >
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
                  style={{
                    color: theme.primaryText,
                    fontSize: 24,
                    fontWeight: '600',
                    textAlign: 'left',
                  }}
                  numberOfLines={2}
                >
                  {trip.start_date && trip.end_date
                    ? `${dayjs(trip.start_date).format('dddd, MMM D')} -\n${dayjs(trip.end_date).format('dddd, MMM D')}`
                    : 'Dates unavailable'}
                </Text>
              </View>
              {/* Host row */}
              <View className="px-3 py-2">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name="crown"
                    size={20}
                    color={theme.secondaryIcon}
                    style={{ marginRight: 5, marginLeft: 5 }}
                  />
                  <Text
                    style={{
                      color: theme.secondaryText,
                      fontSize: 17,
                      marginLeft: 3,
                    }}
                  >
                    Hosted by
                  </Text>
                </View>
                {trip.host && (
                  <TouchableOpacity
                    className="flex-row items-center gap-3 mt-2"
                    onPress={() => {}}
                  >
                    <Image
                      source={{ uri: trip.host.avatar_url }}
                      className="w-10 h-10 rounded-full"
                    />
                    <Text
                      style={{
                        color: theme.primaryText,
                        fontSize: 20,
                        fontWeight: '700',
                      }}
                    >
                      {trip.host.name}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Country */}
                {trip.country && (
                  <View className="flex-row items-center mt-4 px-3">
                    <FontAwesome6
                      name="location-dot"
                      size={17}
                      color={theme.secondaryIcon}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        color: theme.secondaryText,
                        fontSize: 17,
                      }}
                    >
                      {trip.country}
                    </Text>
                  </View>
                )}
                {/* Description */}
                {trip.description && (
                  <Text
                    style={{
                      color: theme.secondaryText,
                      fontSize: 18,
                      marginTop: 16,
                    }}
                  >
                    {trip.description}
                  </Text>
                )}

                {/* Participants */}
                <View className="p-3">
                  <View className="flex-row justify-between items-center mt-4 mb-2 px-3">
                    <Text
                      style={{
                        color: theme.primaryText,
                        fontSize: 20,
                        fontWeight: '700',
                        textAlign: 'left',
                        marginLeft: -15,
                      }}
                    >
                      Participants ({participantCount})
                    </Text>
                    <BlurView
                      intensity={40}
                      tint={theme.blurTint as 'light' | 'dark' | 'default'}
                      style={{
                        borderColor: theme.secondaryOutline,
                        borderWidth: 1,
                        borderRadius: 9999,
                        overflow: 'hidden',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/trips/${tripId}/participants`)
                        }
                        className="px-4 py-1"
                        style={{ zIndex: 1 }}
                      >
                        <Text
                          style={{
                            color: theme.primaryText,
                            fontSize: 16,
                            fontWeight: '500',
                          }}
                        >
                          View All
                        </Text>
                      </TouchableOpacity>
                    </BlurView>
                  </View>
                  <ParticipantRowList
                    onSelect={onSelect}
                    onCountUpdate={onCountUpdate}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </MaskedView>
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
          status={
            (trip.status as 'upcoming' | 'ongoing' | 'ended') || 'upcoming'
          }
          handlePress={handlePress}
        />
      </View>
    </>
  );
}

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip } = useTrips(tripIdStr);

  // Use the trip's video background for theme, fallback to moonlight
  // This will update when the trip data changes (including when marked dirty and refreshed)
  const videoKey = trip?.video_background || 'moonlight';

  return (
    <TripThemeProvider videoKey={videoKey}>
      <TripDetailContent />
    </TripThemeProvider>
  );
}

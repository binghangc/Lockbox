import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Octicons from '@expo/vector-icons/Octicons';
import { BlurView } from 'expo-blur';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import TripPillbar from '@/components/tripPillbar';
import { useUser } from '@/components/UserContext';

interface TripHost {
  id: string;
  name: string;
  avatar_url: string;
}

interface Trip {
  id: string;
  title: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  host?: TripHost;
  country?: string;
  description?: string;
}

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
  const { user } = useUser();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const HEADER_HEIGHT = insets.top + 60;

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        if (res.ok) {
          setTrip(data);

          if (data.host?.id === user?.id) {
            setIsHost(true);
          } else {
            setIsHost(false);
          }
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tripId && user) fetchTrip();
  }, [tripId, user]);

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
          <Image
            source={{ uri: trip.thumbnail_url }}
            style={{ width: '100%', aspectRatio: 1, marginBottom: 20 }}
            resizeMode="cover"
          />
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

            {isHost && (
              <TouchableOpacity
                className="bg-white rounded-lg px-4 py-3 mt-6 self-center"
                onPress={() => router.push(`/trips/${trip.id}/itinerary`)}
              >
                <Text className="text-black font-semibold">Edit Itinerary</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <TripPillbar tripId={trip.id} isHost={isHost} />
    </View>
  );
}

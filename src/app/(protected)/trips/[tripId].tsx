import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TripHeader from '@/components/tripHeader';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips/${tripId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setTrip(data);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) fetchTrip();
  }, [tripId]);

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
    <>
      <TripHeader onBack={() => router.back()} />
      <ScrollView className="flex-1 bg-black" contentContainerStyle={{ paddingTop: insets.top + 20}}>
        <Image source={{ uri: trip.thumbnail_url }} className="w-full h-60" resizeMode="cover" />
        <View className="p-4">
          <Text className="text-white text-2xl font-bold">{trip.title}</Text>
          {trip.host && (
            <View className="flex-row items-center mt-2">
              <Image source={{ uri: trip.host.avatar_url }} className="w-6 h-6 rounded-full mr-2" />
              <Text className="text-neutral-300 text-base">Hosted by {trip.host.name}</Text>
            </View>
          )}
          {trip.description && (
            <Text className="text-white mt-4">{trip.description}</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}
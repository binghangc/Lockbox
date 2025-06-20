import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import ItineraryInput from '@/components/itineraryInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import dayjs from 'dayjs';
import useTrips from '@/hooks/useTrips';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const screenOptions = {
  headerShown: false,
};

const fallbackImage = require('../../../../../assets/lockicon.png');

export default function ItineraryScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip, isHost, loading, hasItinerary } = useTrips(tripIdStr);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyPlans, setDailyPlans] = useState<string[]>([]);

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

  const getTripDays = (start: string, end: string) => {
    const days = [];
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isBefore(last) || current.isSame(last)) {
      days.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    return days;
  };

  const tripDays = getTripDays(trip.start_date, trip.end_date);

  const handleNext = () => {
    if (currentIndex < tripDays.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleChangeText = (text: string) => {
    const newPlans = [...dailyPlans];
    newPlans[currentIndex] = text;
    setDailyPlans(newPlans);
  };

  const handleSubmit = async (d) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const payload = d.map((plan, index) => ({
        trip_id: trip.id,
        itinerary: plan,
        date: tripDays[index],
      }));

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/${trip.id}/submit-itinerary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await res.json();
      console.log('API response:', result);

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit itinerary');
      }

      router.back();
    } catch (err) {
      console.error('Itinerary submit error:', err.message);
    }
  };

  return (
    <ImageBackground
      source={trip.thumbnail_url ? { uri: trip.thumbnail_url } : fallbackImage}
      style={{ flex: 1 }}
      blurRadius={10}
    >
      <View className="px-5 py-20" style={{ paddingTop: insets.top + 10 }}>
        <Text className="text-white text-3xl font-extrabold mb-2">
          📍 Trip Itinerary: {trip.title}
        </Text>
        <Text className="text-neutral-400 text-base mb-4">
          Write down your trip plans — we’ll turn them into vibes later.
        </Text>
        <Text className="text-white text-xl font-bold">
          🗓️ {dayjs(tripDays[currentIndex]).format('dddd, MMM D')}
        </Text>

        <TextInput
          multiline
          value={dailyPlans[currentIndex]}
          onChangeText={handleChangeText}
          placeholder="What’s the plan for today?"
          placeholderTextColor="#ccc"
          className="mt-3 p-4 border rounded-lg text-white"
          style={{ minHeight: 120 }}
        />

        <View className="flex-row justify-between mt-4">
          <TouchableOpacity onPress={handleBack} disabled={currentIndex === 0}>
            <Text className="text-white text-lg">{'<'} Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={currentIndex === tripDays.length - 1}
          >
            <Text className="text-white text-lg">Next {'>'}</Text>
          </TouchableOpacity>
        </View>

        {currentIndex === tripDays.length - 1 && (
          <TouchableOpacity
            onPress={() => handleSubmit(dailyPlans)}
            className="mt-6 bg-white py-3 rounded-lg"
          >
            <Text className="text-black text-center font-bold">
              Submit Itinerary
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

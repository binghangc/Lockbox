import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import dayjs from 'dayjs';
import useTrips from '@/hooks/useTrips';
import ItineraryDayNavigator from '@/components/itineraryDayNavigator';
import useItineraries from '@/hooks/useItineraries';
import getTripDays from '@/utils/date';

export const screenOptions = {
  headerShown: false,
};

const fallbackImage = require('../../../../../assets/lockicon.png');

export default function ItineraryScreen() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip, loading } = useTrips(tripIdStr);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const tripDays = trip ? getTripDays(trip.start_date, trip.end_date) : [];

  const {
    dailyPlans,
    setDailyPlans,
    isEditing,
    isSubmitting,
    loading: itineraryLoading,
    submitItinerary,
  } = useItineraries(trip?.id, tripDays);

  if (loading || itineraryLoading) {
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

  const handleSubmit = () => {
    submitItinerary(
      dailyPlans,
      () => {
        Alert.alert(
          isEditing ? 'Itinerary Updated' : 'Itinerary Saved',
          isEditing
            ? 'Your trip plans were updated successfully.'
            : 'Your trip plans were submitted successfully.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      },
      (message) => {
        Alert.alert('Error', message || 'Something went wrong.');
      },
    );
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
          style={{ minHeight: 120, maxHeight: 400 }}
        />

        <ItineraryDayNavigator
          tripDays={tripDays}
          currentIndex={currentIndex}
          onBack={handleBack}
          onNext={handleNext}
          onSelectDay={setCurrentIndex}
        />

        {currentIndex === tripDays.length - 1 &&
          (isSubmitting ? (
            <View className="bg-white/10 py-3 mt-6 rounded-lg items-center">
              <Text className="text-white text-base">Saving...</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleSubmit(dailyPlans)}
              className="mt-6 bg-white py-3 rounded-lg"
            >
              <Text className="text-black text-center font-bold">
                {isEditing ? 'Edit Itinerary' : 'Submit Itinerary'}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </ImageBackground>
  );
}

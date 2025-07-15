import { useLocalSearchParams, useRouter } from 'expo-router';
import TripVisualBackground from '@/components/shared/tripVisualBackground';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import dayjs from 'dayjs';
import useTrips from '@/hooks/useTrips';
import ItineraryDayNavigator from '@/components/itineraryDayNavigator';
import useItineraries from '@/hooks/useItineraries';
import getTripDays from '@/utils/date';
import { TripThemeProvider, useTripTheme } from '@/context/TripThemeProvider';

export const screenOptions = {
  headerShown: false,
};

function ItineraryScreenContent() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip, loading } = useTrips(tripIdStr);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTripTheme();

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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color={theme.primaryText} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text style={{ color: theme.primaryText }}>Trip not found</Text>
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
    <View className="flex-1">
      <View
        className="px-5 py-20"
        style={{
          paddingTop: insets.top + (Platform.OS === 'android' ? 70 : 10),
        }}
      >
        <Text
          style={{
            color: theme.primaryText,
            fontSize: 24,
            fontWeight: '800',
            marginBottom: 8,
          }}
        >
          📍 Trip Itinerary: {trip.title}
        </Text>
        <Text
          style={{
            color: theme.secondaryText,
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          Write down your trip plans — we’ll turn them into vibes later.
        </Text>
        <Text
          style={{
            color: theme.primaryText,
            fontSize: 20,
            fontWeight: '700',
          }}
        >
          🗓️ {dayjs(tripDays[currentIndex]).format('dddd, MMM D')}
        </Text>

        <TextInput
          multiline
          value={dailyPlans[currentIndex]}
          onChangeText={handleChangeText}
          placeholder="What’s the plan for today?"
          placeholderTextColor={theme.secondaryText}
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
    </View>
  );
}

export default function ItineraryScreenWrapper() {
  const { tripId } = useLocalSearchParams();
  const tripIdStr = Array.isArray(tripId) ? tripId[0] : tripId;
  const { trip, loading } = useTrips(tripIdStr);
  const theme = useTripTheme();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color={theme.primaryText} />
      </View>
    );
  }

  return (
    <TripThemeProvider
      tripId={tripIdStr}
      videoKey={trip.video_background ?? 'moonlight'}
    >
      <TripVisualBackground videoKey={trip?.video_background ?? null} />
      <ItineraryScreenContent />
    </TripThemeProvider>
  );
}

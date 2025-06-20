import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VibeCheckScreen() {
  const { tripId } = useLocalSearchParams();
  const [itinerary, setItinerary] = useState<string>('');
  const [vibes, setVibes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setVibes([]);

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/vibechecks/vibe-check/${tripId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: itinerary }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (Array.isArray(data.vibes)) {
        setVibes(data.vibes);
      } else {
        throw new Error('Invalid response format from API.');
      }
    } catch (err) {
      console.error('Failed to fetch vibe:', err);
      setError(
        err.message || 'Failed to fetch vibe. Check console for details.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async () => {
    // if no vibecheck selected
    if (true) {
      console.warn('No vibecheck selected');
    }

    if (!token) {
      console.error('No token in context');
    }

    try {
      // index is the day index
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/vibechecks/${tripId}/${index}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: tripTitle,
            description: tripDescription,
            start_date: startDate,
            end_date: endDate,
            country: selectedCountry.name,
            thumbnail_url:
              thumbnailUrl ||
              'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/wine-hand.avif',
          }),
        });

      const data = await res.json();

      if (!res.ok) {
        console.error('Error saving trip:', data.error);
        return;
      }

      console.log('Trip saved:', data);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  };

  return (
    <View
      className="p-4 space-y-4"
      style={{ flex: 1, paddingTop: insets.top + 60 }}
    >
      <Text className="text-2xl font-semibold text-white">
        Generate Daily Vibe Check
      </Text>

      <TouchableOpacity
        className="bg-black py-3 rounded-lg items-center"
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text className="text-white font-medium">
          {isLoading ? 'Getting Vibes...' : 'Get Vibes'}
        </Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator className="mt-2" />}

      {error && <Text className="text-red-500">Error: {error}</Text>}

      {vibes.length > 0 &&
        vibes.map((vibe) => (
          <View
            key={vibe}
            className="bg-neutral-800 p-4 rounded-lg mt-4 space-y-2"
          >
            <Text className="text-white">{vibe}</Text>
          </View>
        ))}
    </View>
  );
}

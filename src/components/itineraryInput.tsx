import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ItineraryInput({ tripId }: { tripId: string }) {
  const [itinerary, setItinerary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!itinerary.trim()) {
      setError('Please set your itinerary.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/trips/itinerary/${tripId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itinerary }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to update itinerary:', err);
      setError(
        err.message || 'Failed to update itinerary. Check console for details.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="p-4 space-y-4">
      <Text className="text-2xl font-semibold text-white">
        Input Itinerary Here
      </Text>

      <TextInput
        className="h-32 p-3 rounded-lg border border-neutral-400 text-white"
        value={itinerary}
        onChangeText={setItinerary}
        placeholder="Paste your whole itinerary here..."
        placeholderTextColor="#aaa"
        editable={!isLoading}
        multiline
        scrollEnabled
        textAlignVertical="top"
      />

      <TouchableOpacity
        className="bg-black py-3 rounded-lg items-center"
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text className="text-white font-medium">
          {isLoading ? 'Submitting Itinerary...' : 'Submit Itinerary'}
        </Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator className="mt-2" />}

      {error && <Text className="text-red-500">Error: {error}</Text>}
    </View>
  );
}

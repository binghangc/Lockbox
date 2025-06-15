import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ItineraryInput({ tripId }: { tripId: string }) {
  const [itinerary, setItinerary] = useState<string>('');
  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

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
      const res = await fetch(
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

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
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

  const loadItinerary = async () => {
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
      if (data.itinerary) setItinerary(data.itinerary);
      if (data.title) setTitle(data.title);
      if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url);
    } else {
      console.error('Trip fetch error:', data.error);
    }
  };

  useEffect(() => {
    loadItinerary();
  }, []);

  return (
    <ImageBackground
      source={{ uri: thumbnailUrl }}
      style={{ flex: 1 }}
      blurRadius={10}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          padding: 16,
        }}
      >
        <Text className="text-white text-3xl font-extrabold mb-2">
          📍 Trip Itinerary: {title}
        </Text>
        <Text className="text-neutral-400 text-base mb-4">
          Write down your trip plans — we’ll turn them into vibes later.
        </Text>

        <TextInput
          value={itinerary}
          onChangeText={setItinerary}
          placeholder="Paste your whole itinerary here..."
          placeholderTextColor="#aaa"
          editable={!isLoading}
          multiline
          scrollEnabled
          textAlignVertical="top"
          style={{
            minHeight: 120,
            maxHeight: 540,
            borderWidth: 1,
            borderColor: '#aaa',
            borderRadius: 12,
            padding: 12,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
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
    </ImageBackground>
  );
}

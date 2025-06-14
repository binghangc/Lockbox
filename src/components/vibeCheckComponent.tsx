import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

export default function VibeCheckComponent() {
  const [itinerary, setItinerary] = useState<string>('');
  const [vibes, setVibes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  console.log(
    'Calling API:',
    `${process.env.EXPO_PUBLIC_API_URL}/vibechecks/vibe-check`,
  );

  const handleSubmit = async () => {
    if (!itinerary.trim()) {
      setError('Please set your itinerary.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVibes([]);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/vibechecks/vibe-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

  return (
    <View className="p-4 space-y-4">
      <Text className="text-2xl font-semibold text-white">
        Gemini Vibe Check
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
        textAlignVertical
      />

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

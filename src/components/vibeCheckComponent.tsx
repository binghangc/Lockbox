import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

export default function VibeCheckComponent() {
  const [prompt, setPrompt] = useState<string>('');
  const [vibe, setVibe] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  console.log(
    'Calling API:',
    `${process.env.EXPO_PUBLIC_API_URL}/vibechecks/vibe-check`,
  );

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVibe('');

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/vibechecks/vibe-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setVibe(data.vibe);
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
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter your scenario for a vibe check..."
        placeholderTextColor="#aaa"
        editable={!isLoading}
        multiline
      />

      <TouchableOpacity
        className="bg-black py-3 rounded-lg items-center"
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text className="text-white font-medium">
          {isLoading ? 'Getting Vibe...' : 'Get Vibe'}
        </Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator className="mt-2" />}

      {error && <Text className="text-red-500">Error: {error}</Text>}

      {vibe !== '' && (
        <View className="bg-neutral-800 p-4 rounded-lg mt-4">
          <Text className="text-white font-bold mb-2">Vibe:</Text>
          <Text className="text-white">{vibe}</Text>
        </View>
      )}
    </View>
  );
}

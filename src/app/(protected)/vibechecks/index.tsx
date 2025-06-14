import { View, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import VibeCheckComponent from '@/components/vibeCheckComponent';

export default function VibeCheckScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pl-3">
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          ),
          title: 'Vibe Chekcs',
        }}
      />
      <View className="flex-1 bg-black px-4 pt-6">
        <VibeCheckComponent />
      </View>
    </>
  );
}

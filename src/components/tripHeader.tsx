import React from 'react';
import { View, TouchableOpacity, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';

interface TripHeaderProps {
  onBack: () => void;
}

export default function TripHeader({ onBack }: TripHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute top-0 left-0 right-0 z-10">
      <BlurView intensity={60} experimentalBlurMethod="dimezisBlurView">
        <SafeAreaView style={{ paddingTop: insets.top + 20 }}>
          <View className="flex-row items-center px-4 py-2 mb-2">
            <TouchableOpacity onPress={onBack}>
              <Octicons name="chevron-left" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
}
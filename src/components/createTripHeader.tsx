import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CreateTripHeaderProps {
  onCancel: () => void;
  onSave: () => void;
  title: string;
}

export default function CreateTripHeader({ onCancel, onSave, title }: CreateTripHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView intensity={60} experimentalBlurMethod="dimezisBlurView" className="absolute top-0 left-0 right-0 z-10">
      <SafeAreaView style={{ paddingTop: insets.top + 20 }}>
        <View className="flex-row justify-between items-center px-4 py-2 mb-2">
          <TouchableOpacity onPress={onCancel}>
            <Text className="text-base font-semibold text-white">Cancel</Text>
          </TouchableOpacity>

          <Text className="text-xl font-bold text-white">{title}</Text>

          <TouchableOpacity onPress={onSave}>
            <Text className="text-base font-semibold text-white">Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  );
}